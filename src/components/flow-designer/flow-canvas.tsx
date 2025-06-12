
"use client";

import type { FC } from 'react';
import { useState } from 'react';
import type { DragEvent } from 'react';

interface FlowCanvasProps {
  flowJson: string;
}

export const FlowCanvas: FC<FlowCanvasProps> = ({ flowJson }) => {
  const [droppedComponents, setDroppedComponents] = useState<string[]>([]);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData("text/plain");
    if (componentType) {
      console.log("Dropped component type:", componentType);
      setDroppedComponents(prev => [...prev, componentType]);
      // In a real app, this would update the flowJson or an internal visual representation
    }
  };

  return (
    <div
      className="flex flex-col items-center h-full bg-muted/30 p-4 overflow-auto"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="text-center space-y-4 w-full max-w-3xl">
        <h2 className="text-2xl font-semibold text-foreground">Flow Design Canvas</h2>

        {droppedComponents.length === 0 && !flowJson && (
          <p className="text-muted-foreground py-8">
            Drag components from the library here, or generate/import a flow to get started.
          </p>
        )}

        {droppedComponents.length > 0 && (
          <div className="mt-4 p-3 border rounded-md bg-card shadow w-full text-left">
            <h3 className="font-medium mb-2 text-card-foreground">Components on Canvas:</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              {droppedComponents.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {flowJson && (
          <div className="mt-4 p-4 border rounded-md bg-background shadow w-full text-left">
            <h3 className="font-medium mb-2">Current Flow Data (Raw JSON):</h3>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-60">{flowJson}</pre>
          </div>
        )}

        {!flowJson && droppedComponents.length > 0 && (
           <p className="text-sm text-muted-foreground italic mt-2">Raw flow JSON is currently empty. Generate or import a flow to see its data.</p>
        )}

      </div>
    </div>
  );
};
