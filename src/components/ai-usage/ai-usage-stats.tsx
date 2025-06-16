"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Users, CreditCard } from "lucide-react";

type AIUsageStatsProps = {
  stats: {
    uniqueAttendances: number;
    totalAttendances: number;
    monthlyLimit: number;
    remainingCredits: number;
  };
};

export function AIUsageStats({ stats }: AIUsageStatsProps) {
  const progressPercentage = stats.monthlyLimit > 0 
    ? Math.min((stats.uniqueAttendances / stats.monthlyLimit) * 100, 100)
    : 0;

  const getProgressColor = () => {
    if (progressPercentage >= 90) return "bg-red-500";
    if (progressPercentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium leading-tight">
            Atendimentos Únicos (Mês Atual)
          </CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-xl sm:text-2xl font-bold">
              {stats.uniqueAttendances}/{stats.monthlyLimit || "∞"}
            </div>
            {stats.monthlyLimit > 0 && (
              <>
                <Progress 
                  value={progressPercentage} 
                  className="w-full h-2" 
                  indicatorClassName={getProgressColor()}
                />
                <p className="text-xs text-muted-foreground">
                  {progressPercentage.toFixed(1)}% do limite mensal
                </p>
              </>
            )}
            {stats.monthlyLimit === 0 && (
              <p className="text-xs text-muted-foreground">
                Sem plano de IA ativo
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium leading-tight">
            Créditos Restantes
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">
            {stats.monthlyLimit > 0 ? stats.remainingCredits : "∞"}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.monthlyLimit > 0 
              ? "Créditos disponíveis este mês"
              : "Sem limite de créditos"
            }
          </p>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium leading-tight">
            Total de Atendimentos
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{stats.totalAttendances}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Atendimentos realizados este mês
          </p>
        </CardContent>
      </Card>
    </div>
  );
}