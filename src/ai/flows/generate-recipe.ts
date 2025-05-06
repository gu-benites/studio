// RecipeSage Recipe Generator Flow
'use server';

/**
 * @fileOverview Generates a recipe based on user input, dietary restrictions, and available ingredients.
 *
 * - generateRecipe - A function that handles the recipe generation process.
 * - GenerateRecipeInput - The input type for the generateRecipe function.
 * - GenerateRecipeOutput - The return type for the generateRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeInputSchema = z.object({
  recipeIdea: z.string().describe('A general idea for the recipe (e.g., pasta dish, chocolate cake).'),
  dietaryRestrictions: z.string().describe('Any dietary restrictions (e.g., vegetarian, gluten-free, low-carb).'),
  availableIngredients: z.string().describe('A list of available ingredients.'),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

const GenerateRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The name of the generated recipe.'),
  ingredients: z.string().describe('A list of ingredients for the recipe.'),
  instructions: z.string().describe('Step-by-step instructions for preparing the recipe.'),
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  input: {schema: GenerateRecipeInputSchema},
  output: {schema: GenerateRecipeOutputSchema},
  prompt: `You are a professional chef specializing in creating recipes based on user input.

  Based on the recipe idea, dietary restrictions, and available ingredients, generate a detailed recipe including a name, list of ingredients, and step-by-step instructions.

  Recipe Idea: {{{recipeIdea}}}
  Dietary Restrictions: {{{dietaryRestrictions}}}
  Available Ingredients: {{{availableIngredients}}}

  Ensure the generated recipe is well-structured and easy to follow.
  `,
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
