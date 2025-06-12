
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
  prompt: `You are an expert in designing WhatsApp flows according to the official Facebook documentation. Generate a WhatsApp flow in JSON format based on the following text prompt: {{{prompt}}}.

The flow should include:
- A "version" property set to "7.1".
- An array of "screens". Each screen should have an "id".
- Screens should contain "layout" and "data" sections where appropriate.
- Layouts should define "type" (e.g., "SingleColumnLayout") and "children" (an array of components).
- Supported components include: Text (with "type": "Text", "text": "your_string", and optionally "style"), Image (with "type": "Image", "image_id": "your_image_id_or_url"), Button (with "type": "Button", "label": "your_label", "action_id": "your_action_id"), TextInput (with "type": "TextInput", "name": "input_name", "label": "Input Label"), TextArea (with "type": "TextArea", "name": "textarea_name", "label": "TextArea Label"), CheckboxGroup (with "type": "CheckboxGroup", "name": "checkbox_name", "data_source": [...options]), RadioButtonGroup (with "type": "RadioButtonGroup", "name": "radio_name", "data_source": [...options]), Dropdown (with "type": "Dropdown", "label": "Select an option", "name": "dropdown_name", "data_source": [...options]), DatePicker (with "type": "DatePicker", "name": "date_picker_name", "label": "Select a Date"), OptIn (with "type": "OptIn", "name": "opt_in_name", "label": "Agree to terms"), EmbeddedLink (with "type": "EmbeddedLink", "url": "your_url", "text": "Link Text"), Footer (with "type": "Footer", "text": "Footer Text"), Headline (with "type": "Headline", "text": "Headline Text"), ScreenConfirmation (with "type": "ScreenConfirmation", "name": "confirmation_name", "label": "Confirmation Details").
- Define "actions" for navigation (e.g., "type": "navigate", "screen_id": "next_screen_id") or data submission (e.g., "type": "data_exchange", "flow_exchange_data": {...}, "success_action": {...}, "error_action": {...}).

Ensure the JSON structure is valid and adheres to WhatsApp Flow specifications for version 7.1. Focus on creating a functional and well-structured flow based on the user's prompt.`,
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

