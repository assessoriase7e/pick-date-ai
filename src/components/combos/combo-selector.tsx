"use client";

import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { FormItem, FormLabel } from "@/components/ui/form";
import { SelectWithScroll } from "@/components/calendar/common/select-with-scroll";
import { Badge } from "@/components/ui/badge";
import { ClientComboWithDetails } from "@/types/combo";
import { getClientCombos } from "@/actions/combos/get-client-combos";

interface ComboSelectorProps {
  clientId: number | null;
  isUsingCombo: boolean;
  setIsUsingCombo: (value: boolean) => void;
  selectedCombo: ClientComboWithDetails | null;
  selectCombo: (combo: ClientComboWithDetails | null) => void;
  disabled?: boolean;
}

export function ComboSelector({
  clientId,
  isUsingCombo,
  setIsUsingCombo,
  selectedCombo,
  selectCombo,
  disabled = false,
}: ComboSelectorProps) {
  const [clientCombos, setClientCombos] = useState<ClientComboWithDetails[]>([]);
  const [isLoadingCombos, setIsLoadingCombos] = useState(false);

  // Função para carregar os combos do cliente
  const loadClientCombos = async (clientId: number) => {
    if (!clientId) return;

    setIsLoadingCombos(true);
    try {
      const combos = await getClientCombos(clientId);
      // Filtrar apenas combos ativos e não expirados
      const activeCombos = combos.filter(
        (combo) => combo.status === "active" && (!combo.expiresAt || new Date(combo.expiresAt) > new Date())
      );
      setClientCombos(activeCombos);
    } catch (error) {
      console.error("Erro ao carregar combos do cliente:", error);
    } finally {
      setIsLoadingCombos(false);
    }
  };

  // Atualizar quando o cliente mudar
  useEffect(() => {
    if (clientId) {
      loadClientCombos(clientId);
    } else {
      setClientCombos([]);
      selectCombo(null);
      setIsUsingCombo(false);
    }
  }, [clientId, selectCombo, setIsUsingCombo]);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Usar Pacote</h3>
        </div>
        <Switch
          checked={isUsingCombo}
          onCheckedChange={(checked) => {
            setIsUsingCombo(checked);
            if (!checked) {
              selectCombo(null);
            }
          }}
          disabled={clientCombos.length === 0 || isLoadingCombos || disabled}
        />
      </div>

      {isLoadingCombos && <p className="text-sm text-muted-foreground">Carregando combos...</p>}

      {isUsingCombo && clientCombos.length > 0 && (
        <div className="space-y-3">
          <FormItem className="w-full">
            <FormLabel>Selecione um Pacote</FormLabel>
            <SelectWithScroll
              placeholder="Selecione um pacote"
              options={clientCombos}
              value={selectedCombo ? selectedCombo.id : ""}
              onChange={(value) => {
                const combo = clientCombos.find((c) => c.id === parseInt(String(value)));
                selectCombo(combo || null);
              }}
              getOptionLabel={(option) => option?.comboName}
              getOptionValue={(option) => String(option.id)}
            />
          </FormItem>

          {selectedCombo && (
            <div className="bg-muted p-3 rounded-md space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">{selectedCombo.comboName}</h4>
                <Badge variant="outline">{selectedCombo.status === "active" ? "Ativo" : "Concluído"}</Badge>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Serviços disponíveis:</p>
                <div className="grid grid-cols-1 gap-2">
                  {selectedCombo.sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex justify-between items-center p-2 bg-background rounded border"
                    >
                      <span className="text-sm">{session.serviceName}</span>
                      <Badge variant={session.usedSessions < session.totalSessions ? "default" : "destructive"}>
                        {session.usedSessions} / {session.totalSessions}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isUsingCombo && clientCombos.length === 0 && !isLoadingCombos && (
        <p className="text-sm text-muted-foreground">
          Este cliente não possui pacotes ativos. Adicione um pacote na seção de clientes.
        </p>
      )}
    </div>
  );
}
