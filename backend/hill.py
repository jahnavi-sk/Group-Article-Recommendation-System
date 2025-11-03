# from optimise import calculate_fitness
# from neo4j import GraphDatabase
# import numpy as np

# URI = "neo4j://localhost:7687"
# AUTH = ("neo4j", "jahnavi17")

# def hill_climb(initial_weights, driver, group_interests, step_size=0.05, max_iterations=1):
#     current_weights = np.array(initial_weights)
#     current_fitness = calculate_fitness(current_weights, driver, group_interests)
    
#     for i in range(max_iterations):
#         print(f"Iteration {i+1}: Current Weights = {current_weights}, Current Fitness = {current_fitness}")
#         best_neighbor_weights = None
#         best_neighbor_fitness = -np.inf

#         for j in range(len(current_weights)):
#             neighbor_up = current_weights.copy()
#             neighbor_up[j] += step_size
#             fitness_up = calculate_fitness(neighbor_up, driver, group_interests)

#             neighbor_down = current_weights.copy()
#             neighbor_down[j] -= step_size
#             fitness_down = calculate_fitness(neighbor_down, driver, group_interests)

#             if fitness_up > best_neighbor_fitness:
#                 best_neighbor_fitness = fitness_up
#                 best_neighbor_weights = neighbor_up
            
#             if fitness_down > best_neighbor_fitness:
#                 best_neighbor_fitness = fitness_down
#                 best_neighbor_weights = neighbor_down

#         if best_neighbor_fitness > current_fitness:
#             current_weights = best_neighbor_weights
#             current_fitness = best_neighbor_fitness
#         else:
#             break
            
#     return current_weights, current_fitness


from optimise import calculate_fitness
from neo4j import GraphDatabase
import numpy as np
import concurrent.futures
from functools import partial

URI = "neo4j://localhost:7687"
AUTH = ("neo4j", "jahnavi17")

def hill_climb(initial_weights, driver, group_interests, step_size=0.05, max_iterations=10):
    current_weights = np.array(initial_weights)
    
    # We need a wrapper for the fitness function to use with the thread pool
    # It pre-fills the driver and group_interests arguments
    fitness_func = partial(calculate_fitness, driver=driver, group_interests=group_interests)
    
    current_fitness = fitness_func(weights=current_weights)
    
    print(f"Starting Parallel Hill Climbing. Initial Fitness = {current_fitness:.4f}")

    for i in range(max_iterations):
        # 1. Generate all neighbors for this iteration at once
        neighbors = []
        for j in range(len(current_weights)):
            neighbor_up = current_weights.copy()
            neighbor_up[j] += step_size
            neighbors.append(neighbor_up)

            neighbor_down = current_weights.copy()
            neighbor_down[j] -= step_size
            neighbors.append(neighbor_down)

        # 2. Calculate fitness for all neighbors in parallel
        with concurrent.futures.ThreadPoolExecutor() as executor:
            # The map function runs fitness_func on each item in the neighbors list
            fitness_scores = list(executor.map(fitness_func, neighbors))

        # 3. Find the best neighbor from the results
        best_neighbor_fitness = max(fitness_scores)
        best_neighbor_index = fitness_scores.index(best_neighbor_fitness)
        best_neighbor_weights = neighbors[best_neighbor_index]
        
        # 4. If the best neighbor is better than our current spot, move there
        if best_neighbor_fitness > current_fitness:
            current_weights = best_neighbor_weights
            current_fitness = best_neighbor_fitness
            print(f"  Iteration {i+1}: Found a better solution. New Fitness = {current_fitness:.4f}")
        else:
            # If no neighbor is better, we've reached a peak
            print("  No better neighbor found. Reached local optimum.")
            break
            
    return current_weights, current_fitness

# --- Example Usage ---
# with GraphDatabase.driver(URI, auth=AUTH) as driver:
#    gwo_weights = [0.95, 1.8, 0.4] # The output from your optimizer.py
#    interests = ['medical', 'artificial intelligence']
#    
#    final_weights, final_score = hill_climb_parallel(gwo_weights, driver, interests)
#    
#    print("\n--- Hill Climbing Finished ---")
#    print(f"Final refined weights: {final_weights}")
#    print(f"Final fitness score: {final_score}")