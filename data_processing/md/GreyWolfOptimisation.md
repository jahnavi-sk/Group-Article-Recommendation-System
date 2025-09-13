## Grey Wolf Optimisation

Basically, its also used to choose best solution(*metaheurisitc operation*) and its workflow is similar to the hunting behavior of wil grey wolves.

- no derivates !
- exploration(global search) + exploitation(local search)
-  Avoids getting stuck in local optima by allowing Omega wolves to explore new solutions.
-  Handles multiple objectives (e.g., balancing novelty vs. relevance) because the pack naturally prioritizes the best trade-off solutions.


#### Grey Wolves Hierarchy
- Alpha
- Beta
- Delta
- Omega


#### The algorithm workflow
1) Randomly generate a set of possible solutions
2) Rank the wolves
   - Evaluate each wolves fitness (how relevant and apt it is to the topic) and assign it a role. 
   - The leaders are assinged (the best are decided)
   - The other wolves follow the leader
3) Position Update
   - how do the other wolves follow ??
   - by updating their positions based on distances to the leaders
4) Exploration
   - Exploration (earlier) + exploitatoin (later)
   - If better solution found, alpha, beta and delta wolves are changed
