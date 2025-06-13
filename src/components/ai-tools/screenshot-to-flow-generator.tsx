"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ImageUp, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateFlowFromScreenshotFlow, type GenerateFlowFromScreenshotInput } from "@/ai/flows/generate-flow-from-screenshot-flow";

interface ScreenshotToFlowGeneratorProps {
  onFlowGenerated: (flowJson: string) => void;
}

export function ScreenshotToFlowGenerator({ onFlowGenerated }: ScreenshotToFlowGeneratorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedFlow, setGeneratedFlow] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Error", description: "Please select a valid image file.", variant: "destructive" });
        setSelectedFile(null);
        setPreviewUrl(null);
        if (event.target) event.target.value = ""; // Reset file input
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({ title: "Error", description: "Please select a screenshot to upload.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setGeneratedFlow("");

    const reader = new FileReader();
    reader.onloadend = async () => {
      const screenshotDataUri = reader.result as string;
      try {
        const input: GenerateFlowFromScreenshotInput = { screenshotDataUri };
        const result = await generateFlowFromScreenshotFlow(input);
        setGeneratedFlow(result.flow);
        onFlowGenerated(result.flow);
        toast({ title: "Success", description: "Flow generated from screenshot successfully!" });
      } catch (error) {
        console.error("Error generating flow from screenshot:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({
          title: "Error Generating Flow",
          description: `An error occurred: ${errorMessage}. Please check the console for more details. This feature is experimental and may not always work perfectly.`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageUp className="h-5 w-5 text-primary" />
          <span>Screenshot to Flow (Experimental)</span>
        </CardTitle>
        <CardDescription>Upload a website screenshot to generate a WhatsApp flow.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="screenshotUpload">Upload Screenshot</Label>
            <Input
              id="screenshotUpload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1"
            />
          </div>
          {previewUrl && (
            <div className="mt-2">
              <img src={previewUrl} alt="Screenshot preview" className="max-w-full h-auto rounded-md border" style={{ maxHeight: '200px' }} />
            </div>
          )}
          <Button type="submit" disabled={isLoading || !selectedFile} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Generate Flow from Screenshot
          </Button>
        </form>
      </CardContent>
      {generatedFlow && (
        <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
          <Label htmlFor="generatedScreenshotFlowOutput">Generated Flow JSON:</Label>
          <Textarea
            id="generatedScreenshotFlowOutput"
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
