
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
      'A list of suggestions for improving the WhatsApp flow design, focusing on user experience and efficiency, in markdown format.'
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
  prompt: `You are an AI expert in designing user-friendly and efficient WhatsApp flows, referencing the official Facebook documentation. Analyze the provided WhatsApp flow JSON definition and suggest improvements for better user engagement and outcomes.

Flow Definition:
\`\`\`json
{{{flowDefinition}}}
\`\`\`

Provide specific, actionable suggestions, focusing on:
- **Clarity and Simplicity**: Are screen layouts intuitive? Is text clear and concise? Are there too many components on a single screen?
- **User Journey**: Is the navigation between screens logical? Can the number of steps or screens be reduced without losing functionality?
- **Component Usage**: Are components like Text, Image, Button, TextInput, CheckboxGroup, RadioButtonGroup, and Dropdown used effectively? For example, is a Dropdown used when a RadioButtonGroup might be better for a small number of options?
- **Data Handling**: Is data collection efficient? Are variable names clear? Are data_exchange actions well-defined?
- **Error Handling**: Are error states or actions considered for data submission or navigation failures?
- **Accessibility**: While not directly inferable from JSON, provide general reminders if the flow structure suggests potential accessibility issues (e.g., very complex forms).
- **Actionability**: Are buttons clearly labeled? Do actions lead to expected outcomes?

Suggestions (in markdown format, using bullet points for each suggestion):`,
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
