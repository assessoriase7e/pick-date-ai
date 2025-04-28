import { getClients } from "@/actions/clients/get-clients";
import ClientsTable from "./components/clients-table";

export default async function ClientsPage() {
  const { success, data, error } = await getClients();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold">Clientes</h1>
      <p>Gerencie seus clientes</p>

      {!success ? (
        <div className="p-4 bg-red-50 text-red-500 rounded-md">
          Erro ao carregar clientes: {error}
        </div>
      ) : (
        <ClientsTable clients={data?.clients || []} />
      )}
    </div>
  );
}
