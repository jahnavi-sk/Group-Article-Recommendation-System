| **User Objective**                                 | **Algorithm to Use**                 | **Model/Approach**                                                                                           |
| -------------------------------------------------- | ------------------------------------ | :----------------------------------------------------------------------------------------------------------- |
| *1. Research Paper Recommendation for Individuals* | - Content-Based Filtering (CBF)      | - TF-IDF, Doc2Vec <br> (we considered SciBert, Bert but they require multi-gpu and we don't have those resources.) |
|                                                    | - Collaborative Filtering (CF)       | - Matrix Factorization <br> (good for handling large data)                                                    |
|                                                    | - Knowledge Graph-Based Retrieval    | - Personalized PageRank <br> for user-paper relevance ranking                                                 |
| *2. Research Paper Recommendation for Groups*      | - Hybrid Filtering (CBF + CF)        | - Weighted hybrid model <br> (CBF + CF) to balance content and user preferences                               |
|                                                    | - Grey Wolf Memetic Algorithm (GWMA) | - Optimization algorithm <br> for group preference aggregation                                                |
|                                                    | - Group Consensus Algorithms         | - Preference aggregation <br> (Least Misery, Average Satisfaction)                                            |
| *3. Problem Statement Generation*                  | - Knowledge Graph Exploration        | - Graph-based underexplored <br> topic connections <br>                      |
|                                                    | - LLM-Based Querying                 | - Ollama <br> (Phi, Mistral, Llama3) to generate problem statements                                           |
| *4. Researchers Recommendation*                    | - Content-Based Filtering (CBF)      | - TF-IDF/BERT embeddings <br> to match researchers' papers with users' interests                              |
|                                                    | - Social Graph Analysis              | - Personalized PageRank <br> on co-authorship & citation network                                              |
|                                                    | - Institution-Based Clustering       | - K-Means, DBSCAN <br> for finding researchers from similar institutions                                      |
|                                                    | - Collaborative Filtering            | - User-based CF to recommend <br> researchers followed by similar users                                      |

