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
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SchedulingScriptFieldArrayProps {
  control: Control<any>;
  name: string;
}

function SortableItem({
  id,
  index,
  children,
}: {
  id: string;
  index: number;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      {children}
    </div>
  );
}

export function SchedulingScriptFieldArray({
  control,
  name,
}: SchedulingScriptFieldArrayProps) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);

      move(oldIndex, newIndex);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <FormLabel>Script de Agendamento</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ step: "" })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-sm text-muted-foreground py-4 text-center border rounded-md">
          Nenhum passo adicionado. Clique em "Adicionar" para começar.
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.map((field) => field.id)}
          strategy={verticalListSortingStrategy}
        >
          {fields.map((field, index) => (
            <SortableItem key={field.id} id={field.id} index={index}>
              <div className="flex-1 flex items-center gap-2 py-2">
                <div className="w-8 h-8 rounded-full bg-primary/50 flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder={`Passo ${index + 1}`}
                        {...control.register(`${name}.${index}.step`)}
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
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
