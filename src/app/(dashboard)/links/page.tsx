import { Suspense } from "react";
import { LinksContent } from "@/components/links/links-content";
import { LoaderCircle } from "lucide-react";
import { listLinks } from "@/actions/links/getMany";
import { currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

interface LinksPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function LinksPage({ searchParams }: LinksPageProps) {
  const { page: sPage, search } = await searchParams;
  const page = Number(sPage) || 1;

  const result = await listLinks(page, 20, search);
  const links = result.success ? result.data!.links : [];
  const totalPages = result.success ? result.data!.totalPages : 1;
  const { id: userId } = await currentUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Links</h1>
        <p className="text-muted-foreground">
          Gerencie os links cadastrados no sistema.
        </p>
      </div>
      <Suspense fallback={<LoaderCircle className="animate-spin" />}>
        <LinksContent
          links={links}
          totalPages={totalPages}
          currentPage={page}
          userId={userId!}
        />
      </Suspense>
    </div>
  );
}
