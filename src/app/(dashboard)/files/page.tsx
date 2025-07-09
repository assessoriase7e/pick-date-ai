import { listFiles } from "@/actions/files/getMany";
import { searchClients } from "@/actions/clients/search-clients";
import { FilesPageContent } from "@/components/files/files-page-content";

export const dynamic = "force-dynamic";

interface FilesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sort?: string;
    dir?: string;
  }>;
}

export default async function FilesPage({ searchParams }: FilesPageProps) {
  const sParams = await searchParams;
  const page = Number(sParams.page) || 1;
  const search = sParams.search;
  const sortField = sParams.sort || "createdAt";
  const sortDirection = (sParams.dir || "desc") as "asc" | "desc";

  // Buscar arquivos no servidor
  const filesResult = await listFiles(page, 10, search, sortField, sortDirection);
  const files = filesResult.success ? filesResult.data.files : [];
  const totalPages = filesResult.success ? filesResult.data.totalPages : 1;
  const currentPage = filesResult.success ? filesResult.data.currentPage : 1;

  console.log(search);

  // Buscar clientes iniciais para o modal de envio
  const clientsResult = await searchClients("", 1, 50);
  const initialClients = clientsResult.clients || [];

  return (
    <div className="space-y-4">
      <FilesPageContent
        files={files}
        totalPages={totalPages}
        currentPage={currentPage}
        initialClients={initialClients}
      />
    </div>
  );
}
