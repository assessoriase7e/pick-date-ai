"use server";
import { getCollaboratorById } from "@/actions/collaborators/get-collaborator-by-id";
import { getAppointmentsByCollaborator } from "@/actions/appointments/get-by-collaborator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollaboratorServicesTable } from "@/components/collaborators/collaborator-services-table";

interface CollaboratorServicesPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function CollaboratorServicesPage({ params, searchParams }: CollaboratorServicesPageProps) {
  const { id } = await params;
  const { page: sPage } = await searchParams;
  const page = Number(sPage) || 1;

  const [collaboratorResult, appointmentsResult] = await Promise.all([
    getCollaboratorById(Number(id)),
    getAppointmentsByCollaborator(Number(id), page, 10),
  ]);

  if (!collaboratorResult.success || !collaboratorResult.data) {
    return notFound();
  }

  const collaborator = collaboratorResult.data;
  const appointments = appointmentsResult.success ? appointmentsResult.data : [];
  const pagination = appointmentsResult.success ? appointmentsResult.pagination : { totalPages: 0, currentPage: 1 };

  return (
    <div className="space-y-4 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/collaborators">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Histórico de Serviços - {collaborator.name}</h1>
        </div>
      </div>

      <CollaboratorServicesTable appointments={appointments} pagination={pagination} />
    </div>
  );
}
