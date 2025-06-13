"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Users } from "lucide-react";

type AIUsageStatsProps = {
  stats: {
    uniqueAttendances: number;
    totalAttendances: number;
  };
};

export function AIUsageStats({ stats }: AIUsageStatsProps) {
  const progressPercentage = Math.min((stats.uniqueAttendances / 100) * 100, 100);

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium leading-tight">
            Atendimentos Únicos (Mês Atual)
          </CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-xl sm:text-2xl font-bold">{stats.uniqueAttendances}/100</div>
            <Progress value={progressPercentage} className="w-full h-2" />
            <p className="text-xs text-muted-foreground">
              {progressPercentage.toFixed(1)}% do limite mensal
            </p>
          </div>
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