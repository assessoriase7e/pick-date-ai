"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryModal } from "./category-modal";
import { CategoriesTable } from "./categories-table";
import { Category } from "@prisma/client";

interface CategoriesSectionProps {
  categories: Category[];
  pagination: {
    totalPages: number;
    currentPage: number;
  };
}

export function CategoriesSection({
  categories,
  pagination,
}: CategoriesSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">
            Gerencie as categorias dos seus serviços
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      <CategoriesTable
        categories={categories}
        pagination={pagination}
        onEdit={handleEdit}
      />

      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={editingCategory}
      />
    </div>
  );
}
