from optimise import calculate_fitness
from neo4j import GraphDatabase
import numpy as np

URI = "neo4j://localhost:7687"
AUTH = ("neo4j", "jahnavi17")

def hill_climb(initial_weights, driver, group_interests, step_size=0.05, max_iterations=8):
    current_weights = np.array(initial_weights)
    current_fitness = calculate_fitness(current_weights, driver, group_interests)
    
    for i in range(max_iterations):
        print(f"Iteration {i+1}: Current Weights = {current_weights}, Current Fitness = {current_fitness}")
        best_neighbor_weights = None
        best_neighbor_fitness = -np.inf

        for j in range(len(current_weights)):
            neighbor_up = current_weights.copy()
            neighbor_up[j] += step_size
            fitness_up = calculate_fitness(neighbor_up, driver, group_interests)

            neighbor_down = current_weights.copy()
            neighbor_down[j] -= step_size
            fitness_down = calculate_fitness(neighbor_down, driver, group_interests)

            if fitness_up > best_neighbor_fitness:
                best_neighbor_fitness = fitness_up
                best_neighbor_weights = neighbor_up
            
            if fitness_down > best_neighbor_fitness:
                best_neighbor_fitness = fitness_down
                best_neighbor_weights = neighbor_down

        if best_neighbor_fitness > current_fitness:
            current_weights = best_neighbor_weights
            current_fitness = best_neighbor_fitness
        else:
            break
            
    return current_weights, current_fitness