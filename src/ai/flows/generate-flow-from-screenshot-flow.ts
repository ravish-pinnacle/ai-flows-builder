
'use server';
/**
 * @fileOverview Generates a WhatsApp flow from a website screenshot and an optional text prompt.
 *
 * - generateFlowFromScreenshotFlow - A function that generates a WhatsApp flow.
 * - GenerateFlowFromScreenshotInput - The input type for the generateFlowFromScreenshotFlow function.
 * - GenerateFlowFromScreenshotOutput - The return type for the generateFlowFromScreenshotFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlowFromScreenshotInputSchema = z.object({
  screenshotDataUri: z.string().describe("A website screenshot as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  additionalPrompt: z.string().optional().describe("Optional additional text instructions to guide the flow generation."),
});
export type GenerateFlowFromScreenshotInput = z.infer<typeof GenerateFlowFromScreenshotInputSchema>;

const GenerateFlowFromScreenshotOutputSchema = z.object({
  flow: z.string().describe('The generated WhatsApp flow in JSON format, based on the screenshot and text prompt.'),
});
export type GenerateFlowFromScreenshotOutput = z.infer<typeof GenerateFlowFromScreenshotOutputSchema>;

export async function generateFlowFromScreenshotFlow(
  input: GenerateFlowFromScreenshotInput
): Promise<GenerateFlowFromScreenshotOutput> {
  return generateFlowInternal(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlowFromScreenshotPrompt',
  input: {schema: GenerateFlowFromScreenshotInputSchema},
  output: {schema: GenerateFlowFromScreenshotOutputSchema},
  model: 'googleai/gemini-2.0-flash-exp',
  prompt: `You are an expert UI/UX designer specializing in converting website layouts into WhatsApp Flows (version 7.1).
Analyze the provided website screenshot and any additional text instructions. Identify key UI elements like headers, text blocks, input fields, buttons, images, lists, etc.
Translate these elements into a functional WhatsApp Flow JSON structure.

The flow MUST include:
- A "version" property set to "7.1".
- An array of "screens". Each screen MUST have an "id" (e.g., "SCREEN_1", "SCREEN_2").
- Screens SHOULD contain "layout" and "data" sections where appropriate.
- Layouts MUST define "type" (e.g., "SingleColumnLayout") and "children" (an array of components).

STRICTLY use ONLY the following supported v7.1 components:
  - Text (with "type": "Text", "text": "your_string_content", and optionally "style": ["BOLD", "ITALIC"])
  - Image (with "type": "Image", "image_id": "placeholder_image.png", "label": "Descriptive label (infer from context or use 'Image')")
  - Button (with "type": "Button", "label": "your_label", "action_id": "your_action_id" (e.g., "navigate_next_screen", "submit_data"))
  - TextInput (with "type": "TextInput", "name": "input_name", "label": "Input Label (infer from placeholder or surrounding text)")
  - TextArea (with "type": "TextArea", "name": "textarea_name", "label": "TextArea Label (infer from placeholder or surrounding text)")
  - CheckboxGroup (with "type": "CheckboxGroup", "name": "checkbox_name", "label": "Checkbox Group Label", "data_source": [{"id": "unique_id_1", "title": "Option Title 1"}, ...])
  - RadioButtonGroup (with "type": "RadioButtonGroup", "name": "radio_name", "label": "Radio Group Label", "data_source": [{"id": "unique_id_a", "title": "Choice A"}, ...])
  - Dropdown (with "type": "Dropdown", "label": "Select an option", "name": "dropdown_name", "data_source": [{"id": "dd_opt_1", "title": "Dropdown Item 1"}, ...])
  - DatePicker (with "type": "DatePicker", "name": "date_picker_name", "label": "Select a Date")
  - OptIn (with "type": "OptIn", "name": "opt_in_name", "label": "Agree to terms")
  - EmbeddedLink (with "type": "EmbeddedLink", "url": "your_url", "text": "Link Text")
  - Footer (with "type": "Footer", "text": "Footer Text")
  - Headline (with "type": "Headline", "text": "Headline Text")
  - ScreenConfirmation (with "type": "ScreenConfirmation", "name": "confirmation_name", "label": "Confirmation Details")

DO NOT use non-standard components like 'TextCaption', 'TextBody', or 'RichText'.
- For multi-paragraph text, use multiple "Text" components.
- For headings, use "Headline" or "Text" with "BOLD" style.
- For images, use "image_id": "placeholder_image.png" and try to infer a sensible label.

**CRITICAL for \`data_source\`**: For CheckboxGroup, RadioButtonGroup, and Dropdown components, EACH item in their "data_source" array MUST be an object. This object MUST contain BOTH an "id" (a unique string identifier, e.g., "option_1") AND a "title" (a user-visible string for display, e.g., "User Friendly Option 1"). THE "title" PROPERTY IS MANDATORY AND MUST NOT BE OMITTED. The "title" is what the user sees in the UI. If you cannot infer a descriptive title from the screenshot for an item in \`data_source\`, use its "id" value as the "title" (e.g., \`{"id": "opt_1", "title": "opt_1"}\`) rather than omitting "title". Example: \`"data_source": [{"id": "color_red", "title": "Red"}, {"id": "opt_generic", "title": "opt_generic"}]\`. Do NOT generate items with only an "id"; they MUST have a "title".

If the website page is long or complex, consider splitting it into multiple screens in the WhatsApp flow.
Define "actions" ONLY for "Button" components.
Ensure the JSON structure is valid and strictly adheres to WhatsApp Flow specifications for version 7.1.
Pay close attention to correct JSON syntax, especially for nesting arrays and objects, and ensure there are no trailing commas.

{{#if additionalPrompt}}
Additional Instructions from user:
{{{additionalPrompt}}}
Use these instructions to further refine the generated flow.
{{/if}}

Input Screenshot:
{{media url=screenshotDataUri}}

Output the result as a single JSON object representing the WhatsApp flow.
`,
});

const generateFlowInternal = ai.defineFlow(
  {
    name: 'generateFlowFromScreenshotFlow',
    inputSchema: GenerateFlowFromScreenshotInputSchema,
    outputSchema: GenerateFlowFromScreenshotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI did not return an output for the screenshot flow generation.");
    }
    return output;
  }
);
