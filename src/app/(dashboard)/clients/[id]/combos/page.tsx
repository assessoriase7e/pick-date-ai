import { getClientCombos } from "@/actions/combos/get-client-combos";
import { getClient } from "@/actions/clients/get-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetachComboButton } from "@/components/combos/detach-combo-button";

interface ClientCombosPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientCombosPage({ params }: ClientCombosPageProps) {
  const { id } = await params;
  const clientId = parseInt(id);

  if (isNaN(clientId)) {
    notFound();
  }

  const [clientResponse, clientCombos] = await Promise.all([getClient(clientId), getClientCombos(clientId)]);

  if (!clientResponse.success || !clientResponse.data.client) {
    notFound();
  }

  const client = clientResponse.data.client;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-4">
          <Link href="/clients">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Pacotes de {client.fullName}</h2>
            <p className="text-muted-foreground">Visualize todos os pacotes adquiridos pelo cliente</p>
          </div>
        </div>
      </div>

      {clientCombos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum pacote encontrado</h3>
            <p className="text-muted-foreground text-center">Este cliente ainda não possui pacotes de serviços.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {clientCombos.map((clientCombo) => (
            <Card key={clientCombo.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-primary" />
                    <span>{clientCombo.comboName}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Adquirido em {formatDate(clientCombo.purchaseDate)}</Badge>
                    {/* Adicionar o botão de desatrelar apenas se o pacote estiver ativo e vinculado a um combo */}
                    {clientCombo.status === "active" && clientCombo.comboId && (
                      <DetachComboButton clientComboId={clientCombo.id} />
                    )}
                  </div>
                </div>
                <CardDescription>
                  {clientCombo.amountPaid ? (
                    <>Valor pago: {formatCurrency(clientCombo.amountPaid)}</>
                  ) : (
                    "Valor não informado"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Sessões do Pacote:</h4>
                    <div className="grid gap-2">
                      {clientCombo.sessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">{session.serviceName}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-muted-foreground">
                              {session.usedSessions}/{session.totalSessions} sessões utilizadas
                            </span>
                            <Badge variant={session.usedSessions >= session.totalSessions ? "destructive" : "default"}>
                              {session.usedSessions >= session.totalSessions ? "Concluído" : "Ativo"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
