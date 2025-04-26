"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Bolt, QrCode } from "lucide-react";
import { Evolution } from "@prisma/client";
import { deleteInstance } from "@/actions/agents/evolution/delete-instance";
import { toast } from "sonner";
import { QRCodeModal } from "./qrcode-modal";

interface EvolutionTableProps {
  instances: Evolution[];
  onEdit: (instance: Evolution) => void;
}

export function EvolutionTable({ instances, onEdit }: EvolutionTableProps) {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<Evolution | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (instanceId: string) => {
    if (confirm("Tem certeza que deseja excluir esta instância?")) {
      setIsDeleting(instanceId);
      try {
        const result = await deleteInstance(instanceId);
        if (result.success) {
          toast.success("Instância excluída com sucesso");
        } else {
          toast.error(result.error || "Falha ao excluir instância");
        }
      } catch (error) {
        toast.error("Ocorreu um erro ao excluir a instância");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleOpenQRModal = (instance: Evolution) => {
    setSelectedInstance(instance);
    setIsQRModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return <Badge className="bg-green-500">Conectado</Badge>;
      case "connecting":
        return <Badge className="bg-yellow-500">Conectando</Badge>;
      case "close":
        return <Badge className="bg-red-500">Desconectado</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome da Instância</TableHead>
              <TableHead>Número WhatsApp</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  Nenhuma instância encontrada
                </TableCell>
              </TableRow>
            ) : (
              instances.map((instance) => (
                <TableRow key={instance.id}>
                  <TableCell className="font-medium">{instance.instanceName}</TableCell>
                  <TableCell>{instance.number}</TableCell>
                  <TableCell>{getStatusBadge(instance.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit(instance)}
                        title="Configurar"
                      >
                        <Bolt className="h-4 w-4" />
                      </Button>
                      
                      {instance.status.toLowerCase() !== "open" && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenQRModal(instance)}
                          title="Escanear QR Code"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(instance.instanceId)}
                        disabled={isDeleting === instance.instanceId}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        instance={selectedInstance}
      />
    </>
  );
}