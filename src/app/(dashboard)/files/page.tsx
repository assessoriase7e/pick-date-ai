import { listFiles } from "@/actions/files/getMany";
import { FilesContent } from "@/components/files/files-content";
import { columns } from "@/components/files/columns";

export const dynamic = "force-dynamic";

interface FilesPageProps {
  searchParams: {
    page?: string;
    search?: string;
  };
}

export default async function FilesPage({ searchParams }: FilesPageProps) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search;

  const filesResult = await listFiles(page, 10, search);
  const files = filesResult.success ? filesResult.data.files : [];
  const totalPages = filesResult.success ? filesResult.data.totalPages : 1;
  const currentPage = filesResult.success ? filesResult.data.currentPage : 1;

  return (
    <div className="space-y-4">
      <FilesContent 
        columns={columns} 
        data={files} 
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </div>
  );
}
