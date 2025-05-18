"use server";
import { getClients } from "@/actions/clients/get-clients";
import ClientsTable from "@/components/clients/clients-table";

interface ClientsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortField?: string;
    sortDirection?: string;
  }>;
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const { page, search, sortField, sortDirection } = await searchParams;
  const pageParam = Number(page) || 1;

  const where: any = {};

  if (search) {
    where.fullName = {
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

  const clientsResult = await getClients({
    page: pageParam,
    limit: 20,
    where,
    sort,
  });

  const pagination =
    clientsResult.success && clientsResult.pagination
      ? clientsResult.pagination
      : { totalPages: 1, currentPage: 1 };

  const clients = clientsResult.success ? clientsResult.data : [];

  return (
    <div className="container">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground">
          Gerencie os clientes cadastrados no sistema.
        </p>
      </div>

      <div className="space-y-8">
        <ClientsTable clients={clients} />
      </div>
    </div>
  );
}
