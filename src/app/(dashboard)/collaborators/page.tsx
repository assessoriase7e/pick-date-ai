"use server";
import { getCollaborators } from "@/actions/collaborators/get-collaborators";
import { CollaboratorsSection } from "@/components/collaborators/collaborators-section";
import { getServices } from "@/actions/services/get-services";

interface CollaboratorsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    service?: string;
    sortField?: string;
    sortDirection?: string;
  }>;
}

export default async function CollaboratorsPage({
  searchParams,
}: CollaboratorsPageProps) {
  const { page, search, service, sortField, sortDirection } =
    await searchParams;
  const pageParam = Number(page) || 1;

  const where: any = {};

  if (search) {
    where.name = search;
  }

  const sort = sortField
    ? {
        field: sortField,
        direction: (sortDirection === "desc" ? "desc" : "asc") as
          | "desc"
          | "asc",
      }
    : undefined;

  const [collabsResult, servicesResult] = await Promise.all([
    getCollaborators({
      page: pageParam,
      limit: 10,
      where,
      sort,
      serviceId: service && service !== "all" ? service : undefined,
    }),
    getServices({
      limit: 100,
    }),
  ]);

  const pagination = collabsResult.success
    ? {
        totalPages: collabsResult.pagination?.totalPages ?? 1,
        currentPage: collabsResult.pagination?.currentPage ?? 1,
      }
    : { totalPages: 1, currentPage: 1 };

  const services = servicesResult.success ? servicesResult.data : [];

  return (
    <div className="container">
      <div>
        <h1 className="text-3xl font-bold">Profissionales</h1>
        <p className="text-muted-foreground">
          Gerencie os profissionales cadastrados no sistema.
        </p>
      </div>

      <div className="space-y-8 mt-6">
        <CollaboratorsSection
          collaborators={collabsResult.success ? collabsResult.data : []}
          services={services}
          pagination={pagination}
          initialFilters={{
            searchTerm: search || "",
            serviceFilter: service || "all",
            sortField: (sortField as any) || "name",
            sortDirection: (sortDirection as any) || "asc",
          }}
        />
      </div>
    </div>
  );
}
