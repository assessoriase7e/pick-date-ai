'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeleteAccountDialog } from './delete-account-dialog';
import { AlertTriangle } from 'lucide-react';
import { CombinedProfileData } from '@/actions/profile/get';

interface AccountDeletionCardProps {
  combinedProfile: CombinedProfileData | null;
}

export function AccountDeletionCard({ combinedProfile }: AccountDeletionCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Exclusão de Conta
        </CardTitle>
        <CardDescription>
          Exclua permanentemente sua conta e todos os dados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium">Nome</p>
            <p className="text-sm text-muted-foreground">
              {combinedProfile?.profile?.companyName || "Não disponível"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{combinedProfile?.email || "Não disponível"}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg mt-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Atenção!</p>
                <p>Esta ação é irreversível. Todos os seus dados serão excluídos permanentemente.</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} className="w-full">
          Excluir conta
        </Button>
      </CardFooter>

      <DeleteAccountDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} />
    </Card>
  );
}