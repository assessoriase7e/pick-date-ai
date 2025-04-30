import { getClient } from "@/actions/clients/get-client";
import { getClientServices } from "@/actions/clients/services/get-client-services";
import { getServices } from "@/actions/services/get-services";
import ClientServicesTable from "@/components/clients/client-services-table";
import { notFound } from "next/navigation";

interface ClientServicesPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function ClientServicesPage({
  params,
  searchParams,
}: ClientServicesPageProps) {
  const { id } = await params;
  const sParams = await searchParams;
  const page = sParams.page ? parseInt(sParams.page) : 1;

  const [clientResult, clientServicesResult, servicesResult] =
    await Promise.all([
      getClient(id),
      getClientServices(id, page),
      getServices(),
    ]);

  if (!clientResult.success || !clientResult.data?.client) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-2">
        Serviços do Cliente: {clientResult.data.client.fullName}
      </h1>

      {!clientServicesResult.success ? (
        <div className="p-4 bg-red-50 text-red-500 rounded-md">
          Erro ao carregar serviços: {clientServicesResult.error}
        </div>
      ) : (
        <ClientServicesTable
          clientId={id}
          clientServices={clientServicesResult.data?.clientServices || []}
          pagination={
            clientServicesResult.data?.pagination || {
              total: 0,
              pages: 1,
              currentPage: 1,
            }
          }
          services={servicesResult.success ? servicesResult.data || [] : []}
        />
      )}
    </div>
  );
}
