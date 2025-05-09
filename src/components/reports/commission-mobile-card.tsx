"use client";

interface CommissionMobileCardProps {
  name: string;
  totalServices: number;
  totalRevenue: number;
  commission: number;
}

export function CommissionMobileCard({
  name,
  totalServices,
  totalRevenue,
  commission,
}: CommissionMobileCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="rounded-md border p-4 space-y-3">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{name}</h3>
            <p className="text-sm text-muted-foreground">
              Total de Serviços: {totalServices}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium">{formatCurrency(totalRevenue)}</p>
            <p className="text-sm text-muted-foreground">
              Comissão: {formatCurrency(commission)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}