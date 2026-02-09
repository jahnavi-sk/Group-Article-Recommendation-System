# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests 
# No longer need to import the slow optimizers
from normal import get_group_recommendations
from neo4j import GraphDatabase
from functools import lru_cache
from author_recommender import get_similar_authors, get_expert_authors
from flask import request, jsonify
from flask_bcrypt import Bcrypt 
bcrypt = Bcrypt()


app = Flask(__name__)
CORS(app, origins="*", supports_credentials=True)

# Neo4j Configuration
URI = "bolt://localhost:7687" # Use bolt:// for direct connection
AUTH = ("neo4j", "jahnavi17")

# --- Caching Layer for Instantaneous Repeat Queries ---
@lru_cache(maxsize=128)
def get_cached_recommendations(interests_tuple: tuple, driver,email):
    """
    A cached wrapper around your main recommendation function.
    """
    interests_list = list(interests_tuple)
    print(f"--- Cache miss for {interests_list}. Running query. ---")
    return get_group_recommendations(interests_list, driver,email)




    
@app.route('/recommendations', methods=['POST'])
def get_recommendations_endpoint():
    print("Received recommendation request")
    data = request.json
    mode = data.get('mode', 'individual')
    email = data.get('email')
    print("Request mode =", mode)
    # INDIVIDUAL MODE
    if mode == 'individual':
        interests = data.get('interests', [])
        institution = data.get('institution', '')
        print("individual interests =", interests, "institution =", institution)
        if not interests:
            return jsonify({"error": "No interests provided"}), 400

        with GraphDatabase.driver(URI, auth=AUTH) as driver:
            recommendations = get_cached_recommendations(tuple(sorted(interests)), driver,email)
            print("Recommendations fetched:", recommendations)
            # ✅ Add liked info if user is known
            if email:
                print("Fetching liked works for user:", email)
                liked_query = """
                MATCH (u:User {email: $email})-[r:U_W_E {type:'LIKED'}]->(w:Work)
                RETURN w.id AS id
                """
                with driver.session() as session:
                    liked_ids = {record["id"] for record in session.run(liked_query, email=email)}
                    print()
                    print()
                    print("---------------------------------------------")
                    print()
                    print("Liked IDs:", liked_ids)
                    print()
                    print("---------------------------------------------")
                    for rec in recommendations:
                        rec["liked"] = rec.get("id") in liked_ids



        return jsonify({"recommendations": recommendations})

    # GROUP MODE
    elif mode == 'group':
        members = data.get('members', [])
        print("group members =", members)
        if not members or all(len(m.get('topics', [])) == 0 for m in members):
            return jsonify({"error": "No member topics provided"}), 400

        all_topics = []
        all_institutions = []
        for m in members:
            all_topics.extend(m.get('topics', []))
            if m.get('institution'):
                all_institutions.append(m['institution'])
        print("all_topics =", all_topics)
        print("all_institutions =", all_institutions)

        with GraphDatabase.driver(URI, auth=AUTH) as driver:
            recommendations = get_cached_recommendations(tuple(sorted(all_topics)), driver,email)
            print("Recommendations fetched:", recommendations)
            # ✅ Same liked check for group user (if logged in)
            print(email)
            if email:
                print()
                print("Fetching liked works for user:", email)
                liked_query = """
                MATCH (u:User {email: $email})-[r:U_W_E {type:'LIKED'}]->(w:Work)
                RETURN w.id AS id
                """
                with driver.session() as session:
                    liked_ids = {record["id"] for record in session.run(liked_query, email=email)}
                    print()
                    print()
                    print("---------------------------------------------")
                    print()
                    print("Liked IDs:", liked_ids)
                    print()
                    print("---------------------------------------------")
                    # liked_ids = {record["id"] for record in session.run(liked_query, email=email)}
                    for rec in recommendations:
                        rec["liked"] = rec.get("id") in liked_ids
                print("Updated recommendations with liked info.")

        print()
        print()
        print()

        print("Final recommendations:", recommendations)
        return jsonify({"recommendations": recommendations})

    else:
        return jsonify({"error": "Invalid mode"}), 400


