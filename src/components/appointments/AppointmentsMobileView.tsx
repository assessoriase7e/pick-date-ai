import { AppointmentFullData } from "@/types/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AppointmentsMobileViewProps {
  appointments: AppointmentFullData[];
  onDetailsClick: (appointment: AppointmentFullData) => void;
}

export function AppointmentsMobileView({
  appointments,
  onDetailsClick,
}: AppointmentsMobileViewProps) {
  return (
    <div className="space-y-4">
      {appointments.length > 0 ? (
        appointments.map((appointment) => {
          const startTime = new Date(appointment.startTime);
          const today = new Date();

          let statusClass = "";
          let statusLabel = "";

          if (
            format(startTime, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
          ) {
            statusClass = "bg-primary text-primary-foreground";
            statusLabel = "Hoje";
          } else if (startTime > today) {
            statusClass = "bg-yellow-500 text-white";
            statusLabel = "Futuro";
          } else {
            statusClass = "bg-green-500 text-white";
            statusLabel = "Realizado";
          }

          return (
            <Card key={appointment.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">
                      {appointment.client?.fullName || "Cliente Deletado"}
                    </h3>
                  </div>
                  <Badge variant="outline" className={statusClass}>
                    {statusLabel}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm">
                    <span className="font-medium">Profissional:</span>{" "}
                    {appointment.collaborator?.name || "Profissional não disponível"}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Serviço:</span>{" "}
                    {appointment.service?.name || "Serviço não disponível"}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Data:</span>{" "}
                    {format(startTime, "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDetailsClick(appointment)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Ver detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <div className="text-center py-10 border rounded-md">
          Nenhum agendamento encontrado.
        </div>
      )}
    </div>
  );
}