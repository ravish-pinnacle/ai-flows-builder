
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
  prompt: `You are an expert UI/UX designer who creates valid WhatsApp Flows. Analyze the provided screenshot and instructions to generate a functional WhatsApp Flow JSON.

**CRITICAL INSTRUCTIONS: READ AND FOLLOW EXACTLY**

Your primary goal is to generate a VALID JSON that strictly follows the structure of the complete example provided at the end of these instructions. Do not deviate.

**KEY STRUCTURAL RULES:**
1.  **ROOT PROPERTIES**: The JSON MUST start with \`"version": "7.1"\`, \`"data_api_version": "3.0"\`, and a \`"routing_model"\`.
2.  **SCREENS**: Each screen object MUST have an \`id\`, a \`title\`, and a \`layout\` object.
3.  **FORM & FOOTER PLACEMENT (VERY IMPORTANT)**:
    - To use any input fields (\`TextInput\`, \`Dropdown\`, \`PhotoPicker\`, etc.), they MUST be inside a \`"type": "Form"\` component.
    - The \`Footer\` component that serves as the "Next" or "Submit" button for a form MUST be the **LAST** item inside the \`Form\`'s \`children\` array.
    - **DO NOT** place the \`Footer\` outside the \`layout.children\` array or as a sibling to the \`layout\` object. This is invalid. Study the example below to see the correct placement.

**COMPONENT DEFINITIONS:**
- \`Headline\`: \`{"type": "Headline", "text": "..."}\`
- \`Text\`: \`{"type": "Text", "text": "...", "style": ["BOLD"]}\`
- \`Image\`: \`{"type": "Image", "src": "placeholder_image.png"}\` (Do NOT use \`label\` or \`image_id\`)
- \`TextInput\`: \`{"type": "TextInput", "name": "...", "label": "..."}\`
- \`RadioButtonsGroup\`: \`{"type": "RadioButtonsGroup", "name": "...", "label": "...", "data-source": [{"id": "a", "title": "A"}]}\` (data-source is required)
- \`Dropdown\`: \`{"type": "Dropdown", "name": "...", "label": "...", "data-source": [{"id": "b", "title": "B"}]}\` (data-source is required)
- \`DatePicker\`: \`{"type": "DatePicker", "name": "...", "label": "..."}\`
- \`PhotoPicker\`: \`{"type": "PhotoPicker", "name": "...", "label": "...", "description": "...", "photo-source": "camera_gallery", "min-uploaded-photos": 1, "max-uploaded-photos": 10}\`.
- \`DocumentPicker\`: \`{"type": "DocumentPicker", "name": "...", "label": "...", "description": "...", "max-file-size-kb": 1024, "allowed-mime-types": ["application/pdf"]}\`.

**MEDIA UPLOAD CONSTRAINTS (VERY IMPORTANT):**
- Only ONE \`PhotoPicker\` OR ONE \`DocumentPicker\` is allowed per screen. You CANNOT use both on the same screen.
- Media picker components MUST be inside a \`Form\`.
- \`min-uploaded-photos\` cannot be greater than \`max-uploaded-photos\`. Same for documents.
- The value from a media picker (e.g., \`\u0024{form.form_name.picker_name}\`) can ONLY be used in a \`complete\` or \`data_exchange\` action. It CANNOT be used in a \`navigate\` action.
- The picker's value must be assigned to a top-level property in the payload, like \`"payload": { "my_media": "\u0024{form.form_name.picker_name}" }\`. This is VALID. \`"payload": { "media": {"photo": "\u0024{form.form_name.picker_name}"} }\` is INVALID.

**ACTION DEFINITIONS (Inside Footer):**
- **Navigate**: \`{"name": "navigate", "next": { "type": "screen", "name": "NEXT_SCREEN_ID" } }\`
- **Complete/Data Exchange**: \`{"name": "complete", "payload": { "field": "\u0024{form.form_name.field_name}" } }\`

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
            "type": "Headline",
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
            "type": "Headline",
            "text": "This is the final screen."
          },
          {
            "type": "Form",
            "name": "form_b",
            "children": [
              {
                "type": "Text",
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

Now, based on the user's input below, generate a new, valid JSON file that follows the exact structure of the example above. Pay special attention to the correct placement of all Footer components and media upload constraints.

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
