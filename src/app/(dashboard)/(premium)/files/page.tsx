import { listFiles } from "@/actions/files/getMany";
import { FilesContent } from "@/components/files/files-content";

export const dynamic = "force-dynamic";

interface FilesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function FilesPage({ searchParams }: FilesPageProps) {
  const sParams = await searchParams;
  const page = Number(sParams.page) || 1;
  const search = sParams.search;

  const filesResult = await listFiles(page, 10, search);
  const files = filesResult.success ? filesResult.data.files : [];
  const totalPages = filesResult.success ? filesResult.data.totalPages : 1;
  const currentPage = filesResult.success ? filesResult.data.currentPage : 1;

  return (
    <div className="space-y-4">
      <FilesContent
        data={files}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </div>
  );
}
