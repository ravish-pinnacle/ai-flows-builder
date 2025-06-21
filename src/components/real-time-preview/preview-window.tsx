
"use client";

import type { FC } from 'react';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Smartphone, Wifi, BatteryFull, MessageCircle, ArrowLeft, CalendarDays, Link as LinkIcon, ShieldQuestion, Send, ExternalLink, FileUp, Camera, MoreVertical, X } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
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
  id?: string;
  name?: string;
  text?: string;
  label?: string;
  description?: string;
  style?: string[];
  src?: string;
  'data-source'?: { id: string; title: string }[];
  url?: string;
  'on-click-action'?: {
    name: string;
    next?: { type: string; name: string };
    payload?: Record<string, any>;
  };
  children?: FlowComponent[];
  'photo-source'?: 'camera_gallery' | 'camera' | 'gallery';
  'max-file-size-kb'?: number;
  'min-uploaded-photos'?: number;
  'max-uploaded-photos'?: number;
  'min-uploaded-documents'?: number;
  'max-uploaded-documents'?: number;
  'allowed-mime-types'?: string[];
}

interface FlowScreen {
  id: string;
  title?: string;
  layout: {
    type: string;
    children: FlowComponent[];
  };
  terminal?: boolean;
}

interface ParsedFlow {
  version: string;
  data_api_version?: string;
  routing_model?: Record<string, string[]>;
  screens: FlowScreen[];
}

interface PreviewWindowProps {
  flowJson: string;
}

const formatFileSize = (kb?: number) => {
    if (kb === undefined) return null;
    if (kb < 1024) return `${kb} KB`;
    const mb = kb / 1024;
    return `Max file size ${parseFloat(mb.toFixed(1))} MB.`;
};

export const PreviewWindow: FC<PreviewWindowProps> = ({ flowJson }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const phoneRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  const chatBackgroundStyle = useMemo(
    () => ({
      backgroundImage:
        resolvedTheme === 'dark'
          ? "url('https://placehold.co/10x10.png/111B21/111B21?text=_')"
          : "url('https://placehold.co/10x10.png/E5DDD5/E5DDD5?text=_')",
    }),
    [resolvedTheme]
  );
  
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

  const { screenComponents, footerComponent } = useMemo(() => {
      const children = currentScreen?.layout?.children || [];
      const footer = children.find(c => c.type === 'Footer' && c['on-click-action']) ?? null;
      const components = children.filter(c => c !== footer);
      return { screenComponents: components, footerComponent: footer };
  }, [currentScreen]);

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
       if (actionName === "complete" && currentScreen?.terminal) {
        setIsSheetOpen(false);
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
      case 'Headline':
        return <h2 key={key} className="text-xl font-bold mb-3 px-2 py-1">{component.text}</h2>;
      case 'TextHeading':
        return <h2 key={key} className="text-xl font-semibold mb-3 px-2 py-1">{component.text}</h2>;
      case 'TextSubheading':
        return <h3 key={key} className="text-lg font-medium mb-2 px-2 py-1">{component.text}</h3>;
      case 'TextBody':
        return <p key={key} className="text-sm mb-2 px-2 py-1 whitespace-pre-wrap">{component.text}</p>;
      case 'TextCaption':
        return <p key={key} className="text-xs text-gray-500 mb-2 px-2 py-1">{component.text}</p>;
      case 'Text': 
        let textClasses = "text-sm mb-2 px-2 py-1 whitespace-pre-wrap";
        if (component.style?.includes("BOLD")) textClasses += " font-bold";
        if (component.style?.includes("ITALIC")) textClasses += " italic";
        return <p key={key} className={textClasses}>{component.text}</p>;
      case 'Image':
        const imgSrc = component.src;
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
      case 'RadioButtonGroup':
      case 'RadioButtonsGroup': // Handle both variations
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
      case 'PhotoPicker': {
        const maxFileSize = formatFileSize(component['max-file-size-kb']);
        return (
            <div key={key} className="my-4 space-y-1 px-1">
                <p className="font-semibold text-base">{component.label}</p>
                {component.description && <p className="text-sm text-muted-foreground">{component.description}</p>}
                {maxFileSize && <p className="text-sm text-muted-foreground">{maxFileSize}</p>}
                <div className="pt-4">
                    <ShadButton variant="outline" className="w-full rounded-full border-gray-300 text-green-700 dark:text-green-500 font-semibold text-base py-2.5 h-auto hover:bg-gray-50 dark:hover:bg-gray-800">
                        <Camera className="mr-2 h-5 w-5" />
                        Take photo
                    </ShadButton>
                </div>
            </div>
        );
      }
      case 'DocumentPicker': {
          const maxFileSize = formatFileSize(component['max-file-size-kb']);
          return (
              <div key={key} className="my-4 space-y-1 px-1">
                  <p className="font-semibold text-base">{component.label}</p>
                  {component.description && <p className="text-sm text-muted-foreground">{component.description}</p>}
                  {maxFileSize && <p className="text-sm text-muted-foreground">{maxFileSize}</p>}
                  <div className="pt-4">
                      <ShadButton variant="outline" className="w-full rounded-full border-gray-300 text-green-700 dark:text-green-500 font-semibold text-base py-2.5 h-auto hover:bg-gray-50 dark:hover:bg-gray-800">
                          <FileUp className="mr-2 h-5 w-5" />
                          Upload document
                      </ShadButton>
                  </div>
              </div>
          );
      }
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
        if (hasAction) return null; // Handled separately at the bottom of the sheet
        return (
          <div key={key} className="text-xs text-muted-foreground text-center mt-4">
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
      case 'Form':
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
    <Card className="bg-card text-card-foreground shadow-lg rounded-lg mx-auto max-w-sm my-2 overflow-hidden">
      <CardHeader className="p-3 bg-green-50 dark:bg-green-950">
        <CardTitle className="text-sm font-semibold text-green-800 dark:text-green-100">Interactive Message</CardTitle>
        <CardDescription className="text-xs text-green-700 dark:text-green-200">
          {currentScreen?.title ? `Ready to open: ${currentScreen.title}` : currentScreen?.id ? `Ready to open: ${currentScreen.id}` : 'Flow ready'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3">
        <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">
          Click the button below to open the interactive form.
        </p>
      </CardContent>
      <CardFooter className="p-3 border-t dark:border-gray-700">
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
          className="w-[360px] h-[740px] bg-[#E5DDD5] dark:bg-[#111B21] rounded-[30px] border-[10px] border-black shadow-2xl overflow-hidden flex flex-col relative"
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
          <div className="bg-[#075E54] dark:bg-[#202C33] text-white p-3 flex items-center gap-3 shadow-sm sticky top-0 z-10 flex-shrink-0">
             <ArrowLeft size={20} className="cursor-pointer opacity-80 hover:opacity-100 text-white" onClick={() => { setIsSheetOpen(false); setNavigationHistory([]); }} />
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <MessageCircle size={18} className="text-[#075E54] dark:text-[#202C33]" />
            </div>
            <div className="flex-grow">
              <h3 className="font-semibold text-sm">Flow Business</h3>
              <p className="text-xs opacity-80">Online</p>
            </div>
          </div>

          {/* Chat Area */}
          <ScrollArea
            className="flex-1 p-3 bg-repeat min-h-0 dark:bg-[#111B21]"
            style={chatBackgroundStyle}
            data-ai-hint="chat background pattern"
          >
            <div className="text-center my-2">
              <span className="bg-[#E1F7CB] text-xs text-gray-700 dark:bg-[#25343D] dark:text-gray-200 px-2 py-1 rounded-md shadow-sm">
                Today
              </span>
            </div>
            <div className="text-center my-2">
              <span className="bg-[#FCFDEA] text-xs text-yellow-700 dark:bg-[#3b3b1f] dark:text-yellow-200 px-2 py-1 rounded-md shadow-sm border border-yellow-300/50 dark:border-yellow-700/50">
                This is an end-to-end encrypted Flow.
              </span>
            </div>

            {errorMessage && (
              <Card className="bg-red-50 dark:bg-red-900 border-red-300 dark:border-red-700 shadow-md rounded-lg mx-auto max-w-sm my-2">
                <CardContent className="p-3 text-center text-red-700 dark:text-red-200">
                  <p className="font-medium">Preview Error</p>
                  <p className="text-sm">{errorMessage}</p>
                </CardContent>
              </Card>
            )}

            {!errorMessage && !currentScreen && flowJson && (
              <Card className="bg-yellow-50 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700 shadow-md rounded-lg mx-auto max-w-sm my-2">
                <CardContent className="p-3 text-center text-yellow-700 dark:text-yellow-200">
                  <p>Flow data loaded, but no screens to display or an issue with screen data.</p>
                </CardContent>
              </Card>
            )}

            {!errorMessage && !currentScreen && !flowJson && (
              <div className="p-8 text-center text-gray-400 dark:text-gray-500 h-full flex flex-col justify-center items-center">
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
          <div className="bg-[#F0F0F0] dark:bg-[#202C33] p-2 border-t border-gray-300 dark:border-gray-700 flex items-center gap-2 sticky bottom-0 flex-shrink-0">
            <div className="flex-grow bg-white dark:bg-[#2A3942] rounded-full h-10 flex items-center px-4 shadow-sm">
              <p className="text-sm text-gray-400 dark:text-gray-500">Type a message...</p>
            </div>
            <div className="bg-primary p-2 rounded-full shadow-sm cursor-pointer text-white">
               <Send size={20} />
            </div>
          </div>

          <SheetPortal container={phoneRef.current}>
            <SheetContent
              side="bottom"
              className="h-[520px] rounded-t-[20px] p-0 flex flex-col overflow-hidden shadow-2xl bg-background border-t border-gray-200 dark:border-gray-700"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="p-3 border-b dark:border-gray-700 flex-shrink-0 flex items-center justify-between">
                  <ShadButton variant="ghost" size="icon" onClick={() => setIsSheetOpen(false)} className="h-9 w-9">
                      <X size={20} />
                  </ShadButton>
                  <p className="text-base font-semibold">{currentScreen?.title || 'Interactive Form'}</p>
                  <ShadButton variant="ghost" size="icon" className="h-9 w-9">
                      <MoreVertical size={20} />
                  </ShadButton>
              </div>
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-4">
                    {screenComponents.map((component, index) =>
                        renderFlowComponent(component, index)
                    )}
                    {currentScreen && screenComponents.length === 0 && (!footerComponent) && (
                        <div className="p-4 text-center text-gray-500">
                          <p>This screen has no components.</p>
                        </div>
                    )}
                </div>
              </ScrollArea>
               {footerComponent && (
                <div className="p-4 border-t bg-background flex-shrink-0 space-y-2">
                  <ShadButton
                    className="w-full rounded-full bg-gray-200 text-black hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 font-semibold h-11"
                    onClick={() => handleFooterAction(footerComponent)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFooterAction(footerComponent); } }}
                  >
                    {footerComponent.label}
                  </ShadButton>
                  <p className="text-center text-xs text-muted-foreground">
                      Managed by the business. <a href="#" onClick={(e) => e.preventDefault()} className="text-green-600 no-underline">Learn more</a>
                  </p>
                </div>
              )}
            </SheetContent>
          </SheetPortal>
        </div>
      </Sheet>
    </div>
  );
};
