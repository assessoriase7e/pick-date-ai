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
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Atendimentos Únicos (Mês Atual)
          </CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-2xl font-bold">{stats.uniqueAttendances}/100</div>
            <Progress value={progressPercentage} className="w-full" />
            <p className="text-xs text-muted-foreground">
              {progressPercentage.toFixed(1)}% do limite mensal
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Atendimentos
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAttendances}</div>
          <p className="text-xs text-muted-foreground">
            Atendimentos realizados este mês
          </p>
        </CardContent>
      </Card>
    </div>
  );
}