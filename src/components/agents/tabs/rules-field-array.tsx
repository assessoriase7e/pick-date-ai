"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFieldArray, Control } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

interface RulesFieldArrayProps {
  control: Control<any>;
  name: string;
}

export function RulesFieldArray({ control, name }: RulesFieldArrayProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <FormLabel>Regras Personalizadas</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ rule: "" })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-sm text-muted-foreground py-4 text-center border rounded-md">
          Nenhuma regra personalizada adicionada. Clique em "Adicionar" para
          começar.
        </div>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary/50 flex items-center justify-center text-sm font-medium" />
          <div className="flex-1">
            <FormItem>
              <FormControl>
                <Input
                  placeholder={`Regra ${index + 1}`}
                  {...control.register(`${name}.${index}.rule`)}
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
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