@app.route('/authors/similar', methods=['POST'])
def recommend_similar_authors():
    data = request.json
    author_name = data.get('author_name', '')
    if not author_name:
        return jsonify({"error": "No author_name provided"}), 400
    
    with GraphDatabase.driver(URI, auth=AUTH) as driver:
        recommendations = get_similar_authors(author_name, driver)
    
    return jsonify({"recommendations": recommendations})

@app.route('/authors/experts', methods=['POST'])
def recommend_expert_authors():
    data = request.json
    institution = data.get('institution', '')
    topics = data.get('topics', [])
    if not topics:
        return jsonify({"error": "No topics provided"}), 400

    with GraphDatabase.driver(URI, auth=AUTH) as driver:
        recommendations = get_expert_authors(topics, institution, driver)
    return jsonify({"recommendations": recommendations})


def get_authors_for_topics(topics, institutions, driver):
    cypher_query = """
    WITH $topics AS inputInterests, $institutions AS preferredInstitutions
    UNWIND inputInterests AS inputInterest
    CALL db.index.fulltext.queryNodes("papers_search_english", inputInterest, {topK: 500}) 
    YIELD node AS work, score
    MATCH (author:Author)<-[:W_A_E]-(work)
    WITH author, preferredInstitutions, collect(DISTINCT inputInterest) AS matchedInterestsList
    WITH author, preferredInstitutions, size(matchedInterestsList) AS interestsMatched
    OPTIONAL MATCH (author)-[:A_I_E]->(inst:Institution)
    WITH author, interestsMatched, preferredInstitutions, collect(DISTINCT inst.displayName) AS institutions
    WITH author, interestsMatched, institutions,
         CASE WHEN any(i IN institutions WHERE i IN preferredInstitutions) THEN 100000000 ELSE 0 END AS institution_bonus,
         (interestsMatched * 50000000) AS consensus_bonus,
         coalesce(toInteger(author.hIndex), 0) AS hIndex,
         coalesce(toInteger(author.i10Index), 0) AS i10Index,
         coalesce(toInteger(author.citedByCount), 0) AS citedByCount
    WITH author, consensus_bonus, institution_bonus, hIndex, i10Index, citedByCount, interestsMatched,
         (institution_bonus + consensus_bonus + (hIndex * 100000) + (i10Index * 1000) + citedByCount) AS final_score
    RETURN author.displayName AS name, author.id AS id,
           final_score, 
           interestsMatched,
           hIndex, 
           i10Index, 
           citedByCount, 
           CASE WHEN institution_bonus > 0 THEN true ELSE false END AS isPreferred
    ORDER BY final_score DESC
    LIMIT 20
    """
    params = {
        "topics": topics,
        "institutions": institutions
    }
    records, _, _ = driver.execute_query(cypher_query, params, database_="neo4j")
    print("Author recommendation records:", records)
    return [dict(record) for record in records]


@app.route('/author-topic-recommendations', methods=['POST'])
def author_topic_recommendations():
    data = request.json
    topics = data.get('topics', [])
    institutions = data.get('institutions', [])
    if not topics:
        return jsonify({"error": "No topics provided"}), 400

    with GraphDatabase.driver(URI, auth=AUTH) as driver:
        recommendations = get_authors_for_topics(topics, institutions, driver)
    return jsonify({"recommendations": recommendations})



@app.route('/problem-statement', methods=['POST'])
def problem_statement():
    data = request.json
    abstracts = data.get('abstracts', [])
    if len(abstracts) < 5:
        return jsonify({"error": "Need 5 abstracts"}), 400

    prompt = (
        "I will be giving you 5 abstracts of papers. Can you give good unique research problem statements inspired from them? List out the problem statements and their scope only.\n\n"
        + "\n".join([f"abstract {i+1}: {ab}" for i, ab in enumerate(abstracts)])
    )

    # Call Ollama Llama 3.2 (adjust URL and payload as per your Ollama setup)
    ollama_url = "http://localhost:11434/api/generate"
    response = requests.post(
        ollama_url,
        json={
            "model": "llama3.2:latest",
            "prompt": prompt,
            "stream": False
        },
        timeout=60
    )
    if response.status_code != 200:
        return jsonify({"error": "Ollama call failed"}), 500

    result = response.json()
    problem_statement = result.get("response", "").strip()
    # print("Generated problem statement:", problem_statement)
    return jsonify({"problem_statement": problem_statement})
    


