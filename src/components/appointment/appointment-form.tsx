"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AppointmentFullData } from "@/types/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useAppointmentForm } from "@/hooks/forms/useAppointmentForm";

interface AppointmentFormProps {
  date: Date;
  appointment?: AppointmentFullData;
  onSuccess: () => void;
  checkTimeConflict: (
    startTime: Date,
    endTime: Date,
    excludeId?: string
  ) => boolean;
  initialStartTime?: string;
  initialEndTime?: string;
  calendarId: string;
}

export function AppointmentForm({
  date,
  appointment,
  onSuccess,
  checkTimeConflict,
  initialStartTime,
  initialEndTime,
  calendarId,
}: AppointmentFormProps) {
  const {
    form,
    clients,
    services,
    isLoading,
    isDeleting,
    isLoadingClients,
    isLoadingServices,
    isEditing,
    isServiceAvailableOnDay,
    onSubmit,
    handleDelete,
  } = useAppointmentForm({
    date,
    appointment,
    onSuccess,
    checkTimeConflict,
    calendarId,
    initialStartTime,
    initialEndTime,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
                disabled={isLoadingClients}
              >
                <FormControl>
                  <SelectTrigger>
                    {isLoadingClients ? (
                      <div className="flex items-center justify-center w-full">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        <span className="ml-2">Carregando...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="Selecione um cliente" />
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serviceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serviço</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
                disabled={isLoadingServices}
              >
                <FormControl>
                  <SelectTrigger>
                    {isLoadingServices ? (
                      <div className="flex items-center justify-center w-full">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        <span className="ml-2">Carregando...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="Selecione um serviço" />
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {services.map((service) => {
                    const isAvailable = isServiceAvailableOnDay(service);
                    return (
                      <SelectItem
                        key={service.id}
                        value={service.id}
                        disabled={!isAvailable}
                        className={
                          !isAvailable ? "opacity-50 cursor-not-allowed" : ""
                        }
                      >
                        {service.name}{" "}
                        {!isAvailable && "(Indisponível neste dia)"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário de Início</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário de Término</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Adicione observações sobre o agendamento"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between mt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>Salvando...</>
            ) : (
              <>{isEditing ? "Atualizar" : "Agendar"}</>
            )}
          </Button>

          {isEditing && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Cancelando..." : "Cancelar Agendamento"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
