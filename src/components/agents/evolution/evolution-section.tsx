"use client";

import { useState, useEffect } from "react";
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
import { Trash, Bolt, QrCode } from "lucide-react";
import { InstanceModal } from "./instance-modal";
import { QRCodeModal } from "./qrcode-modal";
import { getInstances } from "@/actions/evolution/get-instances";
import { deleteInstance } from "@/actions/evolution/delete-instance";
import { EvolutionInstance } from "@prisma/client";

interface EvolutionSectionProps {
  profilePhone?: string;
}

export function EvolutionSection({ profilePhone }: EvolutionSectionProps) {
  const [instances, setInstances] = useState<EvolutionInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<any>(null);

  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async () => {
    setIsLoading(true);
    try {
      const { data } = await getInstances();

      setInstances(data || []);
    } catch (error) {
      toast.error("Ocorreu um erro ao buscar as instâncias");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta instância?")) {
      try {
        const result = await deleteInstance(id);
        if (result.success) {
          toast.success("Instância excluída com sucesso");
          fetchInstances();
        } else {
          toast.error(result.error || "Erro ao excluir instância");
        }
      } catch (error) {
        toast.error("Ocorreu um erro ao excluir a instância");
      }
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
    fetchInstances();
  };

  const handleQRModalClose = () => {
    setIsQRModalOpen(false);
    fetchInstances();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-500">Conectado</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      case "disconnected":
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
            <CardTitle>Evolution API</CardTitle>
            <CardDescription>
              Gerencie suas instâncias de WhatsApp
            </CardDescription>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>Nova Instância</Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : instances.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma instância encontrada. Crie uma nova instância para começar.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instances.map((instance) => (
                <TableRow key={instance.id}>
                  <TableCell className="font-medium">{instance.name}</TableCell>
                  <TableCell>{instance.number}</TableCell>
                  <TableCell>{getStatusBadge(instance.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(instance.id)}
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
                      {instance.status !== "connected" && (
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
      />

      {selectedInstance && (
        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={handleQRModalClose}
          instanceId={selectedInstance.id}
          instanceName={selectedInstance.name}
        />
      )}
    </Card>
  );
}