_SIGNUP_QUERY = """
WITH $email AS email, 
     $passwordHash AS passwordHash,
     $interests AS interests

MERGE (u:User {email: email})
SET u.password_hash = passwordHash,
    u.created_at = datetime(),
    u.interests = interests

WITH u, email, interests

// Find matching concepts for ANY of the provided interests (Case Insensitive)
OPTIONAL MATCH (interest_match)
WHERE (interest_match:Concept OR interest_match:Topic OR interest_match:Keyword)
  AND any(i IN interests WHERE toLower(interest_match.displayName) CONTAINS toLower(i))

// Create relationships if matches found
FOREACH (_ IN CASE WHEN interest_match IS NOT NULL THEN [1] ELSE [] END |
    MERGE (u)-[:U_I_E]->(interest_match)
)

RETURN u.email AS UserEmail, count(interest_match) AS LinksCreated
"""

def signup_user(email, password_hash, interests, driver):
    print("Signing up user:", email, "with interests:", interests)
    params = {
        "email": email,
        "passwordHash": password_hash,
        "interests": interests
    }
    records, _, _ = driver.execute_query(_SIGNUP_QUERY, params, database_="neo4j")
    return [dict(record) for record in records]


@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    interests = data.get('interests', [])

    if not all([email, password, interests]):
        return jsonify({"error": "Missing email, password, or interests"}), 400

    password_hash = bcrypt.generate_password_hash(password.encode('utf-8')).decode('utf-8')

    try:
        with GraphDatabase.driver(URI, auth=AUTH) as driver:
            result = signup_user(email, password_hash, interests, driver)
            return jsonify(result)
            

    except Exception as e:
        print(f"Database error during signup: {e}")
        return jsonify({"error": "Signup failed due to database error"}), 500


driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "jahnavi17"))

# @app.route("/like-work", methods=["POST"])
# def like_work():
#     data = request.get_json()
#     email = data.get("email")
#     work_id = data.get("workId")

#     if not email or not work_id:
#         return jsonify({"error": "Missing email or workId"}), 400

#     query = """
#     MATCH (u:User {email: $email})
# MATCH (w:Work {id: $work_id})
# MERGE (u)-[r:U_W_E {type: 'LIKED'}]->(w)
# SET w.likes = coalesce(w.like, 0) + 1
# RETURN w.id AS work_id, w.like AS like_count
#     """

    
#     with driver.session() as session:
#         session.run(query, email=email, work_id=work_id)

#     return jsonify({"message": f"Work {work_id} liked by {email}"}), 200


@app.route("/like-work", methods=["POST"])
def like_or_unlike_work():
    data = request.get_json()
    email = data.get("email")
    work_id = data.get("workId")

    if not email or not work_id:
        return jsonify({"error": "Missing email or workId"}), 400

    with GraphDatabase.driver(URI, auth=AUTH) as driver:
        with driver.session() as session:
            # Check if relationship already exists
            check_query = """
            MATCH (u:User {email: $email})-[r:U_W_E {type:'LIKED'}]->(w:Work {id: $work_id})
            RETURN COUNT(r) AS rel_count
            """
            result = session.run(check_query, email=email, work_id=work_id).single()
            rel_exists = result["rel_count"] > 0

            if rel_exists:
                # --- UNLIKE: delete relationship & decrement count ---
                delete_query = """
                MATCH (u:User {email: $email})-[r:U_W_E {type:'LIKED'}]->(w:Work {id: $work_id})
                DELETE r
                SET w.likes = coalesce(w.likes, 1) - 1
                RETURN w.id AS work_id, w.likes AS likes
                """
                action = "unliked"
                result = session.run(delete_query, email=email, work_id=work_id).single()
            else:
                # --- LIKE: create relationship & increment count ---
                like_query = """
                MATCH (u:User {email: $email})
                MATCH (w:Work {id: $work_id})
                MERGE (u)-[:U_W_E {type:'LIKED'}]->(w)
                SET w.likes = coalesce(w.likes, 0) + 1
                RETURN w.id AS work_id, w.likes AS likes
                """
                action = "liked"
                result = session.run(like_query, email=email, work_id=work_id).single()

    return jsonify({
        "action": action,
        "work_id": result["work_id"],
        "likes": result["likes"]
    }), 200


