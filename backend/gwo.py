import numpy as np
import concurrent.futures
from functools import partial
from optimise import calculate_fitness # Assuming this is in your other file

def gwo_optimize(driver, group_interests, num_wolves=20, num_weights=3, max_iterations=5, lower_bound=0.0, upper_bound=5.0):
    # 1. Initialize the wolf population with random weights
    population = lower_bound + (upper_bound - lower_bound) * np.random.rand(num_wolves, num_weights)

    # Keep track of the best solution found so far
    alpha_wolf_pos = np.zeros(num_weights)
    alpha_wolf_score = -np.inf

    # Create a partial function for parallel execution
    fitness_func = partial(calculate_fitness, driver=driver, group_interests=group_interests)

    # 2. Main optimization loop
    for iter_num in range(max_iterations):
        
        # --- OPTIMIZATION 1: PARALLEL FITNESS CALCULATION ---
        # This tells the script to run a maximum of 4 queries at the same time.
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:  
            fitness_scores = list(executor.map(fitness_func, population))
        
        # Find the top three wolves (alpha, beta, delta)
        sorted_indices = np.argsort(fitness_scores)[::-1]
        alpha_pos = population[sorted_indices[0]]
        beta_pos = population[sorted_indices[1]]
        delta_pos = population[sorted_indices[2]]

        # Update the overall best solution
        if fitness_scores[sorted_indices[0]] > alpha_wolf_score:
            alpha_wolf_score = fitness_scores[sorted_indices[0]]
            alpha_wolf_pos = alpha_pos

        # GWO parameter 'a' decreases linearly from 2 to 0
        a = 2 - iter_num * (2 / max_iterations)

        # --- OPTIMIZATION 2: VECTORIZED POSITION UPDATES ---
        # Instead of a for-loop, we do the math on all wolves at once.
        r1 = np.random.rand(num_wolves, num_weights)
        r2 = np.random.rand(num_wolves, num_weights)
        
        A1 = 2 * a * r1 - a
        C1 = 2 * r2
        D_alpha = np.abs(C1 * alpha_pos - population)
        X1 = alpha_pos - A1 * D_alpha
        
        r1 = np.random.rand(num_wolves, num_weights)
        r2 = np.random.rand(num_wolves, num_weights)

        A2 = 2 * a * r1 - a
        C2 = 2 * r2
        D_beta = np.abs(C2 * beta_pos - population)
        X2 = beta_pos - A2 * D_beta
        
        r1 = np.random.rand(num_wolves, num_weights)
        r2 = np.random.rand(num_wolves, num_weights)

        A3 = 2 * a * r1 - a
        C3 = 2 * r2
        D_delta = np.abs(C3 * delta_pos - population)
        X3 = delta_pos - A3 * D_delta
        
        # Update the entire population array in one step
        population = (X1 + X2 + X3) / 3

        # Clip positions to stay within the defined bounds
        population = np.clip(population, lower_bound, upper_bound)
        
        print(f"Iteration {iter_num + 1}/{max_iterations}: Best Fitness Score = {alpha_wolf_score:.4f}")

    return alpha_wolf_pos, alpha_wolf_score