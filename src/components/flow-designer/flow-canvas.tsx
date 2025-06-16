
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import type { DragEvent } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Code, ClipboardCopy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface FlowCanvasProps {
  flowJson: string;
}

interface DroppedComponent {
  id: string;
  name: string;
  // Future: Add properties specific to each component type
}

export const FlowCanvas: FC<FlowCanvasProps> = ({ flowJson }) => {
  const [droppedComponents, setDroppedComponents] = useState<DroppedComponent[]>([]);
  const [currentFlow, setCurrentFlow] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual');
  const { toast } = useToast();

  useEffect(() => {
    try {
      if (flowJson && flowJson.trim() !== "") {
        const parsedFlow = JSON.parse(flowJson);
        setCurrentFlow(parsedFlow);
        // Potentially extract components from imported/generated JSON to populate visual view
        // For now, we clear manually dropped components if a new flow is loaded via JSON
        setDroppedComponents([]);
      } else {
        setCurrentFlow(null);
      }
    } catch (error) {
      console.error("Error parsing flow JSON in FlowCanvas:", error);
      setCurrentFlow(null); // Indicate an error or invalid JSON
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: "Invalid Flow JSON",
        description: `The Flow JSON could not be parsed: ${errorMessage}. Please check the JSON structure.`,
        variant: "destructive",
      });
    }
  }, [flowJson, toast]);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rawData = e.dataTransfer.getData("application/json");
    try {
      const data = JSON.parse(rawData);
      if (data.type === "component" && data.name) {
        console.log("Dropped component:", data.name);
        const newComponent: DroppedComponent = {
          id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: data.name,
        };
        setDroppedComponents(prev => [...prev, newComponent]);
        // In a real app, this would update an internal visual representation
        // and potentially modify the flowJson if in a visual editing mode.
      }
    } catch (error) {
      console.error("Error processing dropped data:", error);
    }
  };

  const handleCopyJson = async () => {
    if (!currentFlow) {
      toast({ title: "Error", description: "No JSON to copy.", variant: "destructive" });
      return;
    }
    try {
      const jsonString = JSON.stringify(currentFlow, null, 2);
      await navigator.clipboard.writeText(jsonString);
      toast({ title: "Success", description: "Flow JSON copied to clipboard!" });
    } catch (err) {
      console.error("Failed to copy JSON: ", err);
      toast({ title: "Error", description: "Failed to copy JSON to clipboard.", variant: "destructive" });
    }
  };

  const renderVisualView = () => (
    <div className="p-4 space-y-4">
      {droppedComponents.length === 0 && (!currentFlow || (currentFlow.screens || []).length === 0) && (
        <div className="text-center py-12">
          <LayoutPlaceholderIcon className="mx-auto h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-lg text-muted-foreground">
            Design your WhatsApp Flow screen here.
          </p>
          <p className="text-sm text-muted-foreground">
            Drag components from the library or generate/import a flow.
          </p>
        </div>
      )}

      {/* Render components from currentFlow (if any) */}
      {currentFlow && (currentFlow.screens || []).map((screen: any, screenIndex: number) => (
        <Card key={screen.id || `screen-${screenIndex}`} className="shadow-lg">
          <CardHeader>
            <CardTitle>Screen: {screen.id || `Screen ${screenIndex + 1}`}</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[100px] p-4 border-2 border-dashed border-muted rounded-md bg-background/50">
            {screen.layout?.children?.map((component: any, compIndex: number) => (
              <div key={component.id || `comp-${screenIndex}-${compIndex}`} className="p-2 my-1 border rounded bg-card text-sm">
                <strong>{component.type || 'Unknown Component'}:</strong> {component.label || component.text || component.name || `(ID: ${component.id})`}
              </div>
            ))}
            {(!screen.layout?.children || screen.layout.children.length === 0) && (
              <p className="text-xs text-muted-foreground">This screen has no components defined in its layout yet.</p>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Render manually dropped components if no flow is loaded or for a new screen */}
      {droppedComponents.length > 0 && (!currentFlow || (currentFlow.screens || []).length === 0) && (
        <Card className="mt-4 shadow-md">
          <CardHeader>
            <CardTitle>New Screen Components</CardTitle>
          </CardHeader>
          <CardContent className="p-4 border-2 border-dashed border-muted rounded-md bg-background/50 min-h-[100px]">
            {droppedComponents.map((item) => (
              <div key={item.id} className="p-2 my-1 border rounded bg-card text-sm">
                {item.name}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderJsonView = () => (
    <div className="p-4">
      {currentFlow ? (
        <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-[calc(100vh-200px)] shadow-inner">
          {JSON.stringify(currentFlow, null, 2)}
        </pre>
      ) : (
         <div className="text-center py-12">
           <Code className="mx-auto h-16 w-16 text-muted-foreground" />
           <p className="mt-4 text-lg text-muted-foreground">
             {flowJson && flowJson.trim() !== "" ? "JSON is invalid or empty." : "No flow JSON loaded."}
           </p>
           <p className="text-sm text-muted-foreground">
            {flowJson && flowJson.trim() !== "" ? "Please check the structure or generate/import a valid flow." : "Generate or import a flow to see its raw JSON data."}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div
      className="flex flex-col h-full bg-muted/20"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="p-2 border-b bg-card flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">
          {viewMode === 'visual' ? 'Visual Designer' : 'JSON Editor'}
        </h2>
        <div className="flex gap-1 items-center">
          {viewMode === 'json' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyJson}
              aria-label="Copy JSON"
              disabled={!currentFlow}
            >
              <ClipboardCopy className="h-4 w-4 mr-2" />
              Copy JSON
            </Button>
          )}
          <Button
            variant={viewMode === 'visual' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('visual')}
            aria-label="Visual View"
          >
            <Eye className="h-4 w-4 mr-2" />
            Visual
          </Button>
          <Button
             variant={viewMode === 'json' ? 'secondary' : 'ghost'}
             size="sm"
             onClick={() => setViewMode('json')}
             aria-label="JSON View"
          >
            <Code className="h-4 w-4 mr-2" />
            JSON
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-grow">
        {viewMode === 'visual' ? renderVisualView() : renderJsonView()}
      </ScrollArea>
    </div>
  );
};

// Placeholder for a layout icon if no content
const LayoutPlaceholderIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="9" y1="21" x2="9" y2="9"></line>
    <path d="M15 21v-5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v5"></path>
    <path d="M14 9V8a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1"></path>
  </svg>
);