@app.route('/similar-user-works', methods=['POST'])
def get_similar_user_works():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"error": "Missing user email"}), 400

    query = """
    MATCH (u1:User {email: $email })-[:U_I_E]->(i)
WHERE (i:Concept OR i:Topic OR i:Keyword)
MATCH (u2:User)-[:U_I_E]->(i)
WHERE u1 <> u2
WITH u1, u2, COUNT(DISTINCT i) AS shared_interests
ORDER BY shared_interests DESC
LIMIT 5

// Now get works liked by similar users but not by u1
MATCH (u2)-[:U_W_E {type:'LIKED'}]->(w:Work)
WHERE NOT ( (u1)-[:U_W_E {type:'LIKED'}]->(w) )
RETURN DISTINCT 
       w.id AS id, 
       w.displayName AS title, 
       w.abstract AS summary, 
       'https://openalex.org/works/' + w.id AS url,
       [(w)<-[:W_A_E]-(a:Author) | {name:a.name, id:a.id}] AS authors,
       w.likes AS likes,
       shared_interests AS score
ORDER BY score DESC, w.likes DESC
LIMIT 20
    """

    with GraphDatabase.driver(URI, auth=AUTH) as driver:
        with driver.session() as session:
            results = session.run(query, email=email)
            # print("Similar user works query executed for email:", email)
            works = [record.data() for record in results]


    print("Similar user works for", email, ":", works)
    return jsonify({"recommendations": works})


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    with GraphDatabase.driver(URI, auth=AUTH) as driver:
        with driver.session() as session_db:
            query = """
            MATCH (u:User {email: $email})
            RETURN u.password_hash AS password_hash
            """
            result = session_db.run(query, email=email).single()
            if not result:
                return jsonify({"error": "User not found"}), 401

            password_hash = result["password_hash"]
            if not bcrypt.check_password_hash(password_hash, password.encode('utf-8')):
                return jsonify({"error": "Incorrect password"}), 401

    # Optionally, set session or token here
    return jsonify({"message": "Login successful", "email": email}), 200


@app.route('/get-profile', methods=['POST'])
def get_profile():
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({"error": "Missing email"}), 400

    with GraphDatabase.driver(URI, auth=AUTH) as driver:
        with driver.session() as session:
            query = """
            MATCH (u:User {email: $email})
            OPTIONAL MATCH (u)-[:U_W_E {type:'LIKED'}]->(w:Work)
            WITH u, collect(DISTINCT w) AS works
            RETURN u.email AS email, toString(u.created_at) AS created_at,
                   [x IN works WHERE x IS NOT NULL | {id: x.id, title: x.displayName, summary: x.abstract}] AS liked_works
            """
            result = session.run(query, email=email).single()
            
            if not result:
                return jsonify({"error": "User not found"}), 404
            
            return jsonify({
                "name": result["email"].split('@')[0],
                "email": result["email"],
                "member_since": result["created_at"] or "Unknown",
                "account_type": "Standard",
                "liked_works": result["liked_works"]
            }), 200


@app.route('/delete-account', methods=['DELETE'])
def delete_account():
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({"error": "Missing email"}), 400

    with GraphDatabase.driver(URI, auth=AUTH) as driver:
        with driver.session() as session:
            query = "MATCH (u:User {email: $email}) DETACH DELETE u"
            session.run(query, email=email)
            
    return jsonify({"message": "Account deleted successfully"}), 200


if __name__ == '__main__':
    # Migration: Initialize 'interests' for existing users to suppress Neo4j warnings
    try:
        with GraphDatabase.driver(URI, auth=AUTH) as driver:
            with driver.session() as session:
                session.run("MATCH (u:User) WHERE u.interests IS NULL SET u.interests = []")
    except Exception as e:
        print(f"Migration skipped: {e}")
    app.run(debug=True)