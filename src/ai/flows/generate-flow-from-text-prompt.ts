
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
  prompt: `You are an expert in designing WhatsApp flows according to the official Facebook documentation (version 7.1). Generate a WhatsApp flow in JSON format based on the following text prompt: {{{prompt}}}.

The flow should include:
- A "version" property set to "7.1".
- An array of "screens". Each screen should have an "id".
- Screens should contain "layout" and "data" sections where appropriate.
- Layouts should define "type" (e.g., "SingleColumnLayout") and "children" (an array of components).
- Supported components include:
  - Text (with "type": "Text", "text": "your_string", and optionally "style": ["BOLD", "ITALIC"])
  - Image (with "type": "Image", "image_id": "your_image_id_or_url")
  - Button (with "type": "Button", "label": "your_label", "action_id": "your_action_id")
  - TextInput (with "type": "TextInput", "name": "input_name", "label": "Input Label")
  - TextArea (with "type": "TextArea", "name": "textarea_name", "label": "TextArea Label")
  - CheckboxGroup (with "type": "CheckboxGroup", "name": "checkbox_name", "label": "Checkbox Group Label", "data_source": [{"id": "unique_id_1", "title": "Option Title 1"}, {"id": "unique_id_2", "title": "Option Title 2"}])
  - RadioButtonGroup (with "type": "RadioButtonGroup", "name": "radio_name", "label": "Radio Group Label", "data_source": [{"id": "unique_id_a", "title": "Choice A"}, {"id": "unique_id_b", "title": "Choice B"}])
  - Dropdown (with "type": "Dropdown", "label": "Select an option", "name": "dropdown_name", "data_source": [{"id": "dd_opt_1", "title": "Dropdown Item 1"}, {"id": "dd_opt_2", "title": "Dropdown Item 2"}])
  - DatePicker (with "type": "DatePicker", "name": "date_picker_name", "label": "Select a Date")
  - OptIn (with "type": "OptIn", "name": "opt_in_name", "label": "Agree to terms")
  - EmbeddedLink (with "type": "EmbeddedLink", "url": "your_url", "text": "Link Text")
  - Footer (with "type": "Footer", "text": "Footer Text")
  - Headline (with "type": "Headline", "text": "Headline Text")
  - ScreenConfirmation (with "type": "ScreenConfirmation", "name": "confirmation_name", "label": "Confirmation Details")
- **CRITICAL for \`data_source\`**: For CheckboxGroup, RadioButtonGroup, and Dropdown components, EACH item in their "data_source" array MUST be an object. This object MUST contain BOTH an "id" (a unique string identifier) AND a "title" (a user-visible string for display). Do NOT omit the "title". For example: \`[{"id": "option_1", "title": "User Friendly Option 1"}, {"id": "option_2", "title": "User Friendly Option 2"}]\`. The "title" is what the user sees.
- Define "actions" for navigation (e.g., "type": "navigate", "screen_id": "next_screen_id") or data submission (e.g., "type": "data_exchange", "flow_exchange_data": {...}, "success_action": {...}, "error_action": {...}).

Ensure the JSON structure is valid and adheres to WhatsApp Flow specifications for version 7.1. Focus on creating a functional and well-structured flow based on the user's prompt. Pay close attention to correct JSON syntax, especially for nesting arrays and objects, and ensure there are no trailing commas or extraneous closing brackets. Verify that all required properties for each component type are present as per the documentation.`,
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

