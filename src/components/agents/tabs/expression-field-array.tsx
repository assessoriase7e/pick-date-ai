"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFieldArray, Control } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

interface ExpressionFieldArrayProps {
  control: Control<any>;
  name: string;
}

export function ExpressionFieldArray({ control, name }: ExpressionFieldArrayProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <FormLabel>Interpretação de Expressões</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ expression: "", translation: "" })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-sm text-muted-foreground py-4 text-center border rounded-md">
          Nenhuma expressão adicionada. Clique em "Adicionar" para começar.
        </div>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2 items-start">
          <div className="flex-1 space-y-2">
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Expressão"
                  {...control.register(`${name}.${index}.expression`)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>
          <div className="flex-1 space-y-2">
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Tradução"
                  {...control.register(`${name}.${index}.translation`)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
            className="mt-1"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}