"use server";

import { getCollaboratorById } from "@/actions/collaborators/get-collaborator-by-id";
import { getAppointmentsByCollaborator } from "@/actions/appointments/get-by-collaborator";
import { CollaboratorServicesTable } from "@/components/collaborators/collaborator-services-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface CollaboratorServicesPageProps {
  params: {
    id: string;
  };
  searchParams: {
    page?: string;
  };
}

export default async function CollaboratorServicesPage({
  params,
  searchParams,
}: CollaboratorServicesPageProps) {
  const { id } = params;
  const page = Number(searchParams.page) || 1;

  const [collaboratorResult, appointmentsResult] = await Promise.all([
    getCollaboratorById(id),
    getAppointmentsByCollaborator(id, page, 10),
  ]);

  if (!collaboratorResult.success || !collaboratorResult.data) {
    return notFound();
  }

  const collaborator = collaboratorResult.data;
  const appointments = appointmentsResult.success
    ? appointmentsResult.data
    : [];
  const pagination = appointmentsResult.success
    ? appointmentsResult.pagination
    : { totalPages: 0, currentPage: 1 };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/collaborators">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            Histórico de Serviços - {collaborator.name}
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Serviços Realizados</CardTitle>
        </CardHeader>
        <CardContent>
          <CollaboratorServicesTable
            data={appointments}
            pagination={pagination}
          />
        </CardContent>
      </Card>
    </div>
  );
}
