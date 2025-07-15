"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ComboModal } from "./combo-modal";
import { CombosDataTable } from "./combos-data-table";
import { AssignComboModal } from "./assign-combo-modal";
import { ComboWithServices } from "@/types/combo";
import { Service, Client } from "@prisma/client";

interface CombosContentProps {
  combos: ComboWithServices[];
  services: Service[];
  clients: Client[];
}

export function CombosContent({ combos, services, clients }: CombosContentProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<ComboWithServices | null>(null);

  const handleEditCombo = (combo: ComboWithServices) => {
    setSelectedCombo(combo);
    setIsCreateModalOpen(true);
  };

  const handleAssignCombo = (combo: ComboWithServices) => {
    setSelectedCombo(combo);
    setIsAssignModalOpen(true);
  };

  const handleRefresh = () => {
    // Recarregar a página para atualizar os dados
    window.location.reload();
  };

  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsAssignModalOpen(false);
    setSelectedCombo(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Gerenciar Pacotes</h3>
          <p className="text-sm text-muted-foreground">Crie e gerencie pacotes de serviços com descontos especiais</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Pacote
        </Button>
      </div>

      <CombosDataTable data={combos} onEdit={handleEditCombo} onAssign={handleAssignCombo} />

      <ComboModal isOpen={isCreateModalOpen} onClose={handleCloseModals} services={services} combo={selectedCombo} />

      <AssignComboModal
        isOpen={isAssignModalOpen}
        onClose={handleCloseModals}
        combo={selectedCombo}
        clients={clients}
      />
    </div>
  );
}
