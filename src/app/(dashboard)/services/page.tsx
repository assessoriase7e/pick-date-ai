"use server";
import { getServices } from "@/actions/services/get-services";
import { getCategories } from "@/actions/categories/get-categories";
import { ServicesSection } from "@/components/services/services-section";
import { getCollaborators } from "@/actions/collaborators/get-collaborators";

interface ServicesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    collaborator?: string;
    category?: string; // Novo filtro
    sortField?: string;
    sortDirection?: string;
  }>;
}

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  const { page, search, collaborator, category, sortField, sortDirection } =
    await searchParams;
  const pageParam = Number(page) || 1;

  const where: any = {};

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (category && category !== "all") {
    where.categoryId = Number(category);
  }

  const sort = sortField
    ? {
        field: sortField,
        direction: (sortDirection === "desc" ? "desc" : "asc") as
          | "desc"
          | "asc",
      }
    : undefined;

  const [servicesResult, collaboratorsResult, categoriesResult] =
    await Promise.all([
      getServices({
        page: pageParam,
        limit: 20,
        where,
        sort,
        collaboratorId:
          collaborator && collaborator !== null
            ? Number(collaborator)
            : undefined,
      }),
      getCollaborators({ page: 1, limit: 1000 }),
      getCategories({ page: 1, limit: 1000 }),
    ]);

  if (!servicesResult.success) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-red-500">
          Erro ao carregar serviços: {(servicesResult as { success: false; error: string }).error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <ServicesSection
        services={servicesResult.data}
        pagination={servicesResult.pagination}
        collaborators={
          collaboratorsResult.success ? collaboratorsResult.data : []
        }
        categories={categoriesResult.success ? categoriesResult.data : []} // Nova propriedade
      />
    </div>
  );
}
