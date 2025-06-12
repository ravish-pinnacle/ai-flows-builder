'use server';
/**
 * @fileOverview Generates a WhatsApp flow from a text prompt.
 *
 * - generateFlowFromTextPrompt - A function that generates a WhatsApp flow from a text prompt.
 * - GenerateFlowFromTextPromptInput - The input type for the generateFlowFromTextPrompt function.
 * - GenerateFlowFromTextPromptOutput - The return type for the generateFlowFromTextPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlowFromTextPromptInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate the WhatsApp flow from.'),
});
export type GenerateFlowFromTextPromptInput = z.infer<
  typeof GenerateFlowFromTextPromptInputSchema
>;

const GenerateFlowFromTextPromptOutputSchema = z.object({
  flow: z.string().describe('The generated WhatsApp flow in JSON format.'),
});
export type GenerateFlowFromTextPromptOutput = z.infer<
  typeof GenerateFlowFromTextPromptOutputSchema
>;

export async function generateFlowFromTextPrompt(
  input: GenerateFlowFromTextPromptInput
): Promise<GenerateFlowFromTextPromptOutput> {
  return generateFlowFromTextPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlowFromTextPromptPrompt',
  input: {schema: GenerateFlowFromTextPromptInputSchema},
  output: {schema: GenerateFlowFromTextPromptOutputSchema},
  prompt: `You are an expert in designing WhatsApp flows. Generate a WhatsApp flow in JSON format based on the following text prompt: {{{prompt}}}. The flow should be well-structured and easy to understand.`,
});

const generateFlowFromTextPromptFlow = ai.defineFlow(
  {
    name: 'generateFlowFromTextPromptFlow',
    inputSchema: GenerateFlowFromTextPromptInputSchema,
    outputSchema: GenerateFlowFromTextPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
