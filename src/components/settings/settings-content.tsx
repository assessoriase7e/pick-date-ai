"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { CombinedProfileData } from "@/actions/profile/get";

interface SettingsContentProps {
  combinedProfile: CombinedProfileData | null;
}

export function SettingsContent({ combinedProfile }: SettingsContentProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Conta</CardTitle>
          <CardDescription>
            Gerencie as configurações da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium">Nome</p>
              <p className="text-sm text-muted-foreground">
                {combinedProfile.profile.companyName || "Não disponível"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                {combinedProfile.email || "Não disponível"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">ID</p>
              <p className="text-sm text-muted-foreground">
                {combinedProfile?.id}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="w-full"
          >
            Excluir conta
          </Button>
        </CardFooter>
      </Card>

      <DeleteAccountDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </div>
  );
}
