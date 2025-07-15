import { Suspense } from "react";
import { CombosContent } from "@/components/combos/combos-content";
import { getCombos } from "@/actions/combos/get-combos";
import { getServices } from "@/actions/services/get-services";
import { getClients } from "@/actions/clients/get-clients";

export default async function CombosPage() {
  const [combos, servicesResponse, clientsResponse] = await Promise.all([getCombos(), getServices({}), getClients({})]);

  // Extrair os dados das respostas
  const services = servicesResponse.success ? servicesResponse.data : [];
  const clients = clientsResponse.success ? clientsResponse.data : [];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Pacotes de Serviços</h2>
      </div>
      <Suspense fallback={<div>Carregando...</div>}>
        <CombosContent combos={combos} services={services} clients={clients} />
      </Suspense>
    </div>
  );
}
