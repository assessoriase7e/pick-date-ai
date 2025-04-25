import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSdrHandler } from "@/handles/sdr-handler";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getSdrPrompt } from "@/actions/agents/sdr/get-sdr-prompt";

interface SdrTabProps {
  onSave?: () => Promise<void>;
  isLoading: boolean;
  setIsLoading?: (value: boolean) => void;
}

export function SdrTab({ onSave, isLoading, setIsLoading }: SdrTabProps) {
  const { user } = useUser();
  const { handleSaveSdrPrompt } = useSdrHandler();
  const [prompt, setPrompt] = useState("");
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    async function loadSdrPrompt() {
      if (!user?.id) return;

      try {
        const result = await getSdrPrompt(user.id);
        if (result.success && result.data?.sdrPrompt) {
          const sdrPrompt = result.data.sdrPrompt;
          setPrompt(sdrPrompt.content);
          setIsActive(sdrPrompt.isActive);
        }
      } catch (error) {
        console.error("Erro ao carregar prompt do SDR:", error);
      }
    }

    loadSdrPrompt();
  }, [user?.id]);

  const handleSave = async () => {
    if (onSave) {
      return onSave();
    }

    if (setIsLoading) setIsLoading(true);
    try {
      await handleSaveSdrPrompt(user?.id, prompt, isActive);
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="sdr-active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="sdr-active">Ativar</Label>
        </div>
      </div>

      <Textarea
        placeholder="Digite o prompt para o SDR..."
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
