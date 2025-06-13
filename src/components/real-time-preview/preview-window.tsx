
"use client";

import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Smartphone, Wifi, BatteryFull, MessageCircle, ArrowLeft, CalendarDays, Link as LinkIcon, ShieldQuestion, Send } from 'lucide-react';
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
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

interface FlowComponent {
  type: string;
  id?: string;
  name?: string;
  text?: string;
  label?: string;
  style?: string[];
  image_id?: string;
  data_source?: { id: string; title: string }[];
  url?: string; // For EmbeddedLink
  action_id?: string; // For Button
  // ... other component-specific props
}

interface FlowScreen {
  id: string;
  layout: {
    type: string;
    children: FlowComponent[];
  };
  // ... other screen props
}

interface ParsedFlow {
  version: string;
  screens: FlowScreen[];
  // ... other flow props
}

interface PreviewWindowProps {
  flowJson: string;
}

const renderFlowComponent = (component: FlowComponent, index: number, showToast: (options: { title: string, description: string, variant?: 'default' | 'destructive' }) => void): JSX.Element | null => {
  const key = component.id || `${component.type}-${index}`;

  switch (component.type) {
    case 'Headline':
      return <h2 key={key} className="text-xl font-semibold mb-3 px-2 py-1">{component.text}</h2>;
    case 'Text':
      let textClasses = "text-sm mb-2 px-2 py-1 whitespace-pre-wrap";
      if (component.style?.includes("BOLD")) textClasses += " font-bold";
      if (component.style?.includes("ITALIC")) textClasses += " italic";
      return <p key={key} className={textClasses}>{component.text}</p>;
    case 'Image':
      return (
        <div key={key} className="my-3 flex justify-center px-2">
          {component.image_id && (
            <Image
              src={component.image_id.startsWith('http') ? component.image_id : `https://placehold.co/300x200.png?text=${encodeURIComponent(component.label || component.type || 'Image')}`}
              alt={component.label || 'Flow Image'}
              width={300}
              height={200}
              className="rounded-md object-cover w-full max-w-[300px]"
              data-ai-hint="flow image"
            />
          )}
        </div>
      );
    case 'Button':
      return (
        <div className="px-2 py-2">
          <ShadButton
            key={key}
            variant="default"
            className="w-full my-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => {
              console.log(`Preview Button clicked: ${component.label}, Action ID: ${component.action_id || 'none'}`);
              showToast({
                title: "Button Clicked (Preview)",
                description: `Label: ${component.label}, Action: ${component.action_id || 'No action_id defined.'}`,
              });
            }}
          >
            {component.label}
          </ShadButton>
        </div>
      );
    case 'TextInput':
      return (
        <div key={key} className="mb-4 px-2 py-1">
          {component.label && <Label htmlFor={component.name} className="mb-1 block text-xs font-medium text-gray-700">{component.label}</Label>}
          <ShadInput id={component.name} name={component.name} placeholder={component.label} className="border-gray-300 focus:border-primary focus:ring-primary" />
        </div>
      );
    case 'TextArea':
        return (
          <div key={key} className="mb-4 px-2 py-1">
            {component.label && <Label htmlFor={component.name} className="mb-1 block text-xs font-medium text-gray-700">{component.label}</Label>}
            <ShadTextarea id={component.name} name={component.name} placeholder={component.label} className="border-gray-300 focus:border-primary focus:ring-primary" />
          </div>
        );
    case 'CheckboxGroup':
      return (
        <div key={key} className="mb-4 px-2 py-1">
          {component.label && <Label className="mb-2 block text-sm font-medium text-gray-700">{component.label}</Label>}
          <div className="space-y-2">
            {component.data_source?.map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox id={`${component.name}-${item.id}`} name={component.name} value={item.id} />
                <Label htmlFor={`${component.name}-${item.id}`} className="text-sm font-normal text-gray-800">{item.title}</Label>
              </div>
            ))}
          </div>
        </div>
      );
    case 'RadioButtonGroup':
      return (
        <RadioGroup key={key} name={component.name} className="mb-4 px-2 py-1">
          {component.label && <Label className="mb-2 block text-sm font-medium text-gray-700">{component.label}</Label>}
          <div className="space-y-2">
            {component.data_source?.map((item) => (
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
          {component.label && <Label htmlFor={component.name} className="mb-1 block text-sm font-medium text-gray-700">{component.label}</Label>}
          <Select name={component.name}>
            <SelectTrigger id={component.name} className="border-gray-300 focus:border-primary focus:ring-primary">
              <SelectValue placeholder={component.label || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {component.data_source?.map((item) => (
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
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            {component.text || component.url || 'Link'}
          </a>
        </div>
      );
    case 'Footer':
        return <p key={key} className="text-xs text-muted-foreground text-center mt-4 mb-2 px-2 py-1">{component.text}</p>;
    case 'ScreenConfirmation':
        return (
            <div key={key} className="p-3 my-3 border border-dashed rounded bg-green-50 text-green-700 text-xs mx-2 flex items-center gap-2">
                <ShieldQuestion size={16} />
                <span>{component.label || 'Screen Confirmation Area'}</span>
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

export const PreviewWindow: FC<PreviewWindowProps> = ({ flowJson }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const phoneRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  let parsedFlow: ParsedFlow | null = null;
  let currentScreen: FlowScreen | null = null;
  let errorMessage: string | null = null;

  if (flowJson) {
    try {
      parsedFlow = JSON.parse(flowJson);
      if (parsedFlow && parsedFlow.screens && parsedFlow.screens.length > 0) {
        currentScreen = parsedFlow.screens[0]; // Render first screen
      } else if (parsedFlow && (!parsedFlow.screens || parsedFlow.screens.length === 0)) {
        errorMessage = "Flow has no screens defined.";
      }
    } catch (error) {
      console.error("Error parsing flow JSON for preview:", error);
      errorMessage = "Invalid Flow JSON. Cannot render preview.";
    }
  }

  const InteractiveMessageCard = () => (
    <Card className="bg-white shadow-lg rounded-lg mx-auto max-w-sm my-2 overflow-hidden">
      <CardHeader className="p-3 bg-green-50">
        <CardTitle className="text-sm font-semibold text-green-800">Interactive Message</CardTitle>
        <CardDescription className="text-xs text-green-700">
          {currentScreen?.id ? `Ready to open: ${currentScreen.id}` : 'Flow ready'}
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
            disabled={!currentScreen} // Disable if no screen to show
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
          <div className="bg-[#075E54] text-white p-3 flex items-center gap-3 shadow-sm sticky top-0 z-10">
            <ArrowLeft size={20} className="cursor-pointer opacity-80 hover:opacity-100" onClick={() => setIsSheetOpen(false)} />
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
            className="flex-grow p-3 bg-repeat"
            style={{ backgroundImage: "url('https://placehold.co/10x10.png/E5DDD5/E5DDD5?text=_')" }}
            data-ai-hint="chat background pattern"
          >
            {/* Date Chip */}
            <div className="text-center my-2">
              <span className="bg-[#E1F7CB] text-xs text-gray-700 px-2 py-1 rounded-md shadow-sm">
                Today
              </span>
            </div>
            {/* Encryption Notice */}
            <div className="text-center my-2">
              <span className="bg-[#FCFDEA] text-xs text-yellow-700 px-2 py-1 rounded-md shadow-sm border border-yellow-300/50">
                This is an end-to-end encrypted Flow.
              </span>
            </div>

            {/* Content based on flowJson and error state */}
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

            {/* Interactive Message Card with Trigger */}
            {!errorMessage && currentScreen && (
              <InteractiveMessageCard />
            )}
          </ScrollArea>

          {/* WhatsApp Input Bar */}
          <div className="bg-[#F0F0F0] p-2 border-t border-gray-300 flex items-center gap-2 sticky bottom-0">
            <div className="flex-grow bg-white rounded-full h-10 flex items-center px-4 shadow-sm">
              <p className="text-sm text-gray-400">Type a message...</p>
            </div>
            <div className="bg-primary p-2 rounded-full shadow-sm cursor-pointer text-white">
               <Send size={20} />
            </div>
          </div>

          {/* Action Sheet Content */}
          <SheetContent
            side="bottom"
            className="h-auto max-h-[520px] rounded-t-[20px] p-0 flex flex-col shadow-2xl border-t-4 border-black bg-background"
            onOpenAutoFocus={(e) => e.preventDefault()} // Prevent focus stealing
            container={phoneRef.current}
          >
            <SheetHeader className="p-4 border-b bg-muted rounded-t-[18px]">
              <SheetTitle className="text-base font-semibold">{currentScreen?.id || 'Interactive Form'}</SheetTitle>
              <SheetDescription className="text-xs">
                {parsedFlow?.version ? `Flow Version: ${parsedFlow.version}` : 'Your interactive content appears here.'}
              </SheetDescription>
              <SheetClose className="absolute right-3 top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary" />
            </SheetHeader>
            <ScrollArea className="flex-grow bg-background min-h-0">
              <div className="p-4 space-y-3">
                {currentScreen?.layout?.children?.map((component, index) =>
                  renderFlowComponent(component, index, toast)
                )}
                {currentScreen && (!currentScreen.layout?.children || currentScreen.layout.children.length === 0) && (
                  <div className="p-4 text-center text-gray-500">
                    <p>This screen has no components.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </div>
      </Sheet>
    </div>
  );
};

