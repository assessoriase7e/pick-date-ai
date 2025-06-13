import { Suspense } from "react";
import { getAIUsageStats } from "@/actions/ai-usage/get-ai-usage-stats";
import { getAIUsageHistory } from "@/actions/ai-usage/get-ai-usage-history";
import { AIUsageStats } from "@/components/ai-usage/ai-usage-stats";
import { AIUsageHistory } from "@/components/ai-usage/ai-usage-history";
import { LoaderCircle } from "lucide-react";

type AIUsageSearchParamsProps = {
  page?: string;
  search?: string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  [key: string]: string | string[] | undefined;
};

export default async function AIUsagePage({
  searchParams,
}: {
  searchParams: Promise<AIUsageSearchParamsProps>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const sortField = params.sortField;
  const sortDirection = params.sortDirection;

  const [statsResult, historyResult] = await Promise.all([
    getAIUsageStats(),
    getAIUsageHistory({
      page,
      search,
      sort: sortField ? { field: sortField, direction: sortDirection } : undefined,
    }),
  ]);

  const stats = statsResult.success ? statsResult.data : { uniqueAttendances: 0, totalAttendances: 0 };
  const history = historyResult.success ? historyResult.data : [];
  const pagination = historyResult.success ? historyResult.pagination : { totalPages: 1, currentPage: 1 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Uso da IA</h1>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <LoaderCircle className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <AIUsageStats stats={stats} />
      </Suspense>

      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <LoaderCircle className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <AIUsageHistory 
          history={history} 
          pagination={pagination}
          currentSearch={search}
          currentSortField={sortField}
          currentSortDirection={sortDirection}
        />
      </Suspense>
    </div>
  );
}