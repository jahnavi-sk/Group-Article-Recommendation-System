from neo4j import GraphDatabase
import json

class OpenAlexGraph:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def create_author(self, author):
        with self.driver.session() as session:
            session.run(
                """
                MERGE (a:Author {id: $id})
                SET a.name = $name
                """,
                id=author['id'],
                name=author['display_name']
            )

    def create_institution(self, institution):
        with self.driver.session() as session:
            session.run(
                """
                MERGE (i:Institution {id: $id})
                SET i.name = $name, i.country = $country
                """,
                id=institution['id'],
                name=institution['display_name'],
                country=institution.get('country_code', 'Unknown')
            )

    def create_work(self, work):
        with self.driver.session() as session:
            session.run(
                """
                MERGE (w:Work {id: $id})
                SET w.title = $title, w.date = $publication_date, w.language = $language
                """,
                id=work['id'],
                title=work['display_name'],
                publication_date=work.get('publication_date', 'Unknown'),
                language=work.get('language', 'Unknown')
            )

    def create_relationships(self, author, work):
        with self.driver.session() as session:
            session.run(
                """
                MATCH (a:Author {id: $author_id})
                MATCH (w:Work {id: $work_id})
                MERGE (a)-[:AUTHORED]->(w)
                """,
                author_id=author['id'],
                work_id=work['id']
            )

# Load sample data
with open('authors.json') as f:
    authors_data = json.load(f)

with open('works.json') as f:
    works_data = json.load(f)

# Initialize Neo4j driver
graph = OpenAlexGraph("bolt://localhost:7474", "neo4j", "password")

# Insert data into Neo4j
display_limit = 5  # Limiting to 5 for demonstration purposes
for author in authors_data[:display_limit]:
    graph.create_author(author)
    for affiliation in author.get('affiliations', []):
        graph.create_institution(affiliation['institution'])

for work in works_data[:display_limit]:
    graph.create_work(work)
    for authorship in work['authorships']:
        graph.create_relationships(authorship['author'], work)

graph.close()
