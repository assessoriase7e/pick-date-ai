"use server";
import { getServices } from "@/actions/services/get-services";
import { ServicesSection } from "@/components/services/services-section";
import { getCollaborators } from "@/actions/collaborators/get-collaborators";

interface ServicesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    collaborator?: string;
    sortField?: string;
    sortDirection?: string;
  }>;
}

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  const { page, search, collaborator, sortField, sortDirection } =
    await searchParams;
  const pageParam = Number(page) || 1;

  const where: any = {};

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const sort = sortField
    ? {
        field: sortField,
        direction: (sortDirection === "desc" ? "desc" : "asc") as
          | "desc"
          | "asc",
      }
    : undefined;

  const [servicesResult, collaboratorsResult] = await Promise.all([
    getServices({
      page: pageParam,
      limit: 10,
      where,
      sort,
      collaboratorId:
        collaborator && collaborator !== "all" ? collaborator : undefined,
    }),
    getCollaborators(1, 100),
  ]);

  const pagination =
    servicesResult.success && servicesResult.pagination
      ? servicesResult.pagination
      : { totalPages: 1, currentPage: 1 };

  const collaborators = collaboratorsResult.success
    ? collaboratorsResult.data
    : [];
  const services = servicesResult.success ? servicesResult.data : [];

  return (
    <div className="container">
      <div>
        <h1 className="text-3xl font-bold">Serviços</h1>
        <p className="text-muted-foreground">
          Gerencie os serviços cadastrados no sistema.
        </p>
      </div>

      <div className="space-y-8">
        <ServicesSection
          services={services}
          collaborators={collaborators}
          pagination={pagination}
          initialFilters={{
            searchTerm: search || "",
            collaboratorFilter: collaborator || "all",
            sortField: (sortField as any) || "name",
            sortDirection: (sortDirection as any) || "asc",
          }}
        />
      </div>
    </div>
  );
}
