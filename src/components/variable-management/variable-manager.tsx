"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Variable, Trash2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FlowVariable {
  id: string;
  name: string;
  initialValue: string;
}

export function VariableManager() {
  const [variables, setVariables] = useState<FlowVariable[]>([]);
  const [variableName, setVariableName] = useState("");
  const [initialValue, setInitialValue] = useState("");
  const { toast } = useToast();

  const handleAddVariable = (e: FormEvent) => {
    e.preventDefault();
    if (!variableName.trim()) {
      toast({ title: "Error", description: "Variable name cannot be empty.", variant: "destructive" });
      return;
    }
    if (variables.find(v => v.name === variableName)) {
      toast({ title: "Error", description: "Variable name must be unique.", variant: "destructive" });
      return;
    }
    const newVariable: FlowVariable = {
      id: Date.now().toString(), // Simple unique ID
      name: variableName.trim(),
      initialValue: initialValue.trim(),
    };
    setVariables([...variables, newVariable]);
    setVariableName("");
    setInitialValue("");
    toast({ title: "Success", description: `Variable "${newVariable.name}" added.` });
  };

  const handleDeleteVariable = (id: string) => {
    setVariables(variables.filter((v) => v.id !== id));
    toast({ title: "Success", description: `Variable deleted.` });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Variable className="h-5 w-5 text-primary" />
          <span>Variable Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddVariable} className="space-y-4 mb-4">
          <div>
            <Label htmlFor="variableName">Variable Name</Label>
            <Input
              id="variableName"
              type="text"
              value={variableName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setVariableName(e.target.value)}
              placeholder="e.g., userName"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="initialValue">Initial Value (Optional)</Label>
            <Input
              id="initialValue"
              type="text"
              value={initialValue}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setInitialValue(e.target.value)}
              placeholder="e.g., Guest"
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full">
            <PlusCircle size={18} className="mr-2" /> Add Variable
          </Button>
        </form>
        <Separator className="my-4" />
        {variables.length > 0 ? (
          <ScrollArea className="h-48">
            <div className="space-y-2 pr-2">
              {variables.map((variable) => (
                <div
                  key={variable.id}
                  className="flex items-center justify-between p-2 border rounded-md bg-muted/50"
                >
                  <div>
                    <p className="text-sm font-medium">{variable.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Initial Value: {variable.initialValue || "Not set"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteVariable(variable.id)}
                    aria-label="Delete variable"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-sm text-muted-foreground text-center">No variables defined yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
