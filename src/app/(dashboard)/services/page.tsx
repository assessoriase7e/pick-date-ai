import { getServices } from "@/actions/services/get-services";
import { ServicesSection } from "@/components/services/services-section";
import { getCollaborators } from "@/actions/collaborators/get-collaborators";

interface ServicesPageProps {
  searchParams: {
    page?: string;
    search?: string;
    collaborator?: string;
    sortField?: string;
    sortDirection?: string;
    filterColumn?: string;
  };
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search;
  const sortField = searchParams.sortField || "name";
  const sortDirection = (searchParams.sortDirection || "asc") as "asc" | "desc";
  const collaboratorFilter = searchParams.collaborator || "all";
  const filterColumn = searchParams.filterColumn || "all";

  // Buscar serviços e colaboradores no servidor
  const [servicesResult, collaboratorsResult] = await Promise.all([
    getServices({
      page,
      limit: 10,
      sort: {
        field: sortField,
        direction: sortDirection,
      },
      collaboratorId: collaboratorFilter !== "all" ? Number(collaboratorFilter) : undefined,
      search,
      filterColumn,
    }),
    getCollaborators({
      page: 1,
      limit: 100,
    }),
  ]);

  const pagination =
    servicesResult.success && servicesResult.pagination ? servicesResult.pagination : { totalPages: 1, currentPage: 1 };

  const collaborators = collaboratorsResult.success ? collaboratorsResult.data : [];
  const services = servicesResult.success ? servicesResult.data : [];

  return (
    <div className="container mx-auto py-8 space-y-6">
      <ServicesSection
        services={services}
        collaborators={collaborators}
        pagination={{
          totalPages: pagination.totalPages,
          currentPage: pagination.currentPage,
        }}
        initialFilters={{
          searchTerm: search || "",
          collaboratorFilter,
          sortField: sortField as any,
          sortDirection,
        }}
      />
    </div>
  );
}
