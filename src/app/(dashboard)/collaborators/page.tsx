"use server";
import { getCollaborators } from "@/actions/collaborators/get-collaborators";
import { CollaboratorsSection } from "@/components/collaborators/collaborators-section";

interface CollaboratorsPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function CollaboratorsPage({
  searchParams,
}: CollaboratorsPageProps) {
  const { page } = await searchParams;
  const pageParam = Number(page) || 1;

  const collabs = await getCollaborators(pageParam);

  // Ensure pagination is never undefined
  const pagination = collabs.success
    ? {
        totalPages: collabs.pagination?.totalPages ?? 1,
        currentPage: collabs.pagination?.currentPage ?? 1,
      }
    : { totalPages: 1, currentPage: 1 };

  return (
    <div className="container">
      <div>
        <h1 className="text-3xl font-bold">Colaboradores</h1>
        <p className="text-muted-foreground">
          Gerencie os colaboradores cadastrados no sistema.
        </p>
      </div>

      <div className="space-y-8 mt-6">
        <CollaboratorsSection
          collaborators={collabs.success ? collabs.data : []}
          pagination={pagination}
        />
      </div>
    </div>
  );
}
