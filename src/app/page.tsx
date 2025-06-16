
"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { FlowCanvas } from "@/components/flow-designer/flow-canvas";
import { PreviewWindow } from "@/components/real-time-preview/preview-window";
import { AIGenerator } from "@/components/ai-tools/ai-generator";
import { ScreenshotToFlowGenerator } from "@/components/ai-tools/screenshot-to-flow-generator";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FlowForgePage() {
  const [currentFlowJson, setCurrentFlowJson] = useState<string>("");

  const handleFlowUpdate = (newFlowJson: string) => {
    setCurrentFlowJson(newFlowJson);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <AppHeader />
      <ResizablePanelGroup direction="horizontal" className="flex-grow border-t">
        {/* Left Panel: Tools */}
        <ResizablePanel defaultSize={30} minSize={20} maxSize={40} className="flex flex-col">
          <ScrollArea className="h-full p-4">
            <h2 className="text-xl font-semibold mb-4 font-headline">Tools</h2>
            <Accordion type="multiple" className="w-full space-y-2" defaultValue={["screenshot-to-flow"]}>
              <AccordionItem value="ai-generator">
                <AccordionTrigger className="text-base hover:no-underline bg-card p-3 rounded-md shadow-sm">AI Flow Generator</AccordionTrigger>
                <AccordionContent className="pt-1">
                  <AIGenerator onFlowGenerated={handleFlowUpdate} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="screenshot-to-flow">
                <AccordionTrigger className="text-base hover:no-underline bg-card p-3 rounded-md shadow-sm">Screenshot to Flow (Experimental)</AccordionTrigger>
                <AccordionContent className="pt-1">
                  <ScreenshotToFlowGenerator onFlowGenerated={handleFlowUpdate} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-border w-2 hover:bg-primary/20 transition-colors" />

        {/* Right Panel: Designer & Preview */}
        <ResizablePanel defaultSize={70} className="flex flex-col">
          <Tabs defaultValue="designer" className="h-full flex flex-col p-2">
            <TabsList className="mb-2 self-start bg-muted p-1 rounded-lg">
              <TabsTrigger value="designer" className="px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-md">Flow Designer</TabsTrigger>
              <TabsTrigger value="preview" className="px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-md">Real-time Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="designer" className="flex-grow border rounded-lg shadow-inner overflow-hidden bg-card">
              <FlowCanvas flowJson={currentFlowJson} />
            </TabsContent>
            <TabsContent value="preview" className="flex-grow border rounded-lg shadow-inner overflow-hidden bg-card">
              <PreviewWindow flowJson={currentFlowJson} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
