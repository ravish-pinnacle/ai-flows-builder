"use client";

import type { FC } from 'react';
import { Smartphone, Wifi, BatteryFull } from 'lucide-react';

interface PreviewWindowProps {
  flowJson: string;
}

export const PreviewWindow: FC<PreviewWindowProps> = ({ flowJson }) => {
  // This component would simulate a WhatsApp interface and render the flowJson.
  // For now, it's a styled placeholder.
  
  return (
    <div className="flex items-center justify-center h-full bg-muted/30 p-4">
      <div className="w-[360px] h-[740px] bg-background rounded-[30px] border-[10px] border-foreground shadow-2xl overflow-hidden flex flex-col">
        {/* Phone top bar */}
        <div className="bg-card px-4 py-2 flex justify-between items-center">
          <span className="text-sm font-medium">9:41</span>
          <div className="flex items-center gap-1">
            <Wifi size={16} />
            <BatteryFull size={16} />
          </div>
        </div>
        
        {/* WhatsApp header */}
        <div className="bg-primary text-primary-foreground p-3 flex items-center gap-3">
          <Smartphone size={24} />
          <div className="flex-grow">
            <h3 className="font-semibold">Flow Preview</h3>
            <p className="text-xs opacity-80">Simulated WhatsApp Interface</p>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-grow p-3 overflow-y-auto space-y-3">
          {/* Placeholder content */}
          <div className="p-3 bg-secondary rounded-lg self-start max-w-[80%]">
            <p className="text-sm text-secondary-foreground">This is where your flow preview will appear.</p>
          </div>
          {flowJson ? (
            <div className="p-3 bg-accent rounded-lg self-end max-w-[80%] ml-auto">
              <p className="text-sm text-accent-foreground">Flow data loaded. Rendering logic to be implemented.</p>
              <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-40 mt-2">{flowJson}</pre>
            </div>
          ) : (
             <div className="p-3 bg-muted rounded-lg self-start max-w-[80%]">
                <p className="text-sm text-muted-foreground italic">No flow data to preview.</p>
             </div>
          )}
        </div>

        {/* Message input bar (static) */}
        <div className="bg-card p-2 border-t">
          <div className="bg-input rounded-full h-10 flex items-center px-3">
            <p className="text-sm text-muted-foreground">Type a message...</p>
          </div>
        </div>
      </div>
    </div>
  );
};
