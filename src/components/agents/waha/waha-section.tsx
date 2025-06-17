"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash, Bolt, QrCode, RefreshCw } from "lucide-react";
import { SessionModal } from "./session-modal";
import { QRCodeModal } from "./qrcode-modal";
import { deleteSession } from "@/actions/agents/waha/delete-session";
import { WahaInstance } from "@prisma/client";
import { revalidatePathAction } from "@/actions/revalidate-path";
import { Separator } from "@/components/ui/separator";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface WahaSectionProps {
  profilePhone?: string;
  sessions: WahaInstance[];
  companyName?: string;
}

export function WahaSection({ profilePhone, sessions, companyName }: WahaSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<WahaInstance | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!sessionToDelete) return;
    setIsDeleting(true);
    try {
      const result = await deleteSession(sessionToDelete);
      if (result.success) {
        toast.success("Sessão excluída com sucesso");
        setDeleteDialogOpen(false);
        setSessionToDelete(null);
      } else {
        toast.error(result.error || "Erro ao excluir sessão");
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao excluir a sessão");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (session: WahaInstance) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleQRCode = (session: WahaInstance) => {
    setSelectedSession(session);
    setIsQRModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  const handleQRModalClose = () => {
    setIsQRModalOpen(false);
  };

  const refreshStatus = async () => {
    revalidatePathAction("/agents");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "WORKING":
        return <Badge className="bg-green-500">Conectado</Badge>;
      case "STOPPED":
        return <Badge className="bg-red-500">Desconectado</Badge>;
      case "STARTING":
        return <Badge className="bg-yellow-500">Iniciando</Badge>;
      case "SCAN_QR_CODE":
        return <Badge className="bg-blue-500">Aguardando QR</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>WhatsApp</CardTitle>
            <CardDescription>Sessões de atendimento conectadas</CardDescription>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>Nova Sessão</Button>
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma sessão encontrada. Crie uma nova sessão para começar.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sessions.map((session) => (
              <Card key={session.id} className="space-y-2">
                <CardHeader className="flex flex-col items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <CardTitle className="text-lg">{session.name}</CardTitle>
                    <Separator orientation="vertical" className="h-10" />
                    <CardDescription>{session.number}</CardDescription>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <div className="flex items-center gap-2">
                      <span>
                        {session.type === "attendant"
                          ? "Recepcionista"
                          : session.type === "sdr"
                          ? "SDR"
                          : session.type === "followup"
                          ? "Follow-up"
                          : session.type}
                      </span>
                      <Separator orientation="vertical" className="h-10" />
                      {getStatusBadge(session.status)}
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
                          setSessionToDelete(session.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleEdit(session)}>
                        <Bolt className="h-4 w-4" />
                      </Button>
                      {session.status !== "WORKING" && (
                        <Button variant="outline" size="icon" onClick={() => handleQRCode(session)}>
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

      <SessionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialData={selectedSession}
        profilePhone={profilePhone}
        companyName={companyName}
      />

      {selectedSession && <QRCodeModal isOpen={isQRModalOpen} onClose={handleQRModalClose} session={selectedSession} />}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Confirmar exclusão"
        description="Tem certeza que deseja excluir esta sessão?"
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </Card>
  );
}
