from neo4j import GraphDatabase
import numpy as np

# --- Neo4j Connection ---
URI = "neo4j://localhost:7687"
AUTH = ("neo4j", "jahnavi17")
driver = GraphDatabase.driver(URI, auth=AUTH)

def calculate_fitness(weights, driver, group_interests):
    """
    Executes the recommendation query with a given set of weights
    and returns a fitness score.
    """
    w1, w2, w3 = weights
    
    query_params = {
        "interests": group_interests,
        "index_name": "papers_search_english",
        "w1": w1,
        "w2": w2,
        "w3": w3
    }
    
    cypher_query = """
    WITH $interests AS group_interests
    UNWIND group_interests AS interest_query
    CALL db.index.fulltext.queryNodes($index_name, interest_query, {topK: 500}) YIELD node AS work, score
    WITH work, count(DISTINCT interest_query) AS interests_matched, avg(score) AS avg_relevance
    WITH work, interests_matched, avg_relevance,
         (avg_relevance * $w1) + 
         (interests_matched * $w2) + 
         (log10(toInteger(work.citedByCount) + 1) * $w3) AS group_score
    RETURN group_score
    ORDER BY group_score DESC
    LIMIT 20
    """

    records, _, _ = driver.execute_query(cypher_query, query_params, database_="neo4j")
    
    if not records:
        return 0

    total_score = sum([record["group_score"] for record in records])
    return total_score / len(records)