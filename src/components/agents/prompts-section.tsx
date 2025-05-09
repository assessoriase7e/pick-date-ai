"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendantTab } from "./tabs/AttendantTab";
import { SdrTab } from "./tabs/SdrTab";
import { FollowUpTab } from "./tabs/FollowUpTab";

interface PromptsProps {
  attendantPrompt?: {
    isActive: boolean;
    content: string;
    presentation: string;
    speechStyle: string;
    expressionInterpretation: string;
    schedulingScript: string;
    rules: string;
  };
}

export function PromptsSection({ attendantPrompt }: PromptsProps) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Prompts</h2>

      <Tabs defaultValue="attendant" className="">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="attendant">Atendente</TabsTrigger>
          <TabsTrigger value="sdr">SDR</TabsTrigger>
          <TabsTrigger value="followup">Follow Up</TabsTrigger>
        </TabsList>

        <TabsContent value="attendant">
          <AttendantTab
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            initialData={attendantPrompt}
          />
        </TabsContent>

        <TabsContent value="sdr">
          <SdrTab isLoading={isLoading} setIsLoading={setIsLoading} />
        </TabsContent>

        <TabsContent value="followup">
          <FollowUpTab isLoading={isLoading} setIsLoading={setIsLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
