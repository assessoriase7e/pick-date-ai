import { X, Clock } from "lucide-react";
import moment from "moment";

interface DayDetailsModalProps {
  dayDetails: {
    date: Date;
    isOpen: boolean;
  } | null;
  closeDayDetails: () => void;
}

export function DayDetailsModal({
  dayDetails,
  closeDayDetails,
}: DayDetailsModalProps) {
  if (!dayDetails || !dayDetails.isOpen) return null;

  const formatFullDate = (date: Date) => {
    return moment(date).format("dddd, D [de] MMMM [de] YYYY");
  };

  const formatHour = (hour: number) => {
    return moment().hour(hour).minute(0).format("HH:mm");
  };

  // Gerar as horas do dia para a régua
  const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="fixed inset-y-0 right-0 bg-background w-full max-w-md flex flex-col z-40">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-xl font-semibold capitalize">
          {formatFullDate(dayDetails.date)}
        </h3>
        <button onClick={closeDayDetails} className="p-1">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex h-full">
          {/* Régua de horas */}
          <div className="w-16 flex-shrink-0 border-r bg-muted/20">
            {hoursOfDay.map((hour) => (
              <div
                key={hour}
                className="h-20 flex items-center justify-center border-b"
              >
                <span className="text-sm font-medium">{formatHour(hour)}</span>
              </div>
            ))}
          </div>

          {/* Área de conteúdo para compromissos */}
          <div className="flex-1 relative">
            {hoursOfDay.map((hour) => (
              <div
                key={hour}
                className="h-20 border-b hover:bg-muted/20 transition-colors cursor-pointer"
              >
                {/* Aqui você pode renderizar os compromissos para cada hora */}
                {hour === 14 && (
                  <div className="absolute top-[280px] left-0 right-0 h-20 bg-primary/20 border-l-4 border-primary p-2 mx-1 rounded-r">
                    <h4 className="font-medium">Reunião com cliente</h4>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>
                        {formatHour(14)} - {formatHour(15)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">
                      Discussão sobre o novo projeto de áudio
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t p-4 flex justify-between">
        <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm font-medium">
          + Adicionar compromisso
        </button>
        <button
          onClick={closeDayDetails}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-sm font-medium"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
