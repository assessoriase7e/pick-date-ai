"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { assignComboToClient } from "@/actions/combos/assign-combo-to-client";
import { ComboWithServices } from "@/types/combo";
import { Client } from "@prisma/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const assignComboSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente"),
});

type AssignComboFormData = z.infer<typeof assignComboSchema>;

interface AssignComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  combo: ComboWithServices | null;
  clients: Client[];
  onSuccess?: () => void;
}

export function AssignComboModal({ isOpen, onClose, combo, clients, onSuccess }: AssignComboModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AssignComboFormData>({
    resolver: zodResolver(assignComboSchema),
    defaultValues: {
      clientId: null,
    },
  });

  const onSubmit = async (data: AssignComboFormData) => {
    if (!combo) return;

    setIsLoading(true);
    try {
      const result = await assignComboToClient({
        comboId: combo.id,
        clientId: parseInt(data.clientId, 10),
      });

      if (result.success) {
        toast.success("Combo atribuído ao cliente com sucesso!");
        onSuccess && onSuccess();
        onClose();
        form.reset();
      } else {
        toast.error(result.error || "Erro ao atribuir combo");
      }
    } catch (error) {
      toast.error("Erro interno do servidor");
    } finally {
      setIsLoading(false);
    }
  };

  if (!combo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Atribuir Combo ao Cliente</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Combo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{combo.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {combo.description && <p className="text-sm text-muted-foreground">{combo.description}</p>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Preço Total:</p>
                  <p className="text-lg font-semibold">R$ {combo.totalPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Preço Final:</p>
                  <p className="text-lg font-semibold text-green-600">R$ {combo.finalPrice.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Serviços inclusos:</p>
                <div className="space-y-2">
                  {combo.comboServices.map((comboService) => (
                    <div key={comboService.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <span className="text-sm">{comboService.serviceName}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{comboService.quantity}x</Badge>
                        <span className="text-sm font-medium">R$ {comboService.servicePrice.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Desconto:</span>
                <Badge variant="secondary">
                  {combo.discountType === "percentage"
                    ? `${combo.discountValue}%`
                    : `R$ ${combo.discountValue.toFixed(2)}`}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Formulário de Atribuição */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.fullName} - {client.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Atribuindo..." : "Atribuir Combo"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
