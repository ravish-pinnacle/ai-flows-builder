
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Heading1, 
  PilcrowSquare, 
  ImageIcon, 
  MousePointerClick,
  Edit3, // TextInput
  Type, // TextArea, generic text
  ListChecks, 
  CircleDot, 
  ChevronDownSquare, 
  CalendarDays, // DatePicker
  ToggleLeft, // OptIn
  Link as LinkIcon, // EmbeddedLink
  ShieldQuestion, // ScreenConfirmation
  LayoutGrid
} from "lucide-react";

// Based on WhatsApp Flow Components: https://developers.facebook.com/docs/whatsapp/flows/reference/flowjson/components
const components = [
  { name: "Headline", icon: <Heading1 className="h-5 w-5" />, description: "A large text heading for the screen." },
  { name: "Text", icon: <PilcrowSquare className="h-5 w-5" />, description: "A block of text content (paragraph)." },
  { name: "Image", icon: <ImageIcon className="h-5 w-5" />, description: "Display an image from a URL or uploaded asset." },
  { name: "Button", icon: <MousePointerClick className="h-5 w-5" />, description: "A clickable button to trigger actions." },
  { name: "TextInput", icon: <Edit3 className="h-5 w-5" />, description: "A single-line text input field." },
  { name: "TextArea", icon: <Type className="h-5 w-5" />, description: "A multi-line text input field for longer text." },
  { name: "CheckboxGroup", icon: <ListChecks className="h-5 w-5" />, description: "A group of checkboxes for multiple selections." },
  { name: "RadioButtonGroup", icon: <CircleDot className="h-5 w-5" />, description: "A group of radio buttons for single selection." },
  { name: "Dropdown", icon: <ChevronDownSquare className="h-5 w-5" />, description: "A dropdown menu for selecting one option from a list." },
  { name: "DatePicker", icon: <CalendarDays className="h-5 w-5" />, description: "A component for selecting a date." },
  { name: "OptIn", icon: <ToggleLeft className="h-5 w-5" />, description: "An opt-in toggle component, typically for agreements." },
  { name: "EmbeddedLink", icon: <LinkIcon className="h-5 w-5" />, description: "Text that acts as a hyperlink to an external URL." },
  { name: "Footer", icon: <PilcrowSquare className="h-5 w-5" />, description: "A footer text, often for disclaimers or short notes." }, // PilcrowSquare is a placeholder
  { name: "ScreenConfirmation", icon: <ShieldQuestion className="h-5 w-5" />, description: "A component used to define confirmation screens."}
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
