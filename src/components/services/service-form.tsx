"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { serviceSchema, ServiceFormValues } from "@/validators/service";
import { createService } from "@/actions/services/create-service";
import { updateService } from "@/actions/services/update-service";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Collaborator } from "@prisma/client";

interface ServiceFormProps {
  initialData?: any;
  onSuccess: () => void;
  collaborators: any[];
}

const daysOfWeek = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

export function ServiceForm({
  initialData,
  onSuccess,
  collaborators,
}: ServiceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCollaborators, setSelectedCollaborators] = useState<
    Collaborator[]
  >(initialData?.serviceCollaborators?.map((sc: any) => sc.collaborator) || []);
  const [selectedCollaboratorId, setSelectedCollaboratorId] =
    useState<string>("none");
  const isEditing = !!initialData;

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: initialData?.name || "",
      price: initialData?.price || null,
      availableDays: initialData?.availableDays || [],
      notes: initialData?.notes || "",
      collaboratorIds:
        initialData?.serviceCollaborators?.map(
          (sc: any) => sc.collaboratorId
        ) || [],
      durationMinutes: initialData?.durationMinutes || 30,
      commission: initialData?.commission,
      isActive:
        initialData?.isActive !== undefined ? initialData.isActive : true,
    },
  });

  const handleAddCollaborator = () => {
    if (selectedCollaboratorId === "none") return;

    const collaborator = collaborators.find(
      (c) => c.id === selectedCollaboratorId
    );
    if (!collaborator) return;

    if (selectedCollaborators.some((c) => c.id === collaborator.id)) {
      toast.error("Este profissional já foi adicionado");
      return;
    }

    setSelectedCollaborators((prev) => [...prev, collaborator]);

    const currentIds = form.getValues("collaboratorIds") || [];
    form.setValue("collaboratorIds", [...currentIds, collaborator.id]);

    setSelectedCollaboratorId("none");
  };

  const handleRemoveCollaborator = (id: string) => {
    setSelectedCollaborators((prev) => prev.filter((c) => c.id !== id));

    const currentIds = form.getValues("collaboratorIds") || [];
    form.setValue(
      "collaboratorIds",
      currentIds.filter((cId: string) => cId !== id)
    );
  };

  const onSubmit = async (values: ServiceFormValues) => {
    setIsLoading(true);

    const submissionValues = {
      ...values,
      notes: values.notes || null,
      collaboratorIds: values.collaboratorIds || [],
      commission: values.commission || null,
    };

    try {
      const result = isEditing
        ? await updateService(initialData.id, submissionValues)
        : await createService(submissionValues);

      if (result.success) {
        toast.success(
          `Serviço ${isEditing ? "atualizado" : "criado"} com sucesso`
        );
        onSuccess();
      } else {
        toast.error(
          result.error || `Erro ao ${isEditing ? "atualizar" : "criar"} serviço`
        );
      }
    } catch {
      toast.error("Ocorreu um erro ao processar a solicitação");
    } finally {
      setIsLoading(false);
    }
  };

  const availableCollaborators = collaborators || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do serviço" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
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

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Status do Serviço</FormLabel>
                <FormDescription>
                  Defina se este serviço está ativo ou inativo
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="availableDays"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Dias Disponíveis</FormLabel>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {daysOfWeek.map((day) => (
                  <FormField
                    key={day}
                    control={form.control}
                    name="availableDays"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={day}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(day)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, day])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== day
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{day}</FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Profissionais */}
        <div className="border rounded-md p-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold">Profissionais</h4>
            <div className="text-xs bg-muted px-2 py-1 rounded-full">
              {selectedCollaborators.length} selecionados
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Select
                value={selectedCollaboratorId}
                onValueChange={setSelectedCollaboratorId}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione um profissional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione...</SelectItem>
                  {availableCollaborators.length > 0 ? (
                    availableCollaborators
                      .filter(
                        (c) =>
                          !selectedCollaborators.some((sc) => sc.id === c.id)
                      )
                      .map((collaborator) => (
                        <SelectItem
                          key={collaborator.id}
                          value={collaborator.id}
                        >
                          {collaborator.name}
                        </SelectItem>
                      ))
                  ) : (
                    <SelectItem value="no-options" disabled>
                      Nenhum profissional disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={handleAddCollaborator}
                disabled={selectedCollaboratorId === "none"}
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              <AnimatePresence>
                {selectedCollaborators.map((collaborator) => (
                  <motion.div
                    key={collaborator.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between p-2 border rounded-md"
                  >
                    <div>
                      <p className="font-medium">{collaborator.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {collaborator.profession}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCollaborator(collaborator.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {selectedCollaborators.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Nenhum profissional adicionado
                </p>
              )}
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="durationMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duração (minutos)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="Duração em minutos"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="commission"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comissão (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Comissão em porcentagem"
                  {...field}
                  value={field.value || 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Porcentagem de comissão para o profissional
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações sobre o serviço"
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Processando..." : isEditing ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
