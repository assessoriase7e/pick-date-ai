"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import moment from "moment";
import { Check, ChevronsUpDown } from "lucide-react";
import { createAppointment } from "@/actions/appointments/create";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Service, Client } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from "../ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import { AppointmentFullData } from "@/types/calendar";
import { updateAppointment } from "@/actions/appointments/update";

const publicAppointmentSchema = z.object({
  clientId: z.number().min(1, "Cliente é obrigatório"),
  serviceId: z.number().min(1, "Serviço é obrigatório"),
  startTime: z.string().min(1, "Horário de início é obrigatório"),
  endTime: z.string().min(1, "Horário de término é obrigatório"),
  collaboratorId: z.number().min(1, "Colaborador é obrigatório"), // ALTERADO: removido optional e nullable
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof publicAppointmentSchema>;

interface PublicAppointmentFormProps {
  date: Date;
  hour: number;
  calendarId: number;
  services: Service[];
  clients: Client[];
  onSuccess: () => void;
  onCancel: (appointmentId: number, isPublic?: boolean) => Promise<void>;
  appointment?: AppointmentFullData;
  collaboratorId: number;
}

export function PublicAppointmentForm({
  date,
  hour,
  calendarId,
  services,
  onSuccess,
  onCancel,
  appointment,
  clients,
  collaboratorId,
}: PublicAppointmentFormProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedServiceDuration, setSelectedServiceDuration] = useState<number>(60);
  const [openClientDrawer, setOpenClientDrawer] = useState(false);
  const [openServiceDrawer, setOpenServiceDrawer] = useState(false);
  const [searchClient, setSearchClient] = useState("");
  const [searchService, setSearchService] = useState("");

  const defaultStartTime = `${hour.toString().padStart(2, "0")}:00`;
  const defaultEndTime = moment(defaultStartTime, "HH:mm").add(1, "hour").format("HH:mm");

  const form = useForm<FormValues>({
    resolver: zodResolver(publicAppointmentSchema),
    defaultValues: {
      clientId: appointment?.clientId || null,
      serviceId: appointment?.serviceId || null,
      startTime: appointment ? moment(appointment.startTime).format("HH:mm") : defaultStartTime,
      endTime: appointment ? moment(appointment.endTime).format("HH:mm") : defaultEndTime,
      notes: appointment?.notes || "",
      collaboratorId: collaboratorId, // ALTERADO: sempre obrigatório
    },
  });

  // Atualiza a duração do serviço quando o serviço é selecionado
  useEffect(() => {
    const serviceId = form.watch("serviceId");
    if (!services) return; // Adicionando verificação de segurança
    const service = services.find((s) => s.id === serviceId);
    if (service) {
      setSelectedServiceDuration(service.durationMinutes || 60);
    }
  }, [form.watch("serviceId"), services]);

  // Atualiza o horário de término baseado na duração do serviço
  useEffect(() => {
    const startTime = form.watch("startTime");
    if (selectedServiceDuration && startTime) {
      const newEndTime = moment(startTime, "HH:mm").add(selectedServiceDuration, "minutes").format("HH:mm");
      form.setValue("endTime", newEndTime);
    }
  }, [selectedServiceDuration, form.watch("startTime")]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);

      // Configurar horário de início
      const [startHour, startMinute] = values.startTime.split(":").map(Number);
      const startTime = new Date(date);
      startTime.setHours(startHour, startMinute, 0, 0);

      // Configurar horário de término
      const [endHour, endMinute] = values.endTime.split(":").map(Number);
      const endTime = new Date(date);
      endTime.setHours(endHour, endMinute, 0, 0);

      // Verificar se o horário de término é depois do início
      if (endTime <= startTime) {
        toast.error("O horário de término deve ser depois do horário de início");
        setIsLoading(false);
        return;
      }

      let appointmentData: any = {
        serviceId: values.serviceId,
        calendarId,
        startTime,
        endTime,
        notes: values.notes || null,
        status: "scheduled",
        servicePrice: services?.find((s) => s.id === values.serviceId)?.price ?? null,
        finalPrice: services?.find((s) => s.id === values.serviceId)?.price ?? null,
        collaboratorId,
        clientId: values.clientId,
      };

      let result;
      if (appointment) {
        result = await updateAppointment(appointment.id, appointmentData, true);
      } else {
        result = await createAppointment({
          ...appointmentData,
          isPublic: true,
        });
      }

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(appointment ? "Agendamento atualizado com sucesso!" : "Agendamento criado com sucesso!");
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      toast.error(
        appointment ? "Ocorreu um erro ao atualizar o agendamento" : "Ocorreu um erro ao criar o agendamento"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients =
    clients?.filter(
      (client) =>
        client.fullName.toLowerCase().includes(searchClient.toLowerCase()) || client.phone.includes(searchClient)
    ) || [];

  const filteredServices = (services || []).filter((service) =>
    service.name.toLowerCase().includes(searchService.toLowerCase())
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Novo Agendamento</h2>
          <p className="text-muted-foreground mb-4">{moment(date).format("DD/MM/YYYY")}</p>
        </div>

        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Selecione um Cliente</FormLabel>
              {isMobile ? (
                <Drawer open={openClientDrawer} onOpenChange={setOpenClientDrawer}>
                  <DrawerTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {field.value
                        ? clients?.find((client) => client.id === field.value)?.fullName || "Selecione um cliente"
                        : "Selecione um cliente"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader></DrawerHeader>
                    <div className="p-4 pb-0">
                      <h2 className="text-lg font-semibold mb-4">Selecionar Cliente</h2>
                      <Input
                        placeholder="Buscar cliente..."
                        value={searchClient}
                        onChange={(e) => setSearchClient(e.target.value)}
                        className="mb-4"
                      />
                    </div>
                    <div className="p-4 pt-0 overflow-y-auto" style={{ maxHeight: "60svh" }}>
                      {filteredClients.length === 0 ? (
                        <p className="text-center text-muted-foreground">Nenhum cliente encontrado.</p>
                      ) : (
                        filteredClients.map((client) => (
                          <Button
                            key={client.id}
                            variant="ghost"
                            className="w-full justify-start mb-2"
                            onClick={() => {
                              field.onChange(client.id);
                              setOpenClientDrawer(false);
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", field.value === client.id ? "opacity-100" : "opacity-0")}
                            />
                            {client.fullName} - {client.phone}
                          </Button>
                        ))
                      )}
                    </div>
                  </DrawerContent>
                </Drawer>
              ) : (
                <Dialog open={openClientDrawer} onOpenChange={setOpenClientDrawer}>
                  <DialogTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {field.value
                        ? clients?.find((client) => client.id === field.value)?.fullName || "Selecione um cliente"
                        : "Selecione um cliente"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <div className="p-4 pb-0">
                      <h2 className="text-lg font-semibold mb-4">Selecionar Cliente</h2>
                      <Input
                        placeholder="Buscar cliente..."
                        value={searchClient}
                        onChange={(e) => setSearchClient(e.target.value)}
                        className="mb-4"
                      />
                    </div>
                    <div className="p-4 pt-0 overflow-y-auto" style={{ maxHeight: "400px" }}>
                      {filteredClients.length === 0 ? (
                        <p className="text-center text-muted-foreground">Nenhum cliente encontrado.</p>
                      ) : (
                        filteredClients.map((client) => (
                          <Button
                            key={client.id}
                            variant="ghost"
                            className="w-full justify-start mb-2"
                            onClick={() => {
                              field.onChange(client.id);
                              setOpenClientDrawer(false);
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", field.value === client.id ? "opacity-100" : "opacity-0")}
                            />
                            {client.fullName} - {client.phone}
                          </Button>
                        ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serviceId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Serviço</FormLabel>
              {isMobile ? (
                <Drawer open={openServiceDrawer} onOpenChange={setOpenServiceDrawer}>
                  <DrawerTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {field.value
                        ? services?.find((service) => service.id === field.value)?.name || "Selecione um serviço"
                        : "Selecione um serviço"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <div className="p-4 pb-0">
                      <h2 className="text-lg font-semibold mb-4">Selecionar Serviço</h2>
                      <Input
                        placeholder="Buscar serviço..."
                        value={searchService}
                        onChange={(e) => setSearchService(e.target.value)}
                        className="mb-4"
                      />
                    </div>
                    <div className="p-4 pt-0 overflow-y-auto" style={{ maxHeight: "60svh" }}>
                      {filteredServices.length === 0 ? (
                        <p className="text-center text-muted-foreground">Nenhum serviço encontrado.</p>
                      ) : (
                        filteredServices.map((service) => (
                          <Button
                            key={service.id}
                            variant="ghost"
                            className="w-full justify-start mb-2"
                            onClick={() => {
                              field.onChange(service.id);
                              setOpenServiceDrawer(false);
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", field.value === service.id ? "opacity-100" : "opacity-0")}
                            />
                            {service.name} - {service.durationMinutes}min - R$
                            {service.price?.toFixed(2)}
                          </Button>
                        ))
                      )}
                    </div>
                  </DrawerContent>
                </Drawer>
              ) : (
                <Dialog open={openServiceDrawer} onOpenChange={setOpenServiceDrawer}>
                  <DialogTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {field.value
                        ? services?.find((service) => service.id === field.value)?.name || "Selecione um serviço"
                        : "Selecione um serviço"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle></DialogTitle>
                    </DialogHeader>
                    <div className="p-4 pb-0">
                      <h2 className="text-lg font-semibold mb-4">Selecionar Serviço</h2>
                      <Input
                        placeholder="Buscar serviço..."
                        value={searchService}
                        onChange={(e) => setSearchService(e.target.value)}
                        className="mb-4"
                      />
                    </div>
                    <div className="p-4 pt-0 overflow-y-auto" style={{ maxHeight: "400px" }}>
                      {filteredServices.length === 0 ? (
                        <p className="text-center text-muted-foreground">Nenhum serviço encontrado.</p>
                      ) : (
                        filteredServices.map((service) => (
                          <Button
                            key={service.id}
                            variant="ghost"
                            className="w-full justify-start mb-2"
                            onClick={() => {
                              field.onChange(service.id);
                              setOpenServiceDrawer(false);
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", field.value === service.id ? "opacity-100" : "opacity-0")}
                            />
                            {service.name} - {service.durationMinutes}min - R$
                            {service.price?.toFixed(2)}
                          </Button>
                        ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
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
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button type="submit" disabled={isLoading} className="w-full mb-2">
            {isLoading
              ? appointment
                ? "Atualizando..."
                : "Agendando..."
              : appointment
              ? "Atualizar Agendamento"
              : "Confirmar Agendamento"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onCancel(appointment?.id!, true)}
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
