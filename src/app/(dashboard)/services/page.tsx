"use server";
import { getServices } from "@/actions/services/get-services";
import { ServicesSection } from "@/components/services/services-section";
import { getCollaborators } from "@/actions/collaborators/get-collaborators";

interface ServicesPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  const { page } = await searchParams;
  const pageParam = Number(page) || 1;

  const [servicesResult, collaboratorsResult] = await Promise.all([
    getServices(pageParam),
    getCollaborators(1, 100),
  ]);

  // Ensure pagination is never undefined
  const pagination =
    servicesResult.success && servicesResult.pagination
      ? servicesResult.pagination
      : { totalPages: 1, currentPage: 1 };

  return (
    <div className="container">
      <div>
        <h1 className="text-3xl font-bold">Serviços</h1>
        <p className="text-muted-foreground">
          Gerencie os links cadastrados no sistema.
        </p>
      </div>

      <div className="space-y-8">
        <ServicesSection
          services={servicesResult.data || []}
          collaborators={collaboratorsResult.data || []}
          pagination={pagination}
        />
      </div>
    </div>
  );
}
