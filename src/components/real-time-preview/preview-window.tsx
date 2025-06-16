
"use client";

import type { FC } from 'react';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Smartphone, Wifi, BatteryFull, MessageCircle, ArrowLeft, CalendarDays, Link as LinkIcon, ShieldQuestion, Send, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { Button as ShadButton } from '@/components/ui/button';
import { Input as ShadInput } from '@/components/ui/input';
import { Textarea as ShadTextarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch'; // For OptIn
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetPortal,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast, type Toast as ImportedToastProps } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Updated FlowComponent interface
interface FlowComponent {
  type: string;
  id?: string; // Optional, not always present
  name?: string; // For form elements
  text?: string; // For Text, TextBody, TextCaption, etc.
  label?: string; // For form elements, Button, Footer
  style?: string[]; // For Text component
  src?: string; // For Image component
  image_id?: string; // Kept for potential backward compatibility, but 'src' is primary now
  "data-source"?: { id: string; title: string }[]; // For CheckboxGroup, RadioButtonGroup, Dropdown
  url?: string; // For EmbeddedLink
  "on-click-action"?: { // For Footer actions primarily
    name: string; // e.g., "navigate", "complete", "data_exchange"
    next?: { type: string; name: string }; // For navigation
    payload?: Record<string, any>; // For complete/data_exchange
  };
  action_id?: string; // For standalone Button components (if still used)
  children?: FlowComponent[]; // For Form component
  // ... other component-specific props
}


interface FlowScreen {
  id: string;
  title?: string; // Human-readable title for the screen
  layout: {
    type: string; // e.g., "SingleColumnLayout"
    children: FlowComponent[];
  };
  terminal?: boolean;
  // ... other screen props
}

interface ParsedFlow {
  version: string;
  data_api_version?: string;
  routing_model?: Record<string, string[]>;
  screens: FlowScreen[];
  actions?: Array<{ id: string; type: string; screen_id?: string; /* other action props */ }>; // Root level actions array for standalone Buttons
  // ... other flow props
}

interface PreviewWindowProps {
  flowJson: string;
}

export const PreviewWindow: FC<PreviewWindowProps> = ({ flowJson }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const phoneRef = useRef<HTMLDivElement>(null);
  
  const { toast: originalToast } = useToast();
  const toast = useCallback((options: ImportedToastProps) => {
    originalToast(options);
  }, [originalToast]);
  
  const [parsedFlow, setParsedFlow] = useState<ParsedFlow | null>(null);
  const [activeScreenId, setActiveScreenId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  useEffect(() => {
    setNavigationHistory([]); 
    if (flowJson) {
      try {
        const newParsedFlow: ParsedFlow = JSON.parse(flowJson);
        setParsedFlow(newParsedFlow);
        setErrorMessage(null);
        if (newParsedFlow && newParsedFlow.screens && newParsedFlow.screens.length > 0) {
          setActiveScreenId(newParsedFlow.screens[0].id);
        } else {
          setActiveScreenId(null);
          if (newParsedFlow && (!newParsedFlow.screens || newParsedFlow.screens.length === 0)) {
            setErrorMessage("Flow has no screens defined.");
          }
        }
      } catch (error) {
        console.error("Error parsing flow JSON for preview:", error);
        setErrorMessage("Invalid Flow JSON. Cannot render preview.");
        setParsedFlow(null);
        setActiveScreenId(null);
      }
    } else {
      setParsedFlow(null);
      setActiveScreenId(null);
      setErrorMessage(null);
    }
  }, [flowJson]);

  const currentScreen = useMemo(() => {
    if (!parsedFlow || !activeScreenId) return null;
    return parsedFlow.screens.find(screen => screen.id === activeScreenId) || null;
  }, [parsedFlow, activeScreenId]);

  const handleLegacyButtonAction = (component: FlowComponent) => {
    const actionId = component.action_id;

    if (!actionId) {
      toast({
        title: "Button Action Missing (Preview)",
        description: `Button "${component.label}" does not have an 'action_id' defined.`,
        variant: "default",
      });
      return;
    }

    if (!parsedFlow || !parsedFlow.actions || parsedFlow.actions.length === 0) {
      toast({
        title: "Flow Structure Issue (Preview)",
        description: `The flow JSON is missing a root 'actions' array, or it's empty. Button actions (like for "${component.label}" with action_id "${actionId}") are defined there and are required for navigation. This flow might be using inline footer actions instead.`,
        variant: "destructive",
      });
      return;
    }

    const action = parsedFlow.actions.find(act => act.id === actionId);

    if (!action) {
      toast({
        title: "Button Action Not Found (Preview)",
        description: `Button "${component.label}" has action_id "${actionId}", but this ID was not found in the root 'actions' array of the flow JSON.`,
        variant: "destructive",
      });
      return;
    }

    if (action.type === "navigate" && action.screen_id) {
      const targetScreen = parsedFlow.screens.find(s => s.id === action.screen_id);
      if (targetScreen) {
        if (activeScreenId) {
          setNavigationHistory(prevHistory => [...prevHistory, activeScreenId]);
        }
        setActiveScreenId(action.screen_id);
        toast({
          title: "Navigation (Preview)",
          description: `Button navigated to screen: ${action.screen_id}`,
        });
      } else {
        toast({
          title: "Navigation Error (Preview)",
          description: `Screen ID "${action.screen_id}" (from action "${actionId}") not found in flow screens.`,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Action Triggered (Preview)",
        description: `Label: ${component.label}, Action ID: ${actionId}, Type: ${action.type}. (This action type is not fully simulated for navigation in preview).`,
      });
    }
  };

  const handleFooterAction = (component: FlowComponent) => {
    const actionDetails = component["on-click-action"];

    if (!actionDetails) {
      toast({
        title: "Footer Action Issue (Preview)",
        description: `Footer "${component.label || component.text}" has no 'on-click-action' defined.`,
        variant: "default",
      });
      return;
    }
    
    const actionName = actionDetails.name;
    const nextScreenDetails = actionDetails.next;

    if (actionName === "navigate" && nextScreenDetails?.name) {
      const targetScreen = parsedFlow?.screens.find(s => s.id === nextScreenDetails.name);
      if (targetScreen) {
        if (activeScreenId) {
          setNavigationHistory(prevHistory => [...prevHistory, activeScreenId]);
        }
        setActiveScreenId(nextScreenDetails.name);
        toast({
          title: "Navigation (Preview)",
          description: `Footer navigated to screen: ${nextScreenDetails.name}`,
        });
      } else {
        toast({
          title: "Navigation Error (Preview)",
          description: `Footer action wants to navigate to screen ID "${nextScreenDetails.name}", but this screen was not found.`,
          variant: "destructive",
        });
      }
    } else if (actionName === "complete" || actionName === "data_exchange") {
      toast({
        title: "Action Triggered (Preview)",
        description: `Footer: "${component.label || component.text}", Action: "${actionName}". (This action type is simulated as flow completion/data exchange).`,
      });
       // Potentially close sheet or show a success message for "complete"
       if (actionName === "complete" && currentScreen?.terminal) {
        setIsSheetOpen(false); // Example: close sheet on terminal "complete"
      }
    } else {
      toast({
        title: "Unknown Footer Action (Preview)",
        description: `Footer "${component.label || component.text}" has an action name "${actionName}" with no clear navigation or completion target.`,
        variant: "default",
      });
    }
  };


  const handleGoBack = () => {
    if (navigationHistory.length > 0) {
      const previousScreenId = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prevHistory => prevHistory.slice(0, -1)); 
      setActiveScreenId(previousScreenId);
      toast({
        title: "Navigation (Preview)",
        description: `Went back to screen: ${previousScreenId}`,
      });
    }
  };
  
  const renderInnerComponent = (component: FlowComponent, index: number): JSX.Element | null => {
    const key = component.id || `${component.type}-${component.name || index}`;

    switch (component.type) {
      case 'TextHeading':
        return <h2 key={key} className="text-xl font-semibold mb-3 px-2 py-1">{component.text}</h2>;
      case 'TextSubheading':
        return <h3 key={key} className="text-lg font-medium mb-2 px-2 py-1">{component.text}</h3>;
      case 'TextBody':
        return <p key={key} className="text-sm mb-2 px-2 py-1 whitespace-pre-wrap">{component.text}</p>;
      case 'TextCaption':
        return <p key={key} className="text-xs text-gray-500 mb-2 px-2 py-1">{component.text}</p>;
      case 'Text': // Standard Text (fallback if others not used)
        let textClasses = "text-sm mb-2 px-2 py-1 whitespace-pre-wrap";
        if (component.style?.includes("BOLD")) textClasses += " font-bold";
        if (component.style?.includes("ITALIC")) textClasses += " italic";
        return <p key={key} className={textClasses}>{component.text}</p>;
      case 'Image':
        const imgSrc = component.src || component.image_id;
        return (
          <div key={key} className="my-3 flex justify-center px-2">
            {imgSrc && (
              <Image
                src={imgSrc.startsWith('http') || imgSrc.startsWith('data:') ? imgSrc : `https://placehold.co/300x200.png?text=${encodeURIComponent(component.label || component.type || 'Image')}`}
                alt={component.label || 'Flow Image'}
                width={300}
                height={200}
                className="rounded-md object-cover w-full max-w-[300px]"
                data-ai-hint="flow image"
              />
            )}
          </div>
        );
      case 'Button': // Standalone button
        return (
          <div className="px-2 py-2">
            <ShadButton
              key={key}
              variant="default"
              className="w-full my-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => handleLegacyButtonAction(component)}
            >
              {component.label}
            </ShadButton>
          </div>
        );
      case 'TextInput':
        return (
          <div key={key} className="mb-4 px-2 py-1">
            {component.label && <Label htmlFor={component.name} className="mb-1 block text-xs font-medium text-gray-600">{component.label}</Label>}
            <ShadInput id={component.name} name={component.name} placeholder={component.label || ""} className="border-gray-300 focus:border-primary focus:ring-primary placeholder:text-gray-500" />
          </div>
        );
      case 'TextArea':
          return (
            <div key={key} className="mb-4 px-2 py-1">
              {component.label && <Label htmlFor={component.name} className="mb-1 block text-xs font-medium text-gray-600">{component.label}</Label>}
              <ShadTextarea id={component.name} name={component.name} placeholder={component.label || ""} className="border-gray-300 focus:border-primary focus:ring-primary placeholder:text-gray-500" />
            </div>
          );
      case 'CheckboxGroup':
        return (
          <div key={key} className="mb-4 px-2 py-1">
            {component.label && <Label className="mb-2 block text-sm font-medium text-gray-700">{component.label}</Label>}
            <div className="space-y-2">
              {component["data-source"]?.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox id={`${component.name}-${item.id}`} name={component.name} value={item.id} />
                  <Label htmlFor={`${component.name}-${item.id}`} className="text-sm font-normal text-gray-800">{item.title}</Label>
                </div>
              ))}
            </div>
          </div>
        );
      case 'RadioButtonsGroup': // Corrected from RadioButtonGroup
        return (
          <RadioGroup key={key} name={component.name} className="mb-4 px-2 py-1">
            {component.label && <Label className="mb-2 block text-sm font-medium text-gray-700">{component.label}</Label>}
            <div className="space-y-2">
              {component["data-source"]?.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={item.id} id={`${component.name}-${item.id}`} />
                  <Label htmlFor={`${component.name}-${item.id}`} className="text-sm font-normal text-gray-800">{item.title}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );
      case 'Dropdown':
        return (
          <div key={key} className="mb-4 px-2 py-1">
            {component.label && <Label htmlFor={component.name} className="mb-1 block text-sm font-medium text-gray-600">{component.label}</Label>}
            <Select name={component.name}>
              <SelectTrigger id={component.name} className="border-gray-300 focus:border-primary focus:ring-primary placeholder:text-gray-500">
                <SelectValue placeholder={component.label || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {component["data-source"]?.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'DatePicker':
        return (
          <div key={key} className="mb-4 px-2 py-1">
            {component.label && <Label className="mb-1 block text-sm font-medium text-gray-700">{component.label}</Label>}
            <div className="flex items-center p-2 border rounded-md border-gray-300 text-gray-500">
              <CalendarDays size={16} className="mr-2" />
              <span>{component.label || 'Select a date'} (DatePicker)</span>
            </div>
          </div>
        );
      case 'OptIn':
        return (
          <div key={key} className="flex items-center justify-between mb-4 px-2 py-2 border rounded-md border-gray-200 bg-gray-50">
            {component.label && <Label htmlFor={`optin-${component.name}`} className="text-sm text-gray-700">{component.label}</Label>}
            <Switch id={`optin-${component.name}`} name={component.name} disabled />
          </div>
        );
      case 'EmbeddedLink':
        return (
          <div key={key} className="mb-3 px-2 py-1">
            <a
              href={component.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
            >
              {component.text || component.url || 'Link'} <ExternalLink size={12} />
            </a>
          </div>
        );
      case 'Footer': {
        const hasAction = component["on-click-action"] && component["on-click-action"].name;
        const footerClasses = cn(
          "text-center mt-auto mb-2 mx-2 rounded-md py-3 px-4", 
          hasAction
            ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer font-semibold text-sm" 
            : "text-xs text-muted-foreground" 
        );
        return (
          <div
            key={key}
            className={footerClasses}
            onClick={hasAction ? () => handleFooterAction(component) : undefined}
            role={hasAction ? "button" : undefined}
            tabIndex={hasAction ? 0 : undefined}
            onKeyDown={hasAction ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFooterAction(component); } } : undefined}
          >
            {component.label || component.text}
          </div>
        );
      }
      case 'ScreenConfirmation':
          return (
              <div key={key} className="p-3 my-3 border border-dashed rounded bg-green-50 text-green-700 text-xs mx-2 flex items-center gap-2">
                  <ShieldQuestion size={16} />
                  <span>{component.label || 'Screen Confirmation Area'}</span>
              </div>
          );
      case 'Form': // Form component, render its children
        return (
          <div key={key} className="space-y-3">
            {component.children?.map((child, childIndex) => renderInnerComponent(child, childIndex))}
          </div>
        );
      default:
        return (
          <div key={key} className="p-2 my-2 border border-dashed rounded bg-amber-50 text-amber-700 text-xs mx-2">
            <p>Unsupported component: <strong>{component.type}</strong></p>
            <pre className="mt-1 text-xs overflow-auto max-h-20 bg-amber-100 p-1 rounded">
              {JSON.stringify(component, null, 2)}
            </pre>
          </div>
        );
    }
  };
  
  const renderFlowComponent = (component: FlowComponent, index: number): JSX.Element | null => {
     // If the top-level component is a Form, we directly render its children.
    // Otherwise, we render the component itself using renderInnerComponent.
    // This avoids double-wrapping if the screen's direct child is a Form.
    if (component.type === 'Form' && component.children) {
      return (
        <div key={`form-wrapper-${index}`} className="space-y-3">
           {component.children.map((child, childIndex) => renderInnerComponent(child, childIndex))}
        </div>
      );
    }
    return renderInnerComponent(component, index);
  };


  const InteractiveMessageCard = () => (
    <Card className="bg-white shadow-lg rounded-lg mx-auto max-w-sm my-2 overflow-hidden">
      <CardHeader className="p-3 bg-green-50">
        <CardTitle className="text-sm font-semibold text-green-800">Interactive Message</CardTitle>
        <CardDescription className="text-xs text-green-700">
          {currentScreen?.title ? `Ready to open: ${currentScreen.title}` : currentScreen?.id ? `Ready to open: ${currentScreen.id}` : 'Flow ready'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3">
        <p className="text-sm text-gray-700 mb-2">
          Click the button below to open the interactive form.
        </p>
      </CardContent>
      <CardFooter className="p-3 border-t">
        <SheetTrigger asChild>
          <ShadButton
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => setIsSheetOpen(true)}
            disabled={!currentScreen || !!errorMessage}
          >
            Open Interactive Form
          </ShadButton>
        </SheetTrigger>
      </CardFooter>
    </Card>
  );

  return (
    <div className="flex items-center justify-center h-full bg-muted/30 p-4 select-none">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <div
          ref={phoneRef}
          className="w-[360px] h-[740px] bg-[#E5DDD5] rounded-[30px] border-[10px] border-black shadow-2xl overflow-hidden flex flex-col relative"
        >
          {/* Phone Notch and Status Bar */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150px] h-[25px] bg-black rounded-b-xl z-20 flex items-center justify-center px-2">
              <div className="w-2 h-2 bg-neutral-700 rounded-full mr-2"></div>
              <div className="w-10 h-1 bg-neutral-700 rounded-full"></div>
          </div>
          <div className="bg-black px-4 pt-7 pb-1 flex justify-between items-center text-white text-xs font-medium">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <Wifi size={14} />
              <BatteryFull size={14} />
            </div>
          </div>

          {/* WhatsApp Header */}
          <div className="bg-[#075E54] text-white p-3 flex items-center gap-3 shadow-sm sticky top-0 z-10 flex-shrink-0">
             <ArrowLeft size={20} className="cursor-pointer opacity-80 hover:opacity-100" onClick={() => { setIsSheetOpen(false); setNavigationHistory([]); }} />
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <MessageCircle size={18} className="text-[#075E54]" />
            </div>
            <div className="flex-grow">
              <h3 className="font-semibold text-sm">Flow Business</h3>
              <p className="text-xs opacity-80">Online</p>
            </div>
          </div>

          {/* Chat Area */}
          <ScrollArea
            className="flex-1 p-3 bg-repeat min-h-0" 
            style={{ backgroundImage: "url('https://placehold.co/10x10.png/E5DDD5/E5DDD5?text=_')" }}
            data-ai-hint="chat background pattern"
          >
            <div className="text-center my-2">
              <span className="bg-[#E1F7CB] text-xs text-gray-700 px-2 py-1 rounded-md shadow-sm">
                Today
              </span>
            </div>
            <div className="text-center my-2">
              <span className="bg-[#FCFDEA] text-xs text-yellow-700 px-2 py-1 rounded-md shadow-sm border border-yellow-300/50">
                This is an end-to-end encrypted Flow.
              </span>
            </div>

            {errorMessage && (
              <Card className="bg-red-50 border-red-300 shadow-md rounded-lg mx-auto max-w-sm my-2">
                <CardContent className="p-3 text-center text-red-700">
                  <p className="font-medium">Preview Error</p>
                  <p className="text-sm">{errorMessage}</p>
                </CardContent>
              </Card>
            )}

            {!errorMessage && !currentScreen && flowJson && (
              <Card className="bg-yellow-50 border-yellow-300 shadow-md rounded-lg mx-auto max-w-sm my-2">
                <CardContent className="p-3 text-center text-yellow-700">
                  <p>Flow data loaded, but no screens to display or an issue with screen data.</p>
                </CardContent>
              </Card>
            )}

            {!errorMessage && !currentScreen && !flowJson && (
              <div className="p-8 text-center text-gray-400 h-full flex flex-col justify-center items-center">
                  <Smartphone size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No flow data loaded.</p>
                  <p className="text-xs">Generate or import a flow.</p>
              </div>
            )}

            {!errorMessage && currentScreen && (
              <InteractiveMessageCard />
            )}
          </ScrollArea>

          {/* WhatsApp Input Bar */}
          <div className="bg-[#F0F0F0] p-2 border-t border-gray-300 flex items-center gap-2 sticky bottom-0 flex-shrink-0">
            <div className="flex-grow bg-white rounded-full h-10 flex items-center px-4 shadow-sm">
              <p className="text-sm text-gray-400">Type a message...</p>
            </div>
            <div className="bg-primary p-2 rounded-full shadow-sm cursor-pointer text-white">
               <Send size={20} />
            </div>
          </div>

          <SheetPortal container={phoneRef.current}>
            <SheetContent
              side="bottom"
              className="h-[520px] rounded-t-[20px] p-0 flex flex-col overflow-hidden shadow-2xl bg-background"
              onOpenAutoFocus={(e) => e.preventDefault()} 
            >
              <SheetHeader className="p-4 border-b flex-shrink-0 flex flex-row items-center justify-between relative bg-background">
                <div className="flex items-center gap-2">
                  {navigationHistory.length > 0 && (
                    <ShadButton variant="ghost" size="icon" onClick={handleGoBack} className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900">
                       <ArrowLeft size={18} />
                    </ShadButton>
                  )}
                  <div className={navigationHistory.length === 0 ? "pl-8 sm:pl-0" : ""}> 
                    <SheetTitle className="text-base font-semibold text-left">{currentScreen?.title || currentScreen?.id || 'Interactive Form'}</SheetTitle>
                    <SheetDescription className="text-xs text-left">
                      {parsedFlow?.data_api_version ? `Flow Data API Version: ${parsedFlow.data_api_version}` : parsedFlow?.version ? `Flow Version: ${parsedFlow.version}` : 'Your interactive content appears here.'}
                    </SheetDescription>
                  </div>
                </div>
                <SheetClose className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary" />
              </SheetHeader>
              <ScrollArea className="flex-1 min-h-0 h-0">
                <div className="p-4 space-y-3">
                    {currentScreen?.layout?.children?.map((component, index) =>
                        renderFlowComponent(component, index)
                    )}
                    {currentScreen && (!currentScreen.layout?.children || currentScreen.layout.children.length === 0) && (
                        <div className="p-4 text-center text-gray-500">
                        <p>This screen has no components.</p>
                        </div>
                    )}
                </div>
              </ScrollArea>
            </SheetContent>
          </SheetPortal>
        </div>
      </Sheet>
    </div>
  );
};

