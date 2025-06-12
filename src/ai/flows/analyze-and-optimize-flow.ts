'use server';

/**
 * @fileOverview An AI agent that analyzes and optimizes WhatsApp flow designs for user experience and efficiency.
 *
 * - analyzeAndOptimizeFlow - A function that takes a flow definition and suggests improvements.
 * - AnalyzeAndOptimizeInput - The input type for the analyzeAndOptimizeFlow function, representing the flow design.
 * - AnalyzeAndOptimizeOutput - The return type for the analyzeAndOptimizeFlow function, containing optimization suggestions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the flow analyzer.
const AnalyzeAndOptimizeInputSchema = z.object({
  flowDefinition: z
    .string()
    .describe('The JSON definition of the WhatsApp flow to be analyzed.'),
});
export type AnalyzeAndOptimizeInput = z.infer<typeof AnalyzeAndOptimizeInputSchema>;

// Define the output schema for the flow analyzer.
const AnalyzeAndOptimizeOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'A list of suggestions for improving the WhatsApp flow design, focusing on user experience and efficiency.'
    ),
});
export type AnalyzeAndOptimizeOutput = z.infer<typeof AnalyzeAndOptimizeOutputSchema>;

// Exported function to analyze and optimize the flow.
export async function analyzeAndOptimizeFlow(
  input: AnalyzeAndOptimizeInput
): Promise<AnalyzeAndOptimizeOutput> {
  return analyzeAndOptimizeFlowInternal(input);
}

// Define the prompt for the flow analyzer.
const analyzeAndOptimizePrompt = ai.definePrompt({
  name: 'analyzeAndOptimizePrompt',
  input: {schema: AnalyzeAndOptimizeInputSchema},
  output: {schema: AnalyzeAndOptimizeOutputSchema},
  prompt: `You are an AI expert in designing user-friendly and efficient WhatsApp flows. Analyze the provided flow definition and suggest improvements for better user engagement and outcomes.

Flow Definition:
{{{flowDefinition}}}

Provide specific, actionable suggestions, focusing on:
- Simplifying the user journey
- Reducing the number of steps
- Improving clarity of instructions
- Optimizing the use of media and interactive elements
- Ensuring accessibility for all users

Suggestions (in markdown format):`,
});

// Define the Genkit flow for analyzing and optimizing WhatsApp flows.
const analyzeAndOptimizeFlowInternal = ai.defineFlow(
  {
    name: 'analyzeAndOptimizeFlow',
    inputSchema: AnalyzeAndOptimizeInputSchema,
    outputSchema: AnalyzeAndOptimizeOutputSchema,
  },
  async input => {
    const {output} = await analyzeAndOptimizePrompt(input);
    return output!;
  }
);
