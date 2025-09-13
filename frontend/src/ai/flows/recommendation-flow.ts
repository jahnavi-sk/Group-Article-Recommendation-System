'use server';
/**
 * @fileOverview A flow for getting research paper recommendations.
 *
 * - getRecommendations - A function that returns recommendations based on topics.
 * - RecommendationInput - The input type for the getRecommendations function.
 * - RecommendationOutput - The return type for the getRecommendations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const RecommendationInputSchema = z.object({
  topics: z.array(z.string()).describe('A list of topics to get recommendations for.'),
});
export type RecommendationInput = z.infer<typeof RecommendationInputSchema>;

const RecommendationSchema = z.object({
    title: z.string().describe('The title of the research paper.'),
    authors: z.array(z.string()).describe('The authors of the research paper.'),
    summary: z.string().describe('A brief summary of the research paper to be used as an abstract.'),
    url: z.string().url().describe('The URL to the research paper.'),
});
export type Recommendation = z.infer<typeof RecommendationSchema>;

const RecommendationOutputSchema = z.object({
  recommendations: z.array(RecommendationSchema),
});
export type RecommendationOutput = z.infer<typeof RecommendationOutputSchema>;

export async function getRecommendations(input: RecommendationInput): Promise<RecommendationOutput> {
  return recommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendationPrompt',
  input: { schema: RecommendationInputSchema },
  output: { schema: RecommendationOutputSchema },
  prompt: `You are an expert in academic research and finding relevant papers.
Based on the following topics, find 20 relevant and interesting research papers.
For each paper, provide the title, authors, a short summary (that can be used as an abstract), and a valid URL to the paper (preferably a PDF link or an arXiv link).

Topics:
{{#each topics}}
- {{{this}}}
{{/each}}
`,
});

const recommendationFlow = ai.defineFlow(
  {
    name: 'recommendationFlow',
    inputSchema: RecommendationInputSchema,
    outputSchema: RecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
