import { Row } from "@tanstack/react-table";

interface AppointmentMobileCardProps<TData> {
  row: Row<TData>;
}

export function AppointmentMobileCard<TData>({ row }: AppointmentMobileCardProps<TData>) {
  return (
    <div className="rounded-md border p-4 space-y-3">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">
              {row.getValue("clientName")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {row.getValue("serviceName")}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium">{row.getValue("date")}</p>
            <p className="text-sm text-muted-foreground">
              {row.getValue("time")}
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Profissional: {row.getValue("collaboratorName")}
        </p>
      </div>
    </div>
  );
}