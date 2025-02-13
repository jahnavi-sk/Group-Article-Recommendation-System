## Memetic Algorithm

A Memetic Algorithm is an evolutionary algorithm that combines global search with local search  to refine solutions more efficiently.


``` name inspired from "memes" - just like memes/ideas evolve and spread - the memetic algorithm evolves candidate solutions by using 1) Global Evolution 2) Local Refinement```


``` What's global and local search ?
- Global 
    - Explores the entire solution space to find a globally optimal solution
    - More broader
- Local
    - Explores the solution space in the neighborhood of the current solution
    - focusses on refinement more
```

#### Workflow

1) **Initialize Population** – Generate an initial set of candidate solutions.
2) **Selection & Evolution** – Apply genetic algorithms (crossover & mutation).
3) **Local Search** – Improve solutions using hill climbing or another refinement method.
4) **Fitness Evaluation** – Assess quality of evolved solutions.
5) **Repeat** – Continue evolving until convergence.



#### How is it combining global and local search


##### Global Search
- Algorithm randomly initialises a population of candidate solutions
- It applies genetic algorithm techniques like:
  - Selection : Choose the best candidate based on relevance
  - Crossover : Mix features to create a new recommendation
  - Mutation : Slighly alter recommendation to introduce diversity  


#### Local Search
- algorithm applies local search to each candidate solution
- basically fine tune to get best recommendation


##### Analogy i found online - Mountain Climbing

- Global Search (Exploration) → You randomly explore different mountains to find the highest peak.
- Local Search (Exploitation) → Once you're on a promising peak, you fine-tune your position to reach the summit instead of randomly jumping to another mountain.
- A pure Genetic Algorithm (GA) might jump between mountains and **miss a peak**.
- A pure Local Search might get **stuck on a smaller peak** and never reach the highest one.
- A Memetic Algorithm first explores different mountains, then climbs the best one efficiently.


*Global Search explores broadly but can land on suboptimal solution and Local Search works only when good region is found. Hence, a mix of both works best.*

*Ensures exploration + exploitation*

