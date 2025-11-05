# import numpy as np
# from neo4j import GraphDatabase


# def gwo(fitness_fn, dim=3, n_wolves=20, max_iter=10, w_min=-10, w_max=10):
#     # Initialize wolves randomly within bounds
#     wolves = np.random.uniform(w_min, w_max, (n_wolves, dim))
    
#     alpha = np.zeros(dim)
#     beta = np.zeros(dim)
#     delta = np.zeros(dim)
#     alpha_score = beta_score = delta_score = -np.inf
    
#     for t in range(max_iter):
#         # --- Evaluate fitness for all wolves ---
#         for w in wolves:
#             score = fitness_fn(w)
#             if score > alpha_score:
#                 delta, beta, alpha = beta.copy(), alpha.copy(), w.copy()
#                 delta_score, beta_score, alpha_score = beta_score, alpha_score, score
#             elif score > beta_score:
#                 delta, beta = beta.copy(), w.copy()
#                 delta_score, beta_score = beta_score, score
#             elif score > delta_score:
#                 delta, delta_score = w.copy(), score

#         # --- Update positions ---
#         a = 2 - t * (2 / max_iter)
#         for i in range(n_wolves):
#             A1 = 2 * a * np.random.rand(dim) - a
#             C1 = 2 * np.random.rand(dim)
#             D_alpha = abs(C1 * alpha - wolves[i])
#             X1 = alpha - A1 * D_alpha

#             A2 = 2 * a * np.random.rand(dim) - a
#             C2 = 2 * np.random.rand(dim)
#             D_beta = abs(C2 * beta - wolves[i])
#             X2 = beta - A2 * D_beta

#             A3 = 2 * a * np.random.rand(dim) - a
#             C3 = 2 * np.random.rand(dim)
#             D_delta = abs(C3 * delta - wolves[i])
#             X3 = delta - A3 * D_delta

#             # Combine the 3 leaders' positions
#             wolves[i] = (X1 + X2 + X3) / 3.0

#             # --- Clamp wolf position within bounds ---
#             wolves[i] = np.clip(wolves[i], w_min, w_max)

#     return alpha, alpha_score

# def hill_climb(fitness_fn, start, step_size=0.1, max_iter=100):
#     current = start.copy()
#     current_score = fitness_fn(current)

#     for _ in range(max_iter):
#         neighbor = current + np.random.uniform(-step_size, step_size, len(current))
#         score = fitness_fn(neighbor)
#         if score > current_score:
#             current, current_score = neighbor, score
#     return current, current_score


# def pso(fitness_fn, dim=3, n_particles=20, max_iter=50, w=0.5, c1=1.5, c2=1.5):
#     pos = np.random.uniform(-5, 5, (n_particles, dim))
#     vel = np.zeros((n_particles, dim))
#     pbest = pos.copy()
#     pbest_val = np.array([fitness_fn(p) for p in pos])
#     gbest = pbest[np.argmax(pbest_val)]

#     for _ in range(max_iter):
#         r1, r2 = np.random.rand(), np.random.rand()
#         vel = w*vel + c1*r1*(pbest - pos) + c2*r2*(gbest - pos)
#         pos += vel
#         vals = np.array([fitness_fn(p) for p in pos])
#         better = vals > pbest_val
#         pbest[better], pbest_val[better] = pos[better], vals[better]
#         gbest = pbest[np.argmax(pbest_val)]
#     return gbest, max(pbest_val)

# def ga_nn(fitness_fn, dim=3, pop_size=30, generations=50, mutation_rate=0.1):
#     pop = np.random.uniform(-5, 5, (pop_size, dim))
#     for _ in range(generations):
#         scores = np.array([fitness_fn(ind) for ind in pop])
#         parents = pop[np.argsort(scores)][-pop_size//2:]
#         children = []
#         for i in range(pop_size):
#             p1, p2 = parents[np.random.randint(len(parents), size=2)]
#             child = (p1 + p2) / 2
#             if np.random.rand() < mutation_rate:
#                 child += np.random.uniform(-1, 1, dim)
#             children.append(child)
#         pop = np.array(children)
#     best_idx = np.argmax([fitness_fn(ind) for ind in pop])
#     return pop[best_idx], fitness_fn(pop[best_idx])




