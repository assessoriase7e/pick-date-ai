"use server";
import { getServices } from "@/actions/services/get-services";
import { getClerkUser } from "@/actions/auth/getClerkUser";
import { ServicesSection } from "@/components/services/services-section";

interface ServicesPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  const user = await getClerkUser();
  const { page } = await searchParams;
  const pageParam = Number(page) || 1;
  const { data: services, pagination } = await getServices(pageParam);

  return (
    <div className="container py-10 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Serviços</h1>

      <div className="space-y-8">
        <ServicesSection
          services={services || []}
          user={user}
          pagination={pagination || { totalPages: 1, currentPage: 1 }}
        />
      </div>
    </div>
  );
}
