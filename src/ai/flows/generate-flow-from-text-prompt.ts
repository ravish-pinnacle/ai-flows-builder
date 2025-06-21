
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
  model: 'googleai/gemini-2.0-flash-exp',
  prompt: `You are an expert UI/UX designer who creates valid WhatsApp Flows. Analyze the provided text prompt to generate a functional WhatsApp Flow JSON.

**CRITICAL INSTRUCTIONS: READ AND FOLLOW EXACTLY**

Your primary goal is to generate a VALID JSON that strictly follows the structure of the complete example provided at the end of these instructions. Do not deviate from the structure shown in the example.

**KEY STRUCTURAL RULES:**
1.  **ROOT PROPERTIES**: The JSON MUST start with \`"version": "7.1"\`, \`"data_api_version": "3.0"\`, and a \`"routing_model"\`.
2.  **SCREENS**: Each screen object MUST have an \`id\`, a \`title\`, and a \`layout\` object. The last screen should be marked with \`"terminal": true\`.
3.  **FORM & FOOTER PLACEMENT (VERY IMPORTANT)**:
    - To use any input fields (\`TextInput\`, \`Dropdown\`, \`PhotoPicker\`, etc.), they MUST be inside a \`"type": "Form"\` component. Each form must have a unique \`name\`.
    - The \`Footer\` component that serves as the "Next" or "Submit" button for a form MUST be the **LAST** item inside that \`Form\`'s \`children\` array.
    - **DO NOT** place the \`Footer\` outside the \`layout.children\` array. This is invalid. Study the example below to see the correct placement.

**COMPONENT DEFINITIONS:**
- Use specific text types: \`TextHeading\`, \`TextSubheading\`, \`TextBody\`, \`TextCaption\`.
- \`Image\`: Must have a \`"src"\` property. e.g., \`{"type": "Image", "src": "placeholder.png"}\`.
- \`RadioButtonsGroup\` & \`Dropdown\`: MUST have a \`"data-source"\` array with \`id\` and \`title\` for each item.
- \`PhotoPicker\`: \`{"type": "PhotoPicker", "name": "...", "label": "..."}\`. Used for uploading images.
- \`DocumentPicker\`: \`{"type": "DocumentPicker", "name": "...", "label": "..."}\`. Used for uploading documents.

**MEDIA UPLOAD CONSTRAINTS (VERY IMPORTANT):**
- Only ONE \`PhotoPicker\` OR ONE \`DocumentPicker\` is allowed per screen. You CANNOT use both on the same screen.
- Media picker components MUST be inside a \`Form\`.
- The value from a media picker (e.g., \`\u0024{form.form_name.picker_name}\`) can ONLY be used in a \`complete\` or \`data_exchange\` action. It CANNOT be used in a \`navigate\` action.
- The value from a media picker must be a top-level property in the action's payload. E.g., \`"payload": { "media": "\u0024{form.form_name.picker_name}" }\` is VALID. \`"payload": { "some_object": { "media": "..." } }\` is INVALID.

**ACTION DEFINITIONS (Inside Footer's \`on-click-action\`):**
- **Navigate**: Use the nested \`next\` object: \`{ "name": "navigate", "next": { "type": "screen", "name": "SCREEN_ID" } }\`
- **Complete**: Use a \`payload\` object to gather data from all forms: \`{ "name": "complete", "payload": { "field": "\u0024{form.form_name.field_name}" } }\`

---
**FULL, VALID EXAMPLE TO FOLLOW:**

\`\`\`json
{
  "version": "7.1",
  "data_api_version": "3.0",
  "routing_model": {
    "SCREEN_A": ["SCREEN_B"],
    "SCREEN_B": []
  },
  "screens": [
    {
      "id": "SCREEN_A",
      "title": "Screen A Title",
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          {
            "type": "TextHeading",
            "text": "Welcome to Screen A"
          },
          {
            "type": "Form",
            "name": "form_a",
            "children": [
              {
                "type": "TextInput",
                "name": "user_input",
                "label": "Enter some text"
              },
              {
                "type": "Footer",
                "label": "Go to Screen B",
                "on-click-action": {
                  "name": "navigate",
                  "next": {
                    "type": "screen",
                    "name": "SCREEN_B"
                  }
                }
              }
            ]
          }
        ]
      }
    },
    {
      "id": "SCREEN_B",
      "title": "Screen B Title",
      "terminal": true,
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          {
            "type": "TextHeading",
            "text": "This is the final screen."
          },
          {
            "type": "Form",
            "name": "form_b",
            "children": [
              {
                "type": "TextBody",
                "text": "Click submit to finish."
              },
              {
                "type": "Footer",
                "label": "Submit",
                "on-click-action": {
                  "name": "complete",
                  "payload": {
                    "input_from_a": "\u0024{form.form_a.user_input}"
                  }
                }
              }
            ]
          }
        ]
      }
    }
  ]
}
\`\`\`
---

Now, based on the user's text prompt below, generate a new, valid JSON file that follows the exact structure of the example above. Pay special attention to the correct placement of all Footer components and media upload constraints.

User Prompt: {{{prompt}}}

Output the result as a single JSON object representing the WhatsApp flow.
`,
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