# # --- Neo4j Connection ---
# URI = "neo4j://localhost:7687"
# AUTH = ("neo4j", "jahnavi17")
# driver = GraphDatabase.driver(URI, auth=AUTH)

# from functools import lru_cache
# import math

# @lru_cache(maxsize=None)
# def cached_query_results(interest, driver, index_name):
#     cypher_query = """
#     CALL db.index.fulltext.queryNodes($index_name, $interest, {topK: 500})
#     YIELD node AS work, score
#     RETURN work.citedByCount AS citedByCount, score
#     """
#     records, _, _ = driver.execute_query(
#         cypher_query, {"interest": interest, "index_name": index_name}, database_="neo4j"
#     )
#     return [(r["score"], r["citedByCount"]) for r in records]



# def calculate_fitness(weights, driver, group_interests):
#     w1, w2, w3 = weights
#     index_name = "papers_search_english"

#     all_scores = []
#     for interest in group_interests:
#         results = cached_query_results(interest, driver, index_name)
#         for score, citedBy in results:
#             group_score = (score * w1) + (1 * w2) + (math.log10(int(citedBy) + 1) * w3)
#             all_scores.append(group_score)

#     if not all_scores:
#         return 0

#     return sum(all_scores) / len(all_scores)

# def make_fitness_fn(driver, group_interests):
#     def fitness(weights):
#         return calculate_fitness(weights, driver, group_interests)
#     return fitness

# group_interests = ["machine learning", "deep learning", "ethics"]
# fitness_fn = make_fitness_fn(driver, group_interests)


# methods = {
#     "GWO": lambda f: gwo(f, dim=3),
#     "Hill": lambda f: hill_climb(f, np.random.uniform(-5, 5, 3)),
#     "PSO": lambda f: pso(f, dim=3),
#     "GA+NN": lambda f: ga_nn(f, dim=3),
#     "Hybrid (GWO+Hill)": lambda f: hill_climb(f, gwo(f, dim=3)[0])
# }

# for name, method in methods.items():
#     best, score = method(fitness_fn)
#     print(f"{name:15s} → Best fitness: {score:.4f}, Best weights: {best}")




import numpy as np
import math
from neo4j import GraphDatabase
from functools import lru_cache

# -----------------------------
# Optimizers
# -----------------------------
def gwo(fitness_fn, dim=3, n_wolves=20, max_iter=10, w_min=-10, w_max=10):
    wolves = np.random.uniform(w_min, w_max, (n_wolves, dim))
    alpha = np.zeros(dim)
    beta = np.zeros(dim)
    delta = np.zeros(dim)
    alpha_score = beta_score = delta_score = -np.inf

    for t in range(max_iter):
        for w in wolves:
            score = fitness_fn(w)
            if score > alpha_score:
                delta, beta, alpha = beta.copy(), alpha.copy(), w.copy()
                delta_score, beta_score, alpha_score = beta_score, alpha_score, score
            elif score > beta_score:
                delta, beta = beta.copy(), w.copy()
                delta_score, beta_score = beta_score, score
            elif score > delta_score:
                delta, delta_score = w.copy(), score

        a = 2 - t * (2 / max_iter)
        for i in range(n_wolves):
            A1 = 2 * a * np.random.rand(dim) - a
            C1 = 2 * np.random.rand(dim)
            D_alpha = abs(C1 * alpha - wolves[i])
            X1 = alpha - A1 * D_alpha

            A2 = 2 * a * np.random.rand(dim) - a
            C2 = 2 * np.random.rand(dim)
            D_beta = abs(C2 * beta - wolves[i])
            X2 = beta - A2 * D_beta

            A3 = 2 * a * np.random.rand(dim) - a
            C3 = 2 * np.random.rand(dim)
            D_delta = abs(C3 * delta - wolves[i])
            X3 = delta - A3 * D_delta

            wolves[i] = (X1 + X2 + X3) / 3.0
            wolves[i] = np.clip(wolves[i], w_min, w_max)

    return alpha, alpha_score


def hill_climb(fitness_fn, start, step_size=0.1, max_iter=10):
    current = start.copy()
    current_score = fitness_fn(current)
    for _ in range(max_iter):
        neighbor = current + np.random.uniform(-step_size, step_size, len(current))
        score = fitness_fn(neighbor)
        if score > current_score:
            current, current_score = neighbor, score
    return current, current_score


