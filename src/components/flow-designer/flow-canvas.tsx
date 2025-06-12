"use client";

import type { FC } from 'react';

interface FlowCanvasProps {
  flowJson: string;
}

export const FlowCanvas: FC<FlowCanvasProps> = ({ flowJson }) => {
  // In a real app, this component would parse and render the flowJson.
  // For now, it's a placeholder.

  return (
    <div className="flex flex-col items-center justify-center h-full bg-muted/30 p-4">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Flow Design Canvas</h2>
        <p className="text-muted-foreground">
          Drag and drop components from the library to build your WhatsApp flow.
        </p>
        {/* Placeholder for rendering the flow based on flowJson */}
        {flowJson && (
          <div className="mt-4 p-4 border rounded-md bg-background w-full max-w-md text-left">
            <h3 className="font-medium mb-2">Current Flow Data (Raw JSON):</h3>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-60">{flowJson}</pre>
          </div>
        )}
         {!flowJson && (
            <p className="text-sm text-muted-foreground italic mt-2">No flow data loaded. Generate or import a flow to see it here.</p>
         )}
      </div>
    </div>
  );
};
