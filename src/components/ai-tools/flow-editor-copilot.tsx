
"use client";

import { useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { editFlowWithPrompt, type EditFlowWithPromptInput } from "@/ai/flows/edit-flow-with-prompt";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FlowEditorCopilotProps {
  currentFlowJson: string;
  onFlowEdited: (flowJson: string) => void;
}

export function FlowEditorCopilot({ currentFlowJson, onFlowEdited }: FlowEditorCopilotProps) {
  const [editPrompt, setEditPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentFlowJson.trim()) {
      toast({ title: "Error", description: "There is no current flow JSON to edit.", variant: "destructive" });
      return;
    }
    if (!editPrompt.trim()) {
      toast({ title: "Error", description: "Edit prompt cannot be empty.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const input: EditFlowWithPromptInput = { currentFlowJson, editPrompt };
      const result = await editFlowWithPrompt(input);
      onFlowEdited(result.editedFlowJson);
      toast({ title: "Success", description: "Flow edited successfully!" });
      setEditPrompt(""); // Clear prompt on success
    } catch (error) {
      console.error("Error editing flow:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: "Error Editing Flow",
        description: `An error occurred: ${errorMessage}. Please check the console for more details or try rephrasing your request.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Edit className="h-5 w-5 text-primary" />
          <span>AI Flow Editor</span>
        </CardTitle>
        <CardDescription>Use a prompt to make changes to the current flow JSON.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="editPrompt">Enter your edit instructions</Label>
            <Textarea
              id="editPrompt"
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="e.g., Change the title of SCREEN_WELCOME to 'Welcome!' or Add a new TextInput field for 'phone_number' in the 'user_details_form'."
              rows={4}
              className="mt-1"
              disabled={!currentFlowJson.trim()}
            />
          </div>
          <Button type="submit" disabled={isLoading || !currentFlowJson.trim() || !editPrompt.trim()} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Apply Edits
          </Button>
        </form>
        {currentFlowJson && (
          <div className="space-y-1 pt-2">
            <Label htmlFor="currentFlowJsonDisplay">Current Flow (for reference):</Label>
            <ScrollArea className="h-32 w-full rounded-md border p-2 bg-muted/50">
                <pre className="text-xs whitespace-pre-wrap break-all">
                  {currentFlowJson}
                </pre>
            </ScrollArea>
          </div>
        )}
        {!currentFlowJson.trim() && (
            <p className="text-sm text-muted-foreground text-center py-4">
                Generate or import a flow first to enable editing.
            </p>
        )}
      </CardContent>
    </Card>
  );
}
