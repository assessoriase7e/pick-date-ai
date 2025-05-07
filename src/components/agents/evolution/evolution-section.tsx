"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash, Bolt, QrCode, RefreshCw } from "lucide-react";
import { InstanceModal } from "./instance-modal";
import { QRCodeModal } from "./qrcode-modal";
import { deleteInstance } from "@/actions/agents/evolution/delete-instance";
import { EvolutionInstance } from "@prisma/client";
import { revalidatePathAction } from "@/actions/revalidate-path";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface EvolutionSectionProps {
  profilePhone?: string;
  instances: EvolutionInstance[];
  companyName?: string;
}

export function EvolutionSection({
  profilePhone,
  instances,
  companyName,
}: EvolutionSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [instanceToDelete, setInstanceToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!instanceToDelete) return;
    try {
      const result = await deleteInstance(instanceToDelete);
      if (result.success) {
        toast.success("Instância excluída com sucesso");
      } else {
        toast.error(result.error || "Erro ao excluir instância");
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao excluir a instância");
    } finally {
      setDeleteDialogOpen(false);
      setInstanceToDelete(null);
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
          <Button
            onClick={() => setIsModalOpen(true)}
            disabled={instances.length > 0}
          >
            Nova Instância
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {instances.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma instância encontrada. Crie uma nova instância para começar.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instances.map((instance) => (
                <TableRow key={instance.id}>
                  <TableCell className="font-medium">{instance.name}</TableCell>
                  <TableCell>{instance.number}</TableCell>
                  <TableCell>
                    {instance.type === "attendant"
                      ? "Recepcionista"
                      : instance.type === "sdr"
                      ? "SDR"
                      : instance.type === "followup"
                      ? "Follow-up"
                      : instance.type}
                  </TableCell>
                  <TableCell>{getStatusBadge(instance.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => refreshStatus()}
                      >
                        <RefreshCw className={`h-4 w-4`} />
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
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(instance)}
                      >
                        <Bolt className="h-4 w-4" />
                      </Button>
                      {instance.status !== "open" && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQRCode(instance)}
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={handleQRModalClose}
          instance={selectedInstance}
        />
      )}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <div>Tem certeza que deseja excluir esta instância?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
