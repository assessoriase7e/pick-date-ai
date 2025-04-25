import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAttendantHandler } from "@/handles/attendant-handler";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getPrompts } from "@/actions/agents/prompts";

interface AttendantTabProps {
  onSave?: () => Promise<void>;
  isLoading: boolean;
  setIsLoading?: (value: boolean) => void;
}

export function AttendantTab({
  onSave,
  isLoading,
  setIsLoading,
}: AttendantTabProps) {
  const { user } = useUser();
  const { handleSaveAttendantPrompt } = useAttendantHandler();
  const [prompt, setPrompt] = useState("");
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    async function loadAttendantPrompt() {
      if (!user?.id) return;
      
      try {
        const result = await getPrompts(user.id);
        if (result.success && result.data?.prompts) {
          const { prompts } = result.data;
          
          const attendantPrompt = prompts.find(prompt => prompt.type === "Atendente");
          if (attendantPrompt) {
            setPrompt(attendantPrompt.content);
            setIsActive(attendantPrompt.isActive);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar prompt do atendente:", error);
      }
    }
    
    loadAttendantPrompt();
  }, [user?.id]);
  
  const handleSave = async () => {
    if (onSave) {
      return onSave();
    }
    
    if (setIsLoading) setIsLoading(true);
    try {
      await handleSaveAttendantPrompt(user?.id, prompt, isActive);
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="attendant-active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="attendant-active">Ativar</Label>
        </div>
      </div>

      <Textarea
        placeholder="Digite o prompt para o atendente..."
        className="min-h-[200px]"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
}
