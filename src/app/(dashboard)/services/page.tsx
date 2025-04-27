"use server";
import { getServices } from "@/actions/services/get-services";
import { getClerkUser } from "@/actions/auth/getClerkUser";
import { ServicesSection } from "@/components/services/services-section";

export default async function ServicesPage() {
  const user = await getClerkUser();
  const { data: services, error } = await getServices();

  return (
    <div className="container py-10 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Serviços</h1>

      <div className="space-y-8">
        <ServicesSection services={services || []} user={user} />
      </div>
    </div>
  );
}
