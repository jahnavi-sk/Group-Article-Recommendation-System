import numpy as np
import matplotlib.pyplot as plt
import math
from neo4j import GraphDatabase
from functools import lru_cache


# -------------------------------------------------------
#  Neo4j connection + fitness helpers
# -------------------------------------------------------

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
    w1, w2, w3 = weights
    index_name = "papers_search_english"
    all_scores = []
    for interest in group_interests:
        results = cached_query_results(interest, driver, index_name)
        for score, citedBy in results:
            group_score = (score * w1) + (1 * w2) + (math.log10(int(citedBy) + 1) * w3)
            # print('score = ', score, 'citedBy = ', citedBy, 'group_score = ', group_score)
            all_scores.append(group_score)
    if not all_scores:
        return 0
    return sum(all_scores) / len(all_scores)


def make_fitness_fn(driver, group_interests):
    def fitness(weights):
        # normalize before evaluating
        norm = np.linalg.norm(weights)
        if norm > 0:
            weights = weights / norm
        return calculate_fitness(weights, driver, group_interests)
    return fitness


# -------------------------------------------------------
#  GWO (normalized + convergence tracking)
# -------------------------------------------------------
def gwo(fitness_fn, dim=3, n_wolves=20, max_iter=50, w_min=-1, w_max=1):
    wolves = np.random.uniform(w_min, w_max, (n_wolves, dim))
    alpha = np.zeros(dim); beta = np.zeros(dim); delta = np.zeros(dim)
    alpha_score = beta_score = delta_score = -np.inf
    convergence = []

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
            A1, A2, A3 = [2 * a * np.random.rand(dim) - a for _ in range(3)]
            C1, C2, C3 = [2 * np.random.rand(dim) for _ in range(3)]

            D_alpha = abs(C1 * alpha - wolves[i])
            D_beta = abs(C2 * beta - wolves[i])
            D_delta = abs(C3 * delta - wolves[i])

            X1 = alpha - A1 * D_alpha
            X2 = beta - A2 * D_beta
            X3 = delta - A3 * D_delta

            wolves[i] = (X1 + X2 + X3) / 3.0

            # Normalize
            norm = np.linalg.norm(wolves[i])
            if norm > 0:
                wolves[i] /= norm

        convergence.append(alpha_score)

    return alpha / np.linalg.norm(alpha), alpha_score, convergence


# -------------------------------------------------------
#  Hill Climb (with convergence)
# -------------------------------------------------------
def hill_climb(fitness_fn, start, step_size=0.1, max_iter=100):
    current = start.copy()
    current_score = fitness_fn(current)
    convergence = [current_score]

    for _ in range(max_iter):
        neighbor = current + np.random.uniform(-step_size, step_size, len(current))
        neighbor /= np.linalg.norm(neighbor)
        score = fitness_fn(neighbor)
        if score > current_score:
            current, current_score = neighbor, score
        convergence.append(current_score)
    return current, current_score, convergence


# -------------------------------------------------------
#  PSO (normalized + convergence)
# -------------------------------------------------------
def pso(fitness_fn, dim=3, n_particles=20, max_iter=50, w=0.5, c1=1.5, c2=1.5):
    pos = np.random.uniform(-1, 1, (n_particles, dim))
    vel = np.zeros((n_particles, dim))
    pbest = pos.copy()
    pbest_val = np.array([fitness_fn(p) for p in pos])
    gbest = pbest[np.argmax(pbest_val)]
    gbest_val = max(pbest_val)
    convergence = [gbest_val]

    for _ in range(max_iter):
        r1, r2 = np.random.rand(), np.random.rand()
        vel = w*vel + c1*r1*(pbest - pos) + c2*r2*(gbest - pos)
        pos += vel
        pos = np.divide(pos, np.linalg.norm(pos, axis=1, keepdims=True), where=np.linalg.norm(pos, axis=1, keepdims=True)!=0)
        vals = np.array([fitness_fn(p) for p in pos])
        better = vals > pbest_val
        pbest[better], pbest_val[better] = pos[better], vals[better]
        gbest = pbest[np.argmax(pbest_val)]
        gbest_val = max(pbest_val)
        convergence.append(gbest_val)
    return gbest / np.linalg.norm(gbest), gbest_val, convergence


