"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";
import { usePromptHandlers } from "@/handles/agent";
import { useAgentData } from "@/hooks/use-agent-data";

export function PromptsForm() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const { 
    attendantPrompt, 
    attendantEnabled, 
    setAttendantPrompt, 
    setAttendantEnabled 
  } = useAgentData();
  
  const { handleSavePrompt } = usePromptHandlers(setIsLoading);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Prompts</h2>
      <Tabs defaultValue="atendente">
        <TabsList>
          <TabsTrigger value="atendente">Atendente</TabsTrigger>
          <TabsTrigger value="sdr" disabled>
            SDR
          </TabsTrigger>
          <TabsTrigger value="followup" disabled>
            Follow Up
          </TabsTrigger>
        </TabsList>
        <TabsContent value="atendente" className="mt-4">
          <div className="space-y-4">
            <Textarea
              placeholder="Atendente"
              className="min-h-[200px]"
              value={attendantPrompt}
              onChange={(e) => setAttendantPrompt(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="attendant-active"
                  checked={attendantEnabled}
                  onCheckedChange={setAttendantEnabled}
                />
                <Label htmlFor="attendant-active">Ativar</Label>
              </div>
              <Button 
                onClick={() => handleSavePrompt(user?.id, attendantPrompt, attendantEnabled)} 
                disabled={isLoading}
              >
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}