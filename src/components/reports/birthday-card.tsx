"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Gift } from "lucide-react";
import { useState } from "react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BirthdayClient {
  id: number;
  fullName: string;
  birthDate: string;
}

interface BirthdayCardProps {
  birthdayClients: BirthdayClient[];
}

export function BirthdayCard({ birthdayClients }: BirthdayCardProps) {
  const [open, setOpen] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aniversariantes do Mês</CardTitle>
          <Gift className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="relative">
          <div className="text-2xl font-bold text-primary">{birthdayClients.length}</div>
          <Button variant="ghost" size="icon" className="absolute bottom-5 right-3" onClick={() => setOpen(true)}>
            <FileText className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <ConfirmationDialog open={open} onOpenChange={setOpen} title="Aniversariantes do Mês" showFooter={false}>
        <ScrollArea className="h-[300px] md:h-[50vh] pr-4">
          {birthdayClients.map((client) => (
            <div key={client.id} className="flex justify-between items-center py-2 border-b">
              <span>{client.fullName}</span>
              <span className="text-muted-foreground">{formatDate(client.birthDate)}</span>
            </div>
          ))}
        </ScrollArea>
      </ConfirmationDialog>
    </>
  );
}
