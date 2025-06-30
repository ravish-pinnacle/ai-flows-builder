
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
  prompt: `You are an AI expert in designing user-friendly and efficient WhatsApp flows, strictly referencing the official Facebook documentation for WhatsApp Flow JSON v7.1. Analyze the provided WhatsApp flow JSON definition and suggest improvements for better user engagement and outcomes.

Flow Definition:
\`\`\`json
{{{flowDefinition}}}
\`\`\`

Provide specific, actionable suggestions, focusing on:
- **Screen ID Formatting**: Verify that all screen \`id\` properties and all screen names used in the \`routing_model\` consist only of uppercase letters, numbers, and underscores (e.g., 'VALID_ID', 'SCREEN_2').
- **Schema Adherence (v7.1)**:
    - Verify the "version" property is "7.1". If not, suggest updating it.
    - Check for non-standard components like 'Text' or 'Headline'. If found, suggest replacing them with the standard v7.1 components: 'TextHeading', 'TextSubheading', 'TextBody', or 'TextCaption'.
    - Ensure actions (navigate, data_exchange) are primarily tied to 'Button' components or specific data_exchange success/error handlers, not to components like 'OptIn' or 'Footer' for their primary interaction.
- **Clarity and Simplicity**: Are screen layouts intuitive? Is text clear and concise (using 'TextHeading', 'TextSubheading', 'TextBody', 'TextCaption')? Are there too many components on a single screen?
- **User Journey**: Is the navigation between screens logical? Can the number of steps or screens be reduced without losing functionality?
- **Component Usage (v7.1)**: Are standard components like TextHeading, TextSubheading, TextBody, TextCaption, Image, Button, TextInput, TextArea, CheckboxGroup, RadioButtonGroup, Dropdown, DatePicker, OptIn, EmbeddedLink, Footer, and ScreenConfirmation used effectively and according to v7.1 specs? For example, is a Dropdown used when a RadioButtonGroup might be better for a small number of options? Ensure each item in 'data_source' for CheckboxGroup, RadioButtonGroup, and Dropdown has both a unique 'id' and a user-facing 'title'. If 'title' is missing, this is a critical error and must be flagged.
- **Media Component Rules**:
    - Verify that a screen does not contain both a \`PhotoPicker\` and a \`DocumentPicker\`.
    - Verify that a screen contains at most one \`PhotoPicker\` or one \`DocumentPicker\`.
    - Check if a \`PhotoPicker\` or \`DocumentPicker\` is correctly placed inside a \`Form\` component.
    - Check if \`min-uploaded-photos\` exceeds \`max-uploaded-photos\` (and same for documents).
    - Flag if a media picker's value is used in the payload of a \`navigate\` action, as this is forbidden.
- **Data Handling**: Is data collection efficient? Are variable names clear? Are data_exchange actions well-defined?
- **Error Handling**: Are error states or actions considered for data submission or navigation failures?
- **Accessibility**: While not directly inferable from JSON, provide general reminders if the flow structure suggests potential accessibility issues (e.g., very complex forms, lack of clear labels on input fields).
- **Actionability**: Are 'Button' components clearly labeled? Do actions lead to expected outcomes?

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
