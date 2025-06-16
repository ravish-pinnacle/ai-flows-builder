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
  prompt: `You are an expert UI/UX designer specializing in converting website layouts into valid WhatsApp Flows.
Analyze the provided website screenshot and any additional text instructions. Identify key UI elements and translate them into a functional WhatsApp Flow JSON structure.

**CRITICAL JSON STRUCTURE RULES:**
1.  **\`version\`**: The root of the JSON MUST have a "version" property set to "7.1".
2.  **\`data_api_version\`**: If the flow requires dynamic data from a server (e.g., for Dropdowns), the root MUST have a "data_api_version" property set to "3.0".
3.  **\`routing_model\`**: This property is REQUIRED at the root level if 'data_api_version' is present. It defines the navigation path. For each screen ID, list the possible next screen IDs in an array. The last screen should have an empty array.
    Example: \`"routing_model": { "SCREEN_A": ["SCREEN_B"], "SCREEN_B": [] }\`
4.  **\`screens\`**: This MUST be an array of screen objects.
5.  **Screen Properties**: Each screen object in the array MUST have:
    - An \`"id"\` (e.g., "SCREEN_WELCOME").
    - A \`"title"\` (e.g., "Welcome Screen"). This is the text for the screen's header.
    - A \`"layout"\` object, which must have \`"type": "SingleColumnLayout"\` and a \`"children"\` array.
    - An optional \`"terminal": true\` property for the final screen.
6.  **\`Form\` Component**: To collect any user input on a screen (TextInput, Dropdown, etc.), all the interactive components for that screen MUST be wrapped inside a single \`"type": "Form"\` component. This Form component MUST have a unique \`"name"\` (e.g., "service_form").

**SUPPORTED COMPONENTS:**
STRICTLY use ONLY the following components with the EXACT properties shown:

- **Basic Text Components**:
  - \`TextHeading\`: \`{"type": "TextHeading", "text": "Your Heading Text"}\`
  - \`TextSubheading\`: \`{"type": "TextSubheading", "text": "Your Subheading Text"}\`
  - \`TextBody\`: \`{"type": "TextBody", "text": "Your body text content."}\`
  - \`TextCaption\`: \`{"type": "TextCaption", "text": "Your caption text."}\`

- **\`Image\`**: \`{"type": "Image", "src": "placeholder_image.png"}\`.
  - The \`"src"\` property is REQUIRED. Do NOT use "image_id" or "label".

- **Input Components (must be inside a Form)**:
  - \`TextInput\`: \`{"type": "TextInput", "name": "input_name", "label": "Input Label"}\`
  - \`DatePicker\`: \`{"type": "DatePicker", "name": "date_picker_name", "label": "Select a Date"}\`
  - \`CheckboxGroup\`: \`{"type": "CheckboxGroup", "name": "checkbox_name", "label": "Group Label", "data-source": [...]}\`
  - \`RadioButtonsGroup\`: \`{"type": "RadioButtonsGroup", "name": "radio_name", "label": "Group Label", "data-source": [...]}\`
  - \`Dropdown\`: \`{"type": "Dropdown", "name": "dropdown_name", "label": "Dropdown Label", "data-source": [...]}\`
  - \`OptIn\`: \`{"type": "OptIn", "name": "opt_in_name", "label": "Agree to terms"}\`

- **\`Footer\` (for actions)**: The primary way to trigger actions.
  - \`{"type": "Footer", "label": "Button Text", "on-click-action": {...}}\`

**CRITICAL for \`data-source\`**: For \`CheckboxGroup\`, \`RadioButtonsGroup\`, and \`Dropdown\`, the "data-source" array MUST contain objects, each with a unique \`"id"\` and a \`"title"\`. Example: \`"data-source": [{"id": "opt_1", "title": "Option 1"}]\`.

**CRITICAL for Actions (\`Footer\` component):**
- **NO TOP-LEVEL \`actions\` ARRAY.** All actions are defined inline inside the \`on-click-action\` property of a component like \`Footer\`.
- **Navigation Action**: To navigate to the next screen, use this exact structure. The target screen ID must be nested inside a \`next\` object with a \`name\` property.
  \`\`\`json
  "on-click-action": {
    "name": "navigate",
    "next": {
      "type": "screen",
      "name": "SCREEN_ID_TO_GO_TO"
    }
  }
  \`\`\`
- **Completion Action**: To end the flow and submit data. The payload references data using \`\\"\u0024{form.user_details_form.full_name}"}\`. Note the forms must be named uniquely.
  The AI should generate the payload with literal strings like \`"\u0024{form.user_details_form.full_name}"\`, not actual variables.
  "on-click-action": {
    "name": "complete",
     "payload": {
      "user_name": "\u0024{form.user_details_form.full_name}",
      "selection": "\u0024{form.service_form.service_type}"
    }
  }
  \`\`\`

**General Instructions:**
- If a page is long, split it into multiple screens.
- Ensure the final output is a single, valid JSON object with no trailing commas.

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