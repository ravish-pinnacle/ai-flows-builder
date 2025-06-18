
'use server';
/**
 * @fileOverview Edits an existing WhatsApp flow JSON based on a text prompt.
 *
 * - editFlowWithPrompt - A function that takes existing flow JSON and an edit instruction, then returns the modified flow JSON.
 * - EditFlowWithPromptInput - The input type for the editFlowWithPrompt function.
 * - EditFlowWithPromptOutput - The return type for the editFlowWithPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EditFlowWithPromptInputSchema = z.object({
  currentFlowJson: z.string().describe('The current WhatsApp flow in JSON format to be edited.'),
  editPrompt: z.string().describe('The text prompt describing the desired changes to the flow.'),
});
export type EditFlowWithPromptInput = z.infer<typeof EditFlowWithPromptInputSchema>;

const EditFlowWithPromptOutputSchema = z.object({
  editedFlowJson: z.string().describe('The modified WhatsApp flow in JSON format.'),
});
export type EditFlowWithPromptOutput = z.infer<typeof EditFlowWithPromptOutputSchema>;

export async function editFlowWithPrompt(
  input: EditFlowWithPromptInput
): Promise<EditFlowWithPromptOutput> {
  return editFlowWithPromptFlow(input);
}

const editorPrompt = ai.definePrompt({
  name: 'editFlowWithPromptPrompt',
  input: {schema: EditFlowWithPromptInputSchema},
  output: {schema: EditFlowWithPromptOutputSchema},
  model: 'googleai/gemini-2.0-flash-exp', // Using a capable model
  prompt: `You are an AI assistant specializing in editing WhatsApp Flow JSON.
You will be given an existing WhatsApp Flow JSON and a text prompt with instructions on how to modify it.
Your goal is to apply the requested changes and return the complete, updated, and VALID WhatsApp Flow JSON.

**CRITICAL INSTRUCTIONS FOR JSON STRUCTURE (Adhere to these strictly):**
1.  **ROOT PROPERTIES**: The JSON MUST start with \`"version": "7.1"\`, \`"data_api_version": "3.0"\`, and a \`"routing_model"\`.
2.  **SCREENS**: Each screen object MUST have an \`id\`, a \`title\` (human-readable), and a \`layout\` object. The last screen in a path should be marked with \`"terminal": true\`.
3.  **FORM & FOOTER PLACEMENT**:
    - Input fields (\`TextInput\`, \`Dropdown\`, etc.) MUST be inside a \`"type": "Form"\` component. Each form must have a unique \`name\`.
    - A \`Footer\` component that serves as a "Next" or "Submit" button for a form MUST be the **LAST** item inside that \`Form\`'s \`children\` array.
    - A \`Footer\` can also be a direct child of the \`layout\` (outside a \`Form\`) if it's for general screen navigation not tied to form submission.
4.  **COMPONENT DEFINITIONS (Examples)**:
    - \`TextHeading\`: \`{"type": "TextHeading", "text": "..."}\`
    - \`TextBody\`: \`{"type": "TextBody", "text": "..."}\`
    - \`Image\`: \`{"type": "Image", "src": "placeholder.png"}\`
    - \`TextInput\`: \`{"type": "TextInput", "name": "...", "label": "..."}\`
    - \`RadioButtonsGroup\`, \`Dropdown\`: MUST have a \`"data-source"\` array with \`id\` and \`title\` for each item.
5.  **ACTION DEFINITIONS (Inside Footer's \`on-click-action\` property)**:
    - **Navigate**: \`{ "name": "navigate", "next": { "type": "screen", "name": "SCREEN_ID" } }\`
    - **Complete**: \`{ "name": "complete", "payload": { "field": "\u0024{form.form_name.field_name}" } }\` (payload collects data from forms).
    - **Data Exchange**: \`{ "name": "data_exchange", "payload": { ... }, "success": { ... }, "error": { ... } }\`

**Existing Flow JSON to Edit:**
\`\`\`json
{{{currentFlowJson}}}
\`\`\`

**User's Edit Instructions:**
{{{editPrompt}}}

Based on the instructions, modify the provided JSON. Ensure the output is only the complete, valid, edited JSON object.
Do not add any explanations or markdown formatting around the JSON output.
Pay close attention to maintaining the structural integrity and component rules outlined above.
If the edit prompt asks for something that violates these rules (e.g., placing a TextInput outside a Form), try to achieve the user's intent in a compliant way or make minimal changes if not possible.
Ensure all screen IDs mentioned in \`routing_model\` correspond to actual screen \`id\`s in the \`screens\` array.
Ensure all navigation targets in footers also correspond to actual screen \`id\`s.
`,
});

const editFlowWithPromptFlow = ai.defineFlow(
  {
    name: 'editFlowWithPromptFlow',
    inputSchema: EditFlowWithPromptInputSchema,
    outputSchema: EditFlowWithPromptOutputSchema,
  },
  async (input) => {
    const { output } = await editorPrompt(input);
    if (!output || !output.editedFlowJson) {
        throw new Error("AI did not return an edited flow JSON.");
    }
    // Basic validation attempt
    try {
        JSON.parse(output.editedFlowJson);
    } catch (e) {
        console.error("Generated edited JSON is invalid:", e);
        throw new Error("AI returned invalid JSON. Please try rephrasing your edit or check the console.");
    }
    return output;
  }
);