# -------------------------------------------------------
#  GA+NN (normalized + convergence)
# -------------------------------------------------------
def ga_nn(fitness_fn, dim=3, pop_size=30, generations=50, mutation_rate=0.1):
    pop = np.random.uniform(-1, 1, (pop_size, dim))
    convergence = []

    for _ in range(generations):
        scores = np.array([fitness_fn(ind) for ind in pop])
        parents = pop[np.argsort(scores)][-pop_size//2:]
        children = []
        for i in range(pop_size):
            p1, p2 = parents[np.random.randint(len(parents), size=2)]
            child = (p1 + p2) / 2
            if np.random.rand() < mutation_rate:
                child += np.random.uniform(-0.2, 0.2, dim)
            norm = np.linalg.norm(child)
            if norm > 0:
                child /= norm
            children.append(child)
        pop = np.array(children)
        convergence.append(np.max(scores))

    best_idx = np.argmax([fitness_fn(ind) for ind in pop])
    best = pop[best_idx]
    best_score = fitness_fn(best)
    return best / np.linalg.norm(best), best_score, convergence


# -------------------------------------------------------
#  Hybrid (GWO + Hill)
# -------------------------------------------------------
def hybrid_gwo_hill(fitness_fn):
    gwo_best, gwo_score, gwo_conv = gwo(fitness_fn)
    hill_best, hill_score, hill_conv = hill_climb(fitness_fn, gwo_best)
    return hill_best, hill_score, gwo_conv + hill_conv


# -------------------------------------------------------
#  Run & plot
# -------------------------------------------------------
group_interests = ["machine learning", "deep learning", "ethics"]
fitness_fn = make_fitness_fn(driver, group_interests)

# methods = {
#     "GWO": lambda: gwo(fitness_fn),
#     "Hill": lambda: hill_climb(fitness_fn, np.random.uniform(-1, 1, 3)),
#     "PSO": lambda: pso(fitness_fn),
#     "GA+NN": lambda: ga_nn(fitness_fn),
#     "Hybrid (GWO+Hill)": lambda: hybrid_gwo_hill(fitness_fn)
# }

# plt.figure(figsize=(10,6))
# for name, fn in methods.items():
#     best, score, conv = fn()
#     print(f"{name:15s} → Best fitness: {score:.4f}, Normalized weights: {np.round(best, 3)}")
#     plt.plot(conv, label=name)


# plt.title("Convergence Comparison Across Algorithms")
# plt.xlabel("Iteration")
# plt.ylabel("Best Fitness")
# plt.legend()
# plt.grid(True)
# plt.show()

# from mpl_toolkits.mplot3d import Axes3D

# w1 = np.linspace(-1, 1, 30)
# w2 = np.linspace(-1, 1, 30)
# W1, W2 = np.meshgrid(w1, w2)
# fitness_vals = np.zeros_like(W1)

# for i in range(W1.shape[0]):
#     for j in range(W1.shape[1]):
#         w = np.array([W1[i,j], W2[i,j], 0.3])
#         fitness_vals[i,j] = fitness_fn(w)

# fig = plt.figure()
# ax = fig.add_subplot(111, projection='3d')
# ax.plot_surface(W1, W2, fitness_vals, cmap='viridis')
# plt.title("Fitness Landscape for w1-w2 plane")
# plt.show()


import numpy as np
import matplotlib.pyplot as plt
from scipy.ndimage import gaussian_filter1d

w2, w3 = 0.3, 0.5
w1_values = np.linspace(-1, 1, 50)
fitness_values = [fitness_fn(np.array([w1, w2, w3])) for w1 in w1_values]


smoothed = gaussian_filter1d(fitness_values, sigma=1.0)

h = w1_values[1] - w1_values[0]   # assume uniform spacing
# second derivative via central differences
fpp = np.empty_like(smoothed)
fpp[0] = (smoothed[2] - 2*smoothed[1] + smoothed[0]) / (h*h)               # forward-ish edge
fpp[-1]= (smoothed[-1] - 2*smoothed[-2] + smoothed[-3]) / (h*h)            # backward-ish edge
fpp[1:-1] = (smoothed[2:] - 2*smoothed[1:-1] + smoothed[:-2]) / (h*h)

plt.figure(figsize=(10,4))
plt.subplot(1,2,1)
plt.plot(w1_values, fitness_values, label='raw')
plt.plot(w1_values, smoothed, label='smoothed', linewidth=2)
plt.legend()
plt.title("Fitness vs w1")

plt.subplot(1,2,2)
plt.plot(w1_values, fpp)
plt.axhline(0, color='k', linewidth=0.8)
plt.title("Second derivative (f'')")
plt.xlabel('w1')
plt.tight_layout()
plt.show()
# plt.plot(w1_values, fitness_values)
# plt.xlabel("w1")
# plt.ylabel("Fitness")
# plt.title("Fitness Landscape along w1")
# plt.show()
