import { getClient } from "@/actions/clients/get-client";
import ClientForm from "@/components/clients/client-form";
import { notFound } from "next/navigation";

interface EditClientPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;
  const { success, data } = await getClient(id);

  if (!success || !data?.client) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Editar Cliente</h1>
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <ClientForm initialData={data.client} />
      </div>
    </div>
  );
}
