"use server";

import { listFiles } from "@/actions/files/getMany";
import { FilesContent } from "@/components/files/files-content";
import { columns } from "@/components/files/columns";

export default async function FilesPage() {
  const filesResult = await listFiles();
  const files = filesResult.success ? filesResult.data.files : [];

  return (
    <div className="space-y-4">
      <FilesContent columns={columns} data={files} />
    </div>
  );
}
