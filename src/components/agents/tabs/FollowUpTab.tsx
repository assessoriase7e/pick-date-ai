import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useFollowUpHandler } from "@/handles/followup-handler";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getFollowUpPrompt } from "@/actions/agents/followup/get-followup-prompt";

interface FollowUpTabProps {
  onSave?: () => Promise<void>;
  isLoading: boolean;
  setIsLoading?: (value: boolean) => void;
}

export function FollowUpTab({
  onSave,
  isLoading,
  setIsLoading,
}: FollowUpTabProps) {
  const { user } = useUser();
  const { handleSaveFollowUpPrompt } = useFollowUpHandler();
  const [prompt, setPrompt] = useState("");
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    async function loadFollowUpPrompt() {
      if (!user?.id) return;

      try {
        const result = await getFollowUpPrompt(user.id);
        if (result.success && result.data?.followUpPrompt) {
          const followUpPrompt = result.data.followUpPrompt;
          setPrompt(followUpPrompt.content);
          setIsActive(followUpPrompt.isActive);
        }
      } catch (error) {
        console.error("Erro ao carregar prompt do Follow Up:", error);
      }
    }

    loadFollowUpPrompt();
  }, [user?.id]);

  const handleSave = async () => {
    if (onSave) {
      return onSave();
    }

    if (setIsLoading) setIsLoading(true);
    try {
      await handleSaveFollowUpPrompt(user?.id, prompt, isActive);
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="followup-active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="followup-active">Ativar</Label>
        </div>
      </div>

      <Textarea
        placeholder="Digite o prompt para o Follow Up..."
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
