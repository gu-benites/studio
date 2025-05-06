'use server';

/**
 * @fileOverview Recipe suggestion AI agent.
 *
 * - generateRecipeSuggestions - A function that handles the recipe suggestion process.
 * - GenerateRecipeSuggestionsInput - The input type for the generateRecipeSuggestions function.
 * - GenerateRecipeSuggestionsOutput - The return type for the generateRecipeSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeSuggestionsInputSchema = z.object({
  category: z.string().describe('The category of recipe to generate suggestions for.'),
});
export type GenerateRecipeSuggestionsInput = z.infer<
  typeof GenerateRecipeSuggestionsInputSchema
>;

const GenerateRecipeSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of recipe suggestions based on the category.'),
});
export type GenerateRecipeSuggestionsOutput = z.infer<
  typeof GenerateRecipeSuggestionsOutputSchema
>;

export async function generateRecipeSuggestions(
  input: GenerateRecipeSuggestionsInput
): Promise<GenerateRecipeSuggestionsOutput> {
  return generateRecipeSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipeSuggestionsPrompt',
  input: {schema: GenerateRecipeSuggestionsInputSchema},
  output: {schema: GenerateRecipeSuggestionsOutputSchema},
  prompt: `You are a recipe suggestion expert.  Generate recipe suggestions based on the category.

  Category: {{{category}}}

  Suggestions:`,
});

const generateRecipeSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateRecipeSuggestionsFlow',
    inputSchema: GenerateRecipeSuggestionsInputSchema,
    outputSchema: GenerateRecipeSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
