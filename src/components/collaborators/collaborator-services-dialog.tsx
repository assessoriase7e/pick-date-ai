"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Service } from "@prisma/client";

interface CollaboratorServicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: Service[];
}

export function CollaboratorServicesDialog({
  open,
  onOpenChange,
  services,
}: CollaboratorServicesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Serviços do Profissional</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="grid gap-4">
            {services.length === 0 ? (
              <div className="text-center text-muted-foreground">
                Nenhum serviço cadastrado.
              </div>
            ) : (
              services.map((service) => (
                <div
                  key={service.id}
                  className="p-4 rounded-lg border bg-card text-card-foreground"
                >
                  <h3 className="font-medium">{service.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {service.notes}
                  </p>
                  <p className="text-sm font-medium mt-2">
                    R$ {service.price.toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
