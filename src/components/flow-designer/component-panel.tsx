
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Heading1, 
  PilcrowSquare, 
  ImageIcon, 
  MousePointerClick, // Changed from MousePointerSquare
  Edit3, 
  ListChecks, 
  CircleDot, 
  ChevronDownSquare, 
  ToggleLeft, 
  CalendarDays,
  ShieldQuestion,
  LayoutGrid,
  Type // Added Type for general text
} from "lucide-react";

// Based on WhatsApp Flow Components: https://developers.facebook.com/docs/whatsapp/flows/reference/flowjson/components
const components = [
  { name: "Headline", icon: <Heading1 className="h-5 w-5" />, description: "A large text heading." },
  { name: "Text", icon: <PilcrowSquare className="h-5 w-5" />, description: "A block of text content." }, // Changed from Paragraph
  { name: "Image", icon: <ImageIcon className="h-5 w-5" />, description: "Display an image." },
  { name: "Button", icon: <MousePointerClick className="h-5 w-5" />, description: "A clickable button." },
  { name: "TextInput", icon: <Edit3 className="h-5 w-5" />, description: "A single-line text input field." },
  { name: "TextArea", icon: <Type className="h-5 w-5" />, description: "A multi-line text input field." }, // Added TextArea
  { name: "CheckboxGroup", icon: <ListChecks className="h-5 w-5" />, description: "A group of checkboxes for multiple selections." },
  { name: "RadioButtonGroup", icon: <CircleDot className="h-5 w-5" />, description: "A group of radio buttons for single selection." },
  { name: "Dropdown", icon: <ChevronDownSquare className="h-5 w-5" />, description: "A dropdown menu for selection." },
  { name: "DatePicker", icon: <CalendarDays className="h-5 w-5" />, description: "A date selection component." }, // Added DatePicker
  { name: "OptIn", icon: <ToggleLeft className="h-5 w-5" />, description: "An opt-in toggle component." }, // Added OptIn
  { name: "EmbeddedLink", icon: <Type className="h-5 w-5" />, description: "Text that acts as a hyperlink." }, // Added EmbeddedLink - Type icon is a placeholder
  { name: "Footer", icon: <PilcrowSquare className="h-5 w-5" />, description: "A footer text, often for disclaimers." }, // Added Footer - PilcrowSquare is placeholder
  { name: "ScreenConfirmation", icon: <ShieldQuestion className="h-5 w-5" />, description: "A component for confirmation screens."} // Added ScreenConfirmation
];

export function ComponentPanel() {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, componentName: string) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "component", name: componentName }));
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
            className="flex items-center gap-3 p-2 border rounded-md hover:bg-accent hover:text-accent-foreground cursor-grab active:cursor-grabbing transition-colors"
            title={component.description}
          >
            {component.icon}
            <span className="text-sm">{component.name}</span>
          </div>
        ))}
        <p className="text-xs text-muted-foreground pt-2">Drag components to the canvas to build your flow screen.</p>
      </CardContent>
    </Card>
  );
}
