"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash, Bolt, QrCode, RefreshCw } from "lucide-react";
import { InstanceModal } from "./instance-modal";
import { QRCodeModal } from "./qrcode-modal";
import { deleteInstance } from "@/actions/agents/evolution/delete-instance";
import { EvolutionInstance } from "@prisma/client";
import { revalidatePathAction } from "@/actions/revalidate-path";
import { Separator } from "@/components/ui/separator";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface EvolutionSectionProps {
  profilePhone?: string;
  instances: EvolutionInstance[];
  companyName?: string;
}

export function EvolutionSection({ profilePhone, instances, companyName }: EvolutionSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<EvolutionInstance>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [instanceToDelete, setInstanceToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!instanceToDelete) return;
    setIsDeleting(true);
    try {
      const result = await deleteInstance(instanceToDelete);
      if (result.success) {
        toast.success("Instância excluída com sucesso");
        setDeleteDialogOpen(false);
        setInstanceToDelete(null);
      } else {
        toast.error(result.error || "Erro ao excluir instância");
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao excluir a instância");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (instance: any) => {
    setSelectedInstance(instance);
    setIsModalOpen(true);
  };

  const handleQRCode = (instance: any) => {
    setSelectedInstance(instance);
    setIsQRModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedInstance(null);
  };

  const handleQRModalClose = () => {
    setIsQRModalOpen(false);
  };

  const refreshStatus = async () => {
    revalidatePathAction("/agents");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-green-500">Conectado</Badge>;
      case "close":
        return <Badge className="bg-red-500">Desconectado</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Whatsapp</CardTitle>
            <CardDescription>Canais de atendimento conectados</CardDescription>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>Nova Instância</Button>
        </div>
      </CardHeader>
      <CardContent>
        {instances.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma instância encontrada. Crie uma nova instância para começar.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {instances.map((instance) => (
              <Card key={instance.id} className="space-y-2">
                <CardHeader className="flex  flex-col items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <CardTitle className="text-lg">{instance.name}</CardTitle>
                    <Separator orientation="vertical" className="h-10" />
                    <CardDescription>{instance.number}</CardDescription>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <div className="flex items-center gap-2">
                      <span>
                        {instance.type === "attendant"
                          ? "Recepcionista"
                          : instance.type === "sdr"
                          ? "SDR"
                          : instance.type === "followup"
                          ? "Follow-up"
                          : instance.type}
                      </span>
                      <Separator orientation="vertical" className="h-10" />
                      {getStatusBadge(instance.status)}
                    </div>

                    <Separator orientation="vertical" className="h-10" />

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => refreshStatus()}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setInstanceToDelete(instance.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleEdit(instance)}>
                        <Bolt className="h-4 w-4" />
                      </Button>
                      {instance.status !== "open" && (
                        <Button variant="outline" size="icon" onClick={() => handleQRCode(instance)}>
                          <QrCode className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <InstanceModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialData={selectedInstance}
        profilePhone={profilePhone}
        companyName={companyName}
      />

      {selectedInstance && (
        <QRCodeModal isOpen={isQRModalOpen} onClose={handleQRModalClose} instance={selectedInstance} />
      )}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Confirmar exclusão"
        description="Tem certeza que deseja excluir esta instância?"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </Card>
  );
}
