"use client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { SelectWithScroll } from "../calendar/common/select-with-scroll";
import { AppointmentFormProps } from "@/validators/appointment";
import { NumericFormat } from "react-number-format";
import moment from "moment";
import { Client, Service } from "@prisma/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Clock, DollarSign, FileText, PackageIcon, User } from "lucide-react";
// Substituir a importação do useAutoPrint (linha 31)
import { useAutoPrint } from "@/hooks/use-auto-print";
import { useAppointmentForm } from "@/hooks/forms/useAppointmentForm";
import { cn } from "@/lib/utils";
import { CalendarWithFullCollaborator } from "@/types/calendar";
import { ComboSelector } from "../combos/combo-selector";

interface ExtendedAppointmentFormProps extends AppointmentFormProps {
  clients: Client[];
  services: Service[];
  calendar: CalendarWithFullCollaborator;
}

export function AppointmentForm({
  date,
  appointment,
  onSuccess,
  checkTimeConflict,
  initialStartTime,
  initialEndTime,
  clients,
  services,
  calendar,
}: ExtendedAppointmentFormProps) {
  // Usando o hook simplificado
  const { printAppointment, isPrinting } = useAutoPrint();

  // Usando o hook useAppointmentForm
  const {
    form,
    isLoading,
    isDeleting,
    isEditing,
    isServiceAvailableOnDay,
    activeTab,
    setActiveTab,
    onSubmit,
    handleDelete,
    updatePriceFromService,
    formatCurrency,
    clientData,
    serviceData,
    getAvailableServicesForCombo,
    selectedCombo,
    isUsingCombo,
    setIsUsingCombo,
    selectCombo,
    getAvailableServices,
  } = useAppointmentForm({
    date,
    appointment,
    onSuccess,
    checkTimeConflict,
    calendar,
    initialStartTime,
    initialEndTime,
  });

  if (!calendar?.isActive && !isEditing) {
    return (
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agenda Inativa</DialogTitle>
            <DialogDescription>
              Esta agenda está temporariamente inativa e não está aceitando novos agendamentos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onSuccess}>Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger
          value="resumo"
          disabled={!isEditing && !form.getValues("clientId")}
          className={cn("hidden", isEditing && "block")}
        >
          Resumo
        </TabsTrigger>
        <TabsTrigger value="editar">{isEditing ? "Editar" : "Criar"}</TabsTrigger>
      </TabsList>

      <TabsContent value="resumo" className="space-y-5">
        <div>
          <p className="text-2xl font-semibold">Detalhes do Agendamento</p>
          <p className="text-muted-foreground">Informações completas sobre o agendamento</p>
        </div>

        <div className="flex-1 space-y-4">
          {clientData && (
            <div className="flex items-start gap-2">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Cliente</p>
                <p className="text-muted-foreground">{clientData.fullName}</p>
              </div>
            </div>
          )}

          {serviceData && (
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Serviço</p>
                <p className="text-muted-foreground">{serviceData.name}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2">
            <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Data</p>
              <p className="text-muted-foreground">{moment(date).format("DD/MM/YYYY")}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Horário</p>
              <p className="text-muted-foreground">
                {form.getValues("startTime")} às {form.getValues("endTime")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Valor</p>
              <p className="text-muted-foreground">{formatCurrency(form.getValues("finalPrice"))}</p>
            </div>
          </div>

          {form.getValues("notes") && (
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Observações</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{form.getValues("notes")}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto flex flex-col lg:flex-row justify-end gap-2">
          {isEditing && (
            <>
              <Button
                type="button"
                variant="outline"
                className="hidden md:block"
                onClick={() => appointment?.id && printAppointment(appointment.id)}
                disabled={isPrinting}
              >
                {isPrinting ? "Imprimindo..." : "Imprimir Comanda"}
              </Button>
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                Cancelar Agendamento
              </Button>
            </>
          )}
        </div>
      </TabsContent>
      <TabsContent value="editar">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex flex-col justify-between h-full">
            <div>
              <p className="text-2xl font-semibold">{isEditing ? "Edição do Agendamento" : "Criação do Agendamento"}</p>
              <p className="text-muted-foreground">
                {isEditing ? "Atualize as informações do agendamento" : "Crie um novo agendamento"}
              </p>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex gap-5 w-full">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel></FormLabel>
                      <SelectWithScroll
                        getOptionLabel={(option) => option?.fullName || ""}
                        getOptionValue={(option) => String(option?.id) || null}
                        label="Cliente"
                        placeholder="Selecione um cliente"
                        options={clients || []}
                        value={String(field.value)}
                        onChange={(value) => {
                          field.onChange(value);
                          if (value && !isEditing) {
                            setActiveTab("resumo");
                          }
                        }}
                        error={form.formState.errors.clientId?.message}
                        disabled={isEditing} // Desabilitar seleção de cliente na edição
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Exibir informações do combo quando estiver editando um agendamento com combo */}
              {isEditing && appointment?.comboId && (
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <PackageIcon className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Pacote utilizado</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{appointment.comboName}</p>
                </div>
              )}

              {/* Exibir o seletor de combo apenas quando estiver criando um novo agendamento */}
              {form.getValues("clientId") && !isEditing ? (
                <ComboSelector
                  clientId={form.getValues("clientId")}
                  isUsingCombo={isUsingCombo}
                  setIsUsingCombo={setIsUsingCombo}
                  selectedCombo={selectedCombo}
                  selectCombo={selectCombo}
                />
              ) : (
                <></>
              )}

              {/* Exibir o seletor de serviço apenas se não estiver editando um agendamento com combo */}
              {(!isEditing || (isEditing && !appointment?.comboId)) && (
                <FormField
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <SelectWithScroll
                        getOptionLabel={(option) => option?.name}
                        getOptionValue={(option) => String(option?.id)}
                        label="Serviço"
                        placeholder="Selecione um serviço"
                        options={
                          isUsingCombo && !isEditing
                            ? getAvailableServices()
                            : services.filter((service) => isServiceAvailableOnDay(service))
                        }
                        value={String(field.value)}
                        onChange={(value) => {
                          field.onChange(value);
                          if (value && !isUsingCombo) {
                            updatePriceFromService(Number(value));
                          } else if (value && isUsingCombo) {
                            // Se estiver usando combo, o preço é zero
                            form.setValue("servicePrice", 0);
                            form.setValue("finalPrice", 0);
                          }
                        }}
                        error={form.formState.errors.serviceId?.message}
                        disabled={isUsingCombo && getAvailableServices().length === 0}
                      />
                      {isUsingCombo && getAvailableServices().length === 0 && (
                        <p className="text-sm text-destructive mt-2">
                          Não há serviços disponíveis para este profissional neste pacote.
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Exibir o seletor de serviço para troca quando estiver editando um agendamento com combo */}
              {isEditing && appointment?.comboId && (
                <FormField
                  control={form.control}
                  name="newServiceId"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <SelectWithScroll
                        getOptionLabel={(option) => option?.name}
                        getOptionValue={(option) => String(option?.id)}
                        label="Alterar serviço"
                        placeholder="Selecione um novo serviço"
                        options={getAvailableServicesForCombo(appointment.comboId)}
                        value={field.value ? String(field.value) : ""}
                        onChange={(value) => {
                          field.onChange(value ? Number(value) : null);
                        }}
                        error={form.formState.errors.newServiceId?.message}
                      />
                      <FormMessage />
                      <p className="text-xs text-muted-foreground mt-1">
                        Ao alterar o serviço, o crédito do serviço anterior será devolvido ao combo e um crédito do novo
                        serviço será utilizado.
                      </p>
                    </FormItem>
                  )}
                />
              )}

              {/* Mostrar o campo de preço apenas se não estiver usando combo */}
              {!isUsingCombo && (!isEditing || (isEditing && !appointment?.comboId)) && (
                <FormField
                  control={form.control}
                  name="finalPrice"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Preço</FormLabel>
                      <FormControl>
                        <NumericFormat
                          customInput={Input}
                          prefix="R$"
                          placeholder="R$ 0,00"
                          thousandSeparator="."
                          decimalSeparator=","
                          decimalScale={2}
                          allowNegative={false}
                          value={value}
                          onValueChange={(values) => {
                            onChange(values.floatValue);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
            </div>

            <div className="flex flex-col justify-end w-full gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <>Salvando...</> : <>{isEditing ? "Atualizar" : "Salvar"}</>}
              </Button>
            </div>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
}
