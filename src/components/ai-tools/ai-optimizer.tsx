"use client";

import { useState, type FormEvent, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Brain, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeAndOptimizeFlow, type AnalyzeAndOptimizeInput } from "@/ai/flows/analyze-and-optimize-flow";

interface AIOptimizerProps {
  currentFlow: string;
}

export function AIOptimizer({ currentFlow }: AIOptimizerProps) {
  const [flowToOptimize, setFlowToOptimize] = useState(currentFlow);
  const [suggestions, setSuggestions] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFlowToOptimize(currentFlow);
  }, [currentFlow]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!flowToOptimize.trim()) {
      toast({ title: "Error", description: "Flow JSON cannot be empty.", variant: "destructive" });
      return;
    }
    try {
      JSON.parse(flowToOptimize); // Validate JSON
    } catch (error) {
      toast({ title: "Error", description: "Invalid JSON format for the flow.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setSuggestions("");
    try {
      const input: AnalyzeAndOptimizeInput = { flowDefinition: flowToOptimize };
      const result = await analyzeAndOptimizeFlow(input);
      setSuggestions(result.suggestions);
      toast({ title: "Success", description: "Flow analysis complete. Suggestions provided." });
    } catch (error) {
      console.error("Error optimizing flow:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: "Error Optimizing Flow",
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
          <Brain className="h-5 w-5 text-primary" />
          <span>AI Flow Optimizer</span>
        </CardTitle>
        <CardDescription>Analyze your flow and get AI-powered suggestions for improvement.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="flowJsonInput">Paste your Flow JSON here</Label>
            <Textarea
              id="flowJsonInput"
              value={flowToOptimize}
              onChange={(e) => setFlowToOptimize(e.target.value)}
              placeholder='{ "version": "3.0", "screens": [...] }'
              rows={6}
              className="mt-1 font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">The current flow from the editor/generator is pre-filled.</p>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Settings2 className="mr-2 h-4 w-4" />
            )}
            Analyze and Optimize
          </Button>
        </form>
      </CardContent>
      {suggestions && (
        <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
          <Label htmlFor="optimizationSuggestions">Optimization Suggestions:</Label>
          <Textarea
            id="optimizationSuggestions"
            value={suggestions}
            readOnly
            rows={8}
            className="bg-muted"
          />
        </CardFooter>
      )}
    </Card>
  );
}
