import { getClients } from "@/actions/clients/get-clients";
import ClientsTable from "@/components/clients/clients-table";

export default async function ClientsPage() {
  const { success, data, error } = await getClients();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground">
          Gerencie os cleintes cadastrados no sistema.
        </p>
        <ClientsTable clients={data?.clients || []} />
      </div>
    </div>
  );
}
