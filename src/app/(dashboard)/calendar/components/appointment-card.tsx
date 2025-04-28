import { Clock, Edit, Trash2 } from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";

interface AppointmentCardProps {
  appointment: {
    id: string;
    startTime: Date;
    endTime: Date;
    client: {
      fullName: string;
    };
    service: {
      name: string;
    };
    notes?: string;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function AppointmentCard({ appointment, onEdit, onDelete }: AppointmentCardProps) {
  const { startTime, endTime, client, service, notes } = appointment;
  
  // Calcular a altura do card com base na duração do agendamento
  // Considerando que cada hora tem 80px de altura (h-20)
  const durationInMinutes = differenceInMinutes(endTime, startTime);
  const heightInPixels = (durationInMinutes / 60) * 80;
  
  return (
    <div 
      className="absolute left-0 right-0 bg-primary/20 border-l-4 border-primary p-2 mx-1 rounded-r overflow-hidden"
      style={{ 
        top: `${(startTime.getHours() * 80) + (startTime.getMinutes() / 60) * 80}px`,
        height: `${heightInPixels}px`,
        minHeight: '40px'
      }}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-medium truncate">{client.fullName}</h4>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-destructive hover:text-destructive" 
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
        <Clock className="h-3 w-3 mr-1" />
        <span>
          {format(startTime, 'HH:mm', { locale: ptBR })} - {format(endTime, 'HH:mm', { locale: ptBR })}
        </span>
      </div>
      
      <p className="text-sm font-medium mt-1">{service.name}</p>
      
      {notes && (
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
          {notes}
        </p>
      )}
    </div>
  );
}