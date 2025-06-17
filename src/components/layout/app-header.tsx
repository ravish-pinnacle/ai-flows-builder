import { MessageSquareCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';

export function AppHeader() {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
      <div className="flex items-center gap-2">
        <MessageSquareCode className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-semibold font-headline">AI Flows Builder</h1>
      </div>
      <div className="flex items-center gap-2">
        <ModeToggle />
        {/* Placeholder for global actions like Save */}
        {/* <Button size="sm">Save Flow</Button> */}
      </div>
    </header>
  );
}
