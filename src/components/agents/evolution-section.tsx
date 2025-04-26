"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { EvolutionTable } from "./evolution-table";
import { EvolutionModal } from "./evolution-modal";
import { Evolution } from "@prisma/client";

interface EvolutionSectionProps {
  instances: Evolution[];
  phoneNumber: string;
}

export function EvolutionSection({ instances, phoneNumber }: EvolutionSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<Evolution | null>(null);

  const handleOpenModal = (instance?: Evolution) => {
    setSelectedInstance(instance || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInstance(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Instâncias WhatsApp</h2>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Nova Instância
        </Button>
      </div>

      <EvolutionTable 
        instances={instances} 
        onEdit={handleOpenModal} 
      />

      <EvolutionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        instance={selectedInstance}
        phoneNumber={phoneNumber}
      />
    </div>
  );
}