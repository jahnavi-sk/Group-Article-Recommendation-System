from flask import Flask, request, jsonify
from flask_cors import CORS 
from optimise import calculate_fitness
from hill import hill_climb
from normal import get_group_recommendations
from neo4j import GraphDatabase
import numpy as np

app = Flask(__name__)
CORS(app, supports_credentials=True)  # Allow all origins for dev

# Neo4j Configuration
URI = "neo4j://localhost:7687"
AUTH = ("neo4j", "jahnavi17")

@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    data = request.json
    interests = data.get('interests', [])
    print("interests = ",interests)
    if not interests:
        return jsonify({"error": "No interests provided"}), 400

    # Initialize Neo4j driver
    with GraphDatabase.driver(URI, auth=AUTH) as driver:
        # Step 1: Use GWO to find initial weights
        gwo_weights = [7.10054361, 7.10054361, 6.49529292]  # Example weights
        final_weights, final_score = hill_climb(gwo_weights, driver, interests)

        # Step 2: Get recommendations using the refined weights
        recommendations = get_group_recommendations(interests, driver, final_weights)

    return jsonify({
        "final_weights": final_weights.tolist(),
        "final_score": final_score,
        "recommendations": recommendations
    })

if __name__ == '__main__':
    app.run(debug=True)