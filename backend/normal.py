from neo4j import GraphDatabase

# --- Configuration ---
URI = "neo4j://localhost:7687"
AUTH = ("neo4j", "jahnavi17")
# The optimal weights found by your GWO script
OPTIMAL_WEIGHTS = [7.10054361, 7.10054361, 6.49529292] 
# --------------------

def get_group_recommendations(group_interests: list, driver, best_weights: list):
    """
    Takes a list of interests and returns the top 20 recommendations
    using the pre-calculated optimal weights.
    """
    w1, w2, w3 = best_weights
    
    query_params = {
        "interests": group_interests,
        "index_name": "papers_search_english",
        "w1": w1, "w2": w2, "w3": w3
    }
    
    cypher_query = """
    WITH $interests AS group_interests
    UNWIND group_interests AS interest_query
    CALL db.index.fulltext.queryNodes($index_name, interest_query) YIELD node AS work, score
    WHERE work.language = 'en'
    WITH work, count(DISTINCT interest_query) AS interests_matched, avg(score) AS avg_relevance
    WITH work, interests_matched, avg_relevance,
         (avg_relevance * $w1) + 
         (interests_matched * $w2) + 
         (log10(toInteger(work.citedByCount)+ 1) * $w3) AS group_score
    
    MATCH (work)-[:W_A_E]->(author:Author)
    WITH work, interests_matched, group_score, collect(author.displayName) AS authors

    RETURN work.displayName AS title, work.abstract AS summary, 'https://openalex.org/works/' + work.id AS url, group_score, interests_matched, authors
    ORDER BY interests_matched DESC, group_score DESC
    LIMIT 20
    """

    records, _, _ = driver.execute_query(cypher_query, query_params, database_="neo4j")
    
    return [dict(record) for record in records]