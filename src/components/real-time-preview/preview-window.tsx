
"use client";

import type { FC } from 'react';
import { Smartphone, Wifi, BatteryFull, MessageCircle, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { Button as ShadButton } from '@/components/ui/button';
import { Input as ShadInput } from '@/components/ui/input';
import { Textarea as ShadTextarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface PreviewWindowProps {
  flowJson: string;
}

interface FlowComponent {
  type: string;
  id?: string; 
  name?: string; 
  text?: string; 
  label?: string; 
  style?: string[]; 
  image_id?: string; 
  data_source?: { id: string; title: string }[]; 
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

const renderFlowComponent = (component: FlowComponent, index: number): JSX.Element | null => {
  const key = component.id || `${component.type}-${index}`;

  switch (component.type) {
    case 'Headline':
      return <h2 key={key} className="text-xl font-semibold mb-2 px-2 py-1">{component.text}</h2>;
    case 'Text':
      let textClasses = "text-sm mb-2 px-2 py-1";
      if (component.style?.includes("BOLD")) textClasses += " font-bold";
      if (component.style?.includes("ITALIC")) textClasses += " italic";
      return <p key={key} className={textClasses}>{component.text}</p>;
    case 'Image':
      return (
        <div key={key} className="my-2 flex justify-center px-2">
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
        <div className="px-2 py-1">
          <ShadButton key={key} variant="default" className="w-full my-1 bg-primary hover:bg-primary/90 text-primary-foreground">
            {component.label}
          </ShadButton>
        </div>
      );
    case 'TextInput':
      return (
        <div key={key} className="mb-3 px-2 py-1">
          {component.label && <Label htmlFor={component.name} className="mb-1 block text-xs font-medium text-gray-700">{component.label}</Label>}
          <ShadInput id={component.name} name={component.name} placeholder={component.label} className="border-gray-300 focus:border-primary focus:ring-primary" />
        </div>
      );
    case 'TextArea':
        return (
          <div key={key} className="mb-3 px-2 py-1">
            {component.label && <Label htmlFor={component.name} className="mb-1 block text-xs font-medium text-gray-700">{component.label}</Label>}
            <ShadTextarea id={component.name} name={component.name} placeholder={component.label} className="border-gray-300 focus:border-primary focus:ring-primary" />
          </div>
        );
    case 'CheckboxGroup':
      return (
        <div key={key} className="mb-3 px-2 py-1">
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
        <RadioGroup key={key} name={component.name} className="mb-3 px-2 py-1">
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
        <div key={key} className="mb-3 px-2 py-1">
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
    case 'Footer':
        return <p key={key} className="text-xs text-muted-foreground text-center mt-4 mb-2 px-2 py-1">{component.text}</p>;
    default:
      return (
        <div key={key} className="p-2 my-1 border border-dashed rounded bg-amber-50 text-amber-700 text-xs mx-2">
          <p>Unsupported component: <strong>{component.type}</strong></p>
          <pre className="mt-1 text-xs overflow-auto max-h-20 bg-amber-100 p-1 rounded">
            {JSON.stringify(component, null, 2)}
          </pre>
        </div>
      );
  }
};

export const PreviewWindow: FC<PreviewWindowProps> = ({ flowJson }) => {
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

  return (
    <div className="flex items-center justify-center h-full bg-muted/30 p-4 select-none">
      <div className="w-[360px] h-[740px] bg-[#E5DDD5] rounded-[30px] border-[10px] border-black shadow-2xl overflow-hidden flex flex-col relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150px] h-[25px] bg-black rounded-b-xl z-20 flex items-center justify-center px-2">
            <div className="w-2 h-2 bg-neutral-700 rounded-full mr-2"></div>
            <div className="w-10 h-1 bg-neutral-700 rounded-full"></div>
        </div>
        <div className="bg-black px-4 pt-7 pb-1 flex justify-between items-center text-white">
          <span className="text-xs font-medium">9:41</span>
          <div className="flex items-center gap-1">
            <Wifi size={14} />
            <BatteryFull size={14} />
          </div>
        </div>

        <div className="bg-[#075E54] text-white p-3 flex items-center gap-3 shadow-sm sticky top-0 z-10">
          <ArrowLeft size={20} className="cursor-pointer opacity-80 hover:opacity-100" />
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <MessageCircle size={18} className="text-[#075E54]" />
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold text-sm">Flow Business</h3>
            <p className="text-xs opacity-80">Online</p>
          </div>
        </div>

        <div
          className="flex-grow p-3 overflow-y-auto space-y-2 bg-repeat"
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

          <Card className="bg-white shadow-lg rounded-lg mx-auto max-w-sm my-2 overflow-hidden">
            <CardContent className="p-0">
              {errorMessage && (
                <div className="p-4 text-center text-red-700 bg-red-100">
                  <p className="font-medium">Preview Error</p>
                  <p className="text-sm">{errorMessage}</p>
                </div>
              )}
              {!errorMessage && !currentScreen && flowJson && (
                 <div className="p-4 text-center text-gray-500">
                    <p>Flow data loaded, but no screens to display or an issue with screen data.</p>
                 </div>
              )}
              {!errorMessage && !currentScreen && !flowJson && (
                 <div className="p-8 text-center text-gray-400">
                    <Smartphone size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No flow data loaded.</p>
                    <p className="text-xs">Generate or import a flow to see the preview here.</p>
                 </div>
              )}
              {currentScreen?.layout?.children?.map((component, index) =>
                renderFlowComponent(component, index)
              )}
              {currentScreen && (!currentScreen.layout?.children || currentScreen.layout.children.length === 0) && (
                <div className="p-4 text-center text-gray-500">
                  <p>This screen has no components.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="bg-[#F0F0F0] p-2 border-t border-gray-300 flex items-center gap-2 sticky bottom-0">
          <div className="flex-grow bg-white rounded-full h-10 flex items-center px-4 shadow-sm">
            <p className="text-sm text-gray-400">Type a message...</p>
          </div>
          <div className="bg-primary p-2 rounded-full shadow-sm cursor-pointer">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M11.9999 14.942C13.6111 14.942 14.9389 13.6142 14.9389 12.003V5.00299C14.9389 3.39182 13.6111 2.06397 11.9999 2.06397C10.3887 2.06397 9.06091 3.39182 9.06091 5.00299V12.003C9.06091 13.6142 10.3887 14.942 11.9999 14.942ZM17.903 12.003C17.903 14.9315 15.5794 17.235 12.6539 17.8462V20.003H11.3459V17.8462C8.42043 17.235 6.0968 14.9315 6.0968 12.003H7.71063C7.71063 14.3698 9.63107 16.2902 11.9999 16.2902C14.3687 16.2902 16.2891 14.3698 16.2891 12.003H17.903Z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

    