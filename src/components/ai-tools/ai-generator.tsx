"use client";

import { useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateFlowFromTextPrompt, type GenerateFlowFromTextPromptInput } from "@/ai/flows/generate-flow-from-text-prompt";

interface AIGeneratorProps {
  onFlowGenerated: (flowJson: string) => void;
}

export function AIGenerator({ onFlowGenerated }: AIGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [generatedFlow, setGeneratedFlow] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast({ title: "Error", description: "Prompt cannot be empty.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setGeneratedFlow("");
    try {
      const input: GenerateFlowFromTextPromptInput = { prompt };
      const result = await generateFlowFromTextPrompt(input);
      setGeneratedFlow(result.flow);
      onFlowGenerated(result.flow); // Update parent state
      toast({ title: "Success", description: "Flow generated successfully!" });
    } catch (error) {
      console.error("Error generating flow:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: "Error Generating Flow",
        description: `An error occurred: ${errorMessage}. Please check the console for more details.`,
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
          <Wand2 className="h-5 w-5 text-primary" />
          <span>AI Flow Generator</span>
        </CardTitle>
        <CardDescription>Generate a WhatsApp flow from a text prompt.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="aiPrompt">Enter your prompt</Label>
            <Textarea
              id="aiPrompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Create a flow for pizza ordering with options for size, toppings, and delivery."
              rows={4}
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate Flow
          </Button>
        </form>
      </CardContent>
      {generatedFlow && (
        <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
            <Label htmlFor="generatedFlowOutput">Generated Flow JSON:</Label>
            <Textarea
              id="generatedFlowOutput"
              value={generatedFlow}
              readOnly
              rows={6}
              className="font-mono text-xs"
            />
        </CardFooter>
      )}
    </Card>
  );
}
