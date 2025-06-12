"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Type, Image as ImageIcon, MessageSquare, ListChecks, Edit3, LayoutGrid } from "lucide-react";

const components = [
  { name: "Text Message", icon: <Type className="h-5 w-5" /> },
  { name: "Image/Video", icon: <ImageIcon className="h-5 w-5" /> },
  { name: "Quick Reply", icon: <MessageSquare className="h-5 w-5" /> },
  { name: "List Picker", icon: <ListChecks className="h-5 w-5" /> },
  { name: "Form Input", icon: <Edit3 className="h-5 w-5" /> },
];

export function ComponentPanel() {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, componentName: string) => {
    e.dataTransfer.setData("text/plain", componentName);
    // In a real drag-and-drop system, you'd set more complex data.
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <LayoutGrid className="h-5 w-5 text-primary" />
          <span>Components</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {components.map((component) => (
          <div
            key={component.name}
            draggable
            onDragStart={(e) => handleDragStart(e, component.name)}
            className="flex items-center gap-2 p-2 border rounded-md hover:bg-accent hover:text-accent-foreground cursor-grab active:cursor-grabbing transition-colors"
          >
            {component.icon}
            <span className="text-sm">{component.name}</span>
          </div>
        ))}
        <p className="text-xs text-muted-foreground pt-2">Drag components to the canvas.</p>
      </CardContent>
    </Card>
  );
}
