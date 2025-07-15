"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCombo } from "@/actions/combos/create-combo";
import { updateCombo } from "@/actions/combos/update-combo";
import { ComboFormValues, comboSchema } from "@/validators/combo";
import { Service } from "@prisma/client";
import { ComboWithServices } from "@/types/combo";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  combo?: ComboWithServices;
  onSuccess?: () => void;
}

export function ComboModal({ isOpen, onClose, services, combo, onSuccess }: ComboModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!combo;

  const form = useForm<ComboFormValues>({
    resolver: zodResolver(comboSchema),
    defaultValues: {
      name: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      isActive: true,
      services: [{ serviceId: 0, quantity: 1 }],
    },
  });

  useEffect(() => {
    if (combo) {
      form.reset({
        name: combo.name,
        description: combo.description ?? "",
        discountType: combo.discountType as "percentage" | "fixed",
        discountValue: combo.discountValue,
        isActive: combo.isActive,
        services: combo.comboServices.map((s) => ({
          serviceId: s.serviceId,
          quantity: s.quantity,
        })),
      });
    } else {
      form.reset({
        name: "",
        description: "",
        discountType: "percentage",
        discountValue: 0,
        isActive: true,
        services: [{ serviceId: null, quantity: 1 }],
      });
    }
  }, [combo, form]);

  const watchedServices = form.watch("services");

  const addService = () => {
    const currentServices = form.getValues("services");
    form.setValue("services", [...currentServices, { serviceId: null, quantity: 1 }]);
  };

  const removeService = (index: number) => {
    const currentServices = form.getValues("services");
    if (currentServices.length > 1) {
      form.setValue(
        "services",
        currentServices.filter((_, i) => i !== index)
      );
    }
  };

  const onSubmit = async (data: ComboFormValues) => {
    setIsLoading(true);
    try {
      const result = isEditing ? await updateCombo(combo.id, data) : await createCombo(data);

      if (result.success) {
        toast.success(isEditing ? "Combo atualizado com sucesso!" : "Combo criado com sucesso!");
        onSuccess && onSuccess();
        onClose();
      } else {
        toast.error(result.error || "Erro ao salvar combo");
      }
    } catch (error) {
      toast.error("Erro interno do servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Combo" : "Criar Novo Combo"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Nome do Combo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Pacote Relaxamento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Ativo</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva o combo..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Serviços</h3>
                <Button type="button" variant="outline" size="sm" onClick={addService}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Serviço
                </Button>
              </div>

              {watchedServices.map((_, index) => (
                <div key={index} className="flex gap-4">
                  <FormField
                    control={form.control}
                    name={`services.${index}.serviceId`}
                    render={({ field }) => (
                      <FormItem className="flex-1 w-full">
                        <FormLabel>Serviço</FormLabel>
                        <Select onValueChange={(val) => field.onChange(Number(val))} value={String(field.value)}>
                          <FormControl className="w-full">
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um serviço" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {services.map((service) => (
                              <SelectItem key={service.id} value={String(service.id)}>
                                {service.name} - R$ {service.price.toFixed(2)}
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
                    name={`services.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <FormLabel>Qtd</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedServices.length > 1 && (
                    <Button type="button" variant="outline" size="icon" onClick={() => removeService(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Desconto</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Porcentagem</SelectItem>
                        <SelectItem value="fixed">Valor Fixo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch("discountType") === "percentage" ? "Desconto (%)" : "Desconto (R$)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
