"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Users, CreditCard, Package } from "lucide-react";

type AdditionalCredit = {
  id: number;
  quantity: number;
  used: number;
  remaining: number;
  // expiresAt removido
};

type AIUsageStatsProps = {
  stats: {
    uniqueAttendances: number;
    totalAttendances: number;
    monthlyLimit: number;
    remainingCredits: number;
    additionalCredits?: AdditionalCredit[];
    totalAdditionalCredits?: number;
  };
};

export function AIUsageStats({ stats }: AIUsageStatsProps) {
  const isLifetimeUser = stats.monthlyLimit === Infinity;
  const progressPercentage =
    stats.monthlyLimit > 0 && stats.monthlyLimit !== Infinity
      ? Math.min((stats.uniqueAttendances / stats.monthlyLimit) * 100, 100)
      : 0;

  const getProgressColor = () => {
    if (progressPercentage >= 90) return "bg-red-500";
    if (progressPercentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Calcular créditos base restantes (sem contar os adicionais)
  const baseRemainingCredits = Math.max(0, stats.monthlyLimit - stats.uniqueAttendances);

  // Verificar se há pacotes adicionais
  const hasAdditionalCredits = stats.additionalCredits && stats.additionalCredits.length > 0;
  const totalAdditionalCredits = stats.totalAdditionalCredits || 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium leading-tight">Atendimentos Únicos (Mês Atual)</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-xl sm:text-2xl font-bold">
                {stats.uniqueAttendances}/{isLifetimeUser ? "∞" : stats.monthlyLimit || "∞"}
              </div>
              {stats.monthlyLimit > 0 && !isLifetimeUser && (
                <>
                  <Progress value={progressPercentage} className="w-full h-2" indicatorClassName={getProgressColor()} />
                  <p className="text-xs text-muted-foreground">{progressPercentage.toFixed(1)}% do limite mensal</p>
                </>
              )}
              {(stats.monthlyLimit === 0 || isLifetimeUser) && (
                <p className="text-xs text-muted-foreground">
                  {isLifetimeUser ? "Acesso Lifetime - Ilimitado" : "Sem plano de IA ativo"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium leading-tight">Créditos Restantes</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {isLifetimeUser ? "∞" : stats.monthlyLimit > 0 ? stats.remainingCredits : "∞"}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isLifetimeUser
                ? "Créditos ilimitados (Lifetime)"
                : stats.monthlyLimit > 0
                ? `${baseRemainingCredits} do plano + ${totalAdditionalCredits} adicionais`
                : "Sem limite de créditos"}
            </p>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium leading-tight">Total de Atendimentos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalAttendances}</div>
            <p className="text-xs text-muted-foreground mt-2">Atendimentos realizados este mês</p>
          </CardContent>
        </Card>

        {hasAdditionalCredits &&
          stats.additionalCredits!.map((credit) => (
            <Card key={credit.id} className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium leading-tight">
                  Pacote de {credit.quantity} créditos
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {credit.remaining}/{credit.quantity}
                </div>
                <Progress value={(credit.used / credit.quantity) * 100} className="w-full h-2 mt-2" />
                <div className="flex justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    {((credit.used / credit.quantity) * 100).toFixed(0)}% usado
                  </p>
                  {/* Bloco de expiração removido */}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