def pso(fitness_fn, dim=3, n_particles=20, max_iter=10, w=0.5, c1=1.5, c2=1.5):
    pos = np.random.uniform(-5, 5, (n_particles, dim))
    vel = np.zeros((n_particles, dim))
    pbest = pos.copy()
    pbest_val = np.array([fitness_fn(p) for p in pos])
    gbest = pbest[np.argmax(pbest_val)]

    for _ in range(max_iter):
        r1, r2 = np.random.rand(), np.random.rand()
        vel = w*vel + c1*r1*(pbest - pos) + c2*r2*(gbest - pos)
        pos += vel
        vals = np.array([fitness_fn(p) for p in pos])
        better = vals > pbest_val
        pbest[better], pbest_val[better] = pos[better], vals[better]
        gbest = pbest[np.argmax(pbest_val)]
    return gbest, max(pbest_val)


def ga_nn(fitness_fn, dim=3, pop_size=30, generations=50, mutation_rate=0.1):
    pop = np.random.uniform(-5, 5, (pop_size, dim))
    for _ in range(generations):
        scores = np.array([fitness_fn(ind) for ind in pop])
        parents = pop[np.argsort(scores)][-pop_size//2:]
        children = []
        for i in range(pop_size):
            p1, p2 = parents[np.random.randint(len(parents), size=2)]
            child = (p1 + p2) / 2
            if np.random.rand() < mutation_rate:
                child += np.random.uniform(-1, 1, dim)
            children.append(child)
        pop = np.array(children)
    best_idx = np.argmax([fitness_fn(ind) for ind in pop])
    return pop[best_idx], fitness_fn(pop[best_idx])

# -----------------------------
# Neo4j + Fitness
# -----------------------------
URI = "neo4j://localhost:7687"
AUTH = ("neo4j", "jahnavi17")
driver = GraphDatabase.driver(URI, auth=AUTH)

@lru_cache(maxsize=None)
def cached_query_results(interest, driver, index_name):
    cypher_query = """
    CALL db.index.fulltext.queryNodes($index_name, $interest, {topK: 500})
    YIELD node AS work, score
    RETURN work.citedByCount AS citedByCount, score
    """
    records, _, _ = driver.execute_query(
        cypher_query, {"interest": interest, "index_name": index_name}, database_="neo4j"
    )
    return [(r["score"], r["citedByCount"]) for r in records]


def calculate_fitness(weights, driver, group_interests):
    """Compute normalized fitness (0–1 scale)."""
    w1, w2, w3 = weights
    index_name = "papers_search_english"

    all_scores = []
    for interest in group_interests:
        results = cached_query_results(interest, driver, index_name)
        for score, citedBy in results:
            group_score = (score * w1) + (1 * w2) + (math.log10(int(citedBy) + 1) * w3)
            all_scores.append(group_score)

    if not all_scores:
        return 0

    avg = sum(all_scores) / len(all_scores)
    # --- Normalization ---
    if math.isnan(avg) or avg == 0:
        return 0
    # Compress using tanh for consistent scale and avoid explosion
    normalized = np.tanh(avg / 100.0)  # 100 is a safe scaling factor
    return float(normalized)


def make_fitness_fn(driver, group_interests):
    def fitness(weights):
        # Clamp weights inside range and ensure numeric stability
        weights = np.clip(weights, -10, 10)
        return calculate_fitness(weights, driver, group_interests)
    return fitness

# -----------------------------
# Run Comparisons
# -----------------------------
group_interests = ["machine learning", "deep learning", "ethics"]
fitness_fn = make_fitness_fn(driver, group_interests)

methods = {
    "GWO": lambda f: gwo(f, dim=3),
    "Hill": lambda f: hill_climb(f, np.random.uniform(-5, 5, 3)),
    "PSO": lambda f: pso(f, dim=3),
    "GA+NN": lambda f: ga_nn(f, dim=3),
    "Hybrid (GWO+Hill)": lambda f: hill_climb(f, gwo(f, dim=3)[0])
}

def normalize_weights(weights):
    norm = np.linalg.norm(weights)
    if norm == 0:
        return weights
    return weights / norm  # normalize to unit length


for name, method in methods.items():
    best, score = method(fitness_fn)
    best_normalized = normalize_weights(best)
    normalized_score = fitness_fn(best_normalized)
    print(f"{name:15s} → Best fitness: {normalized_score:.4f}, Normalized weights: {best_normalized}")