import { getCategories } from "@/actions/categories/get-categories";
import { CategoriesSection } from "@/components/categories/categories-section";

interface CategoriesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  const { page, search } = await searchParams;
  const pageParam = Number(page) || 1;

  const where: any = {};

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const categoriesResult = await getCategories({
    page: pageParam,
    limit: 20,
    where,
  });

  if (!categoriesResult.success) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-red-500">
          Erro ao carregar categorias:{" "}
          {(categoriesResult as { success: false; error: string }).error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <CategoriesSection
        categories={categoriesResult.data}
        pagination={categoriesResult.pagination}
      />
    </div>
  );
}
