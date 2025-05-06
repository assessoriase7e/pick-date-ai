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
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useAppointmentForm } from "@/hooks/forms/useAppointmentForm";
import { SelectWithScroll } from "../calendar/select-with-scroll";
import { useAppointmentDataStore } from "@/store/appointment-data-store";

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
    isLoading,
    isDeleting,
    isLoadingClients,
    isEditing,
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

  const { clients, services } = useAppointmentDataStore();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 flex flex-col justify-between h-full"
      >
        <div className="flex-1">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel></FormLabel>
                <SelectWithScroll
                  getOptionLabel={(option) => option.fullName}
                  getOptionValue={(option) => String(option.id)}
                  label="Cliente"
                  placeholder={
                    isLoadingClients
                      ? "Carregando clientes..."
                      : "Selecione um cliente"
                  }
                  options={clients || []}
                  value={field.value}
                  onChange={field.onChange}
                  error={form.formState.errors.clientId?.message}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serviceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel></FormLabel>
                <SelectWithScroll
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => String(option.id)}
                  label="Serviço"
                  placeholder="Selecione um serviço"
                  options={services}
                  value={field.value}
                  onChange={field.onChange}
                  error={form.formState.errors.clientId?.message}
                />
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
        </div>

        <div className="flex justify-end w-full gap-2">
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

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>Salvando...</>
            ) : (
              <>{isEditing ? "Atualizar" : "Agendar"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
