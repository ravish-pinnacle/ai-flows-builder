"use client";

import { useState, type ChangeEvent, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Download, FileJson } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface FlowImporterExporterProps {
  currentFlow: string;
  onFlowImported: (flowJson: string) => void;
}

export function FlowImporterExporter({ currentFlow, onFlowImported }: FlowImporterExporterProps) {
  const [flowToDisplay, setFlowToDisplay] = useState(currentFlow);
  const { toast } = useToast();

  useEffect(() => {
    setFlowToDisplay(currentFlow);
  }, [currentFlow]);

  const handleFileImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/json") {
        toast({ title: "Import Error", description: "Please select a valid JSON file.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          JSON.parse(text); // Validate JSON
          onFlowImported(text);
          setFlowToDisplay(text);
          toast({ title: "Success", description: "Flow JSON imported successfully." });
        } catch (err) {
          toast({ title: "Import Error", description: "Invalid JSON file content.", variant: "destructive" });
        }
      };
      reader.onerror = () => {
        toast({ title: "Import Error", description: "Failed to read the file.", variant: "destructive" });
      };
      reader.readAsText(file);
    }
     // Reset file input to allow re-uploading the same file
    if(event.target) {
      event.target.value = "";
    }
  };

  const handleExport = () => {
    if (!flowToDisplay.trim()) {
      toast({ title: "Export Error", description: "No flow data to export.", variant: "destructive" });
      return;
    }
    try {
      JSON.parse(flowToDisplay); // Validate JSON before exporting
      const blob = new Blob([flowToDisplay], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "whatsapp_flow.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Success", description: "Flow JSON exported successfully." });
    } catch (error) {
      toast({ title: "Export Error", description: "Invalid JSON data. Cannot export.", variant: "destructive" });
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileJson className="h-5 w-5 text-primary" />
          <span>Import / Export Flow</span>
        </CardTitle>
        <CardDescription>Import or export your flow definition in JSON format.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Import Section */}
        <div>
          <Label htmlFor="importFile" className="text-base font-medium">Import Flow from JSON</Label>
          <div className="mt-2 flex items-center gap-2">
            <Input
              id="importFile"
              type="file"
              accept=".json,application/json"
              onChange={handleFileImport}
              className="flex-grow"
            />
          </div>
           <p className="text-xs text-muted-foreground mt-1">Select a .json file to import.</p>
        </div>

        <Separator />

        {/* Export Section */}
        <div>
          <Label htmlFor="exportJson" className="text-base font-medium">Export Current Flow as JSON</Label>
          <Textarea
            id="exportJson"
            value={flowToDisplay}
            readOnly
            rows={6}
            placeholder="Current flow JSON will appear here..."
            className="mt-2 font-mono text-xs bg-muted"
          />
          <Button onClick={handleExport} disabled={!flowToDisplay.trim()} className="w-full mt-2">
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
