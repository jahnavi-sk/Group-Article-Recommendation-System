# train_model.py

from neo4j import GraphDatabase
from gwo import gwo_optimize
from hill import hill_climb

# --- Configuration ---
URI = "bolt://localhost:7687" # Use bolt:// for direct connection
AUTH = ("neo4j", "jahnavi17")

def main():
    # A set of diverse, representative interests to create a good general-purpose model.
    # This teaches the model how to handle both niche and broad topics.
    training_interests = ['machine learning', 'medicine', 'biology', 'pharmacology', 'ethics']
    
    print("--- Starting Offline Model Training ---")
    
    with GraphDatabase.driver(URI, auth=AUTH) as driver:
        # Step 1: Use GWO to find a strong starting point
        print("\n--- Running GWO Optimizer ---")
        gwo_weights, gwo_score = gwo_optimize(driver, training_interests)
        print(f"\nFinished GWO. Weights: {gwo_weights}, Score: {gwo_score:.4f}")

        # Step 2: Use Hill Climbing to refine the GWO weights to a sharp peak
        print("\n--- Running Hill Climbing Refinement ---")
        final_weights, final_score = hill_climb(gwo_weights, driver, training_interests)
        
        print("\n--- ✅ Training Complete ---")
        print(f"Final Optimized Weights: {final_weights.tolist()}")
        print(f"Final Fitness Score: {final_score}")
        print("\nACTION: Copy the 'Final Optimized Weights' list into your normal.py file.")

if __name__ == '__main__':
    main()