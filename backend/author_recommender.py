# author_recommender.py

def get_similar_authors(author_name: str, driver):
    """
    Finds authors who share the most concepts with a given author.
    """
    print(f"Finding authors similar to: {author_name}")
    
    query_params = {"authorName": author_name}
    
    cypher_query = """
    // 1. Start with an author you're interested in
    MATCH (startAuthor:Author {displayName: $authorName})

    // 2. Find all the concepts they are associated with
    MATCH (startAuthor)-[:A_C_E]->(concept:Concept)

    // 3. Find other authors (but not the same one) connected to those concepts
    MATCH (similarAuthor:Author)-[:A_C_E]->(concept)
    WHERE startAuthor <> similarAuthor

    // 4. Count the shared concepts and order by the count
    WITH similarAuthor, count(concept) AS shared_concepts
    ORDER BY shared_concepts DESC
    LIMIT 10

    // 5. Return the top 10 most similar authors
    RETURN similarAuthor.displayName AS authorName, shared_concepts
    """

    records, _, _ = driver.execute_query(cypher_query, query_params, database_="neo4j")
    
    return [dict(record) for record in records]



# author_recommender.py (continued)

def get_expert_authors(topics, institution, driver):
    cypher_query = """
    MATCH (a:Author)-[:HAS_INTEREST]->(c:Concept)
    WHERE c.displayName IN $topics
      AND (
        $institution = "" OR
        toLower(a.affiliation) CONTAINS toLower($institution)
      )
    WITH a, count(DISTINCT c) AS matched_topics
    ORDER BY matched_topics DESC
    RETURN a.displayName AS name,
           a.affiliation AS affiliation,
           [rel IN (a)-[:HAS_INTEREST]->(c2:Concept) | c2.displayName] AS interests,
           'https://openalex.org/authors/' + a.id AS url
    LIMIT 20
    """
    params = {"topics": topics, "institution": institution}
    records, _, _ = driver.execute_query(cypher_query, params, database_="neo4j")
    return [dict(record) for record in records]
