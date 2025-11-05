# from neo4j import GraphDatabase

# # --- Configuration ---
# URI = "neo4j://localhost:7687"
# AUTH = ("neo4j", "jahnavi17")
# # The optimal weights found by your GWO script
# OPTIMAL_WEIGHTS = [7.10054361, 7.10054361, 6.49529292] 
# # --------------------

# def get_group_recommendations(group_interests: list, driver, best_weights: list):
#     """
#     Takes a list of interests and returns the top 20 recommendations
#     using the pre-calculated optimal weights.
#     """
#     w1, w2, w3 = best_weights
    
#     query_params = {
#         "interests": group_interests,
#         "index_name": "papers_search_english",
#         "w1": w1, "w2": w2, "w3": w3
#     }
    
#     cypher_query = """
#     WITH $interests AS group_interests
#     UNWIND group_interests AS interest_query
#     CALL db.index.fulltext.queryNodes($index_name, interest_query, {topK: 500}) YIELD node AS work, score
    
#     WHERE work.language = 'en'
    
#     WITH work, count(DISTINCT interest_query) AS interests_matched, avg(score) AS avg_relevance
    
#     // Calculate the group_score for each work
#     WITH work, interests_matched, avg_relevance,
#          (avg_relevance * $w1) + 
#          (interests_matched * $w2) + 
#          (log10(toInteger(work.citedByCount) + 1) * $w3) AS group_score
         
#     // --- THE FIX IS HERE ---
#     // First, order by the score and select the TOP 20 works
#     WITH work, interests_matched, group_score
#     ORDER BY interests_matched DESC, group_score DESC
#     LIMIT 20
    
#     // Second, find the authors for ONLY those top 20 works
#     MATCH (work)-[:W_A_E]->(author:Author)
    
#     // Third, collect the author names for each work
#     WITH work, interests_matched, group_score, collect(author.displayName) AS authors

#     // Finally, return the complete results, re-ordering them correctly
#     RETURN work.displayName AS title, 
#            work.abstract AS summary, 
#            'https://openalex.org/works/' + work.id AS url, 
#            group_score, 
#            interests_matched, 
#            authors
           
#     ORDER BY interests_matched DESC, group_score DESC
#     """

#     records, _, _ = driver.execute_query(cypher_query, query_params, database_="neo4j")
    
#     return [dict(record) for record in records]


# normal.py

from neo4j import GraphDatabase
from train_model import trainingMod

# --- Configuration ---
URI = "bolt://localhost:7687"
AUTH = ("neo4j", "jahnavi17")

# --- 🧠 Your Pre-Trained Model ---
# Paste the weights you got from running train_model.py here.
# OPTIMAL_WEIGHTS = [5.499999999999998, 3.2693401917931966, 1.7274545983481469]    # <-- UPDATE THIS VALUE
# OPTIMAL_WEIGHTS = [5.499999999999998, 3.2693401917931966, 1.7274545983481469]    # <-- UPDATE THIS VALUE

# ----------------------------------

def get_group_recommendations(group_interests: list, driver,email):
    """
    Takes a list of interests and returns the top 20 recommendations
    using the pre-calculated optimal weights.
    """
    # This function no longer needs to accept 'best_weights'
    OPTIMAL_WEIGHTS = trainingMod(group_interests)
    print(f"Using Optimal Weights: {OPTIMAL_WEIGHTS}")
    w1, w2, w3 = OPTIMAL_WEIGHTS
    
    query_params = {
        "interests": group_interests,
        "index_name": "papers_search_english",
        "w1": w1, "w2": w2, "w3": w3,
        "email":email
    }
    
    # This is your existing, well-tuned Cypher query
    cypher_query = """
    WITH $interests AS group_interests
UNWIND group_interests AS interest_query
CALL db.index.fulltext.queryNodes($index_name, interest_query, {topK: 500}) 
YIELD node AS work, score

WHERE work.language = 'en'

WITH work, count(DISTINCT interest_query) AS interests_matched, avg(score) AS avg_relevance

WITH work, interests_matched, avg_relevance,
     (avg_relevance * $w1) + 
     (interests_matched * $w2) + 
     (log10(toInteger(work.citedByCount) + 1) * $w3) AS group_score

// 🔥 Check if the given user has liked this work
OPTIONAL MATCH (u:User {email: $email})-[r:U_W_E]->(work)

// Collect authors
OPTIONAL MATCH (work)-[:W_A_E]->(author:Author)

WITH work, interests_matched, group_score,
     collect(DISTINCT {name: author.displayName, id: author.id}) AS authors,
     r

ORDER BY interests_matched DESC, group_score DESC
LIMIT 20

RETURN 
  work.displayName AS title, 
  work.id AS id,
  work.abstract AS summary, 
  'https://openalex.org/works/' + work.id AS url, 
  group_score, 
  interests_matched, 
  authors,
  CASE WHEN r IS NOT NULL THEN true ELSE false END AS liked

    """

    records, _, _ = driver.execute_query(cypher_query, query_params, database_="neo4j")
    
    return [dict(record) for record in records]