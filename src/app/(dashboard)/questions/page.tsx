import { getQuestionTexts } from "@/actions/question-texts/get";
import { QuestionTextsContent } from "@/components/question-texts/question-texts-content";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function QuestionTextsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const result = await getQuestionTexts();

  if (!result.success) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Textos de Perguntas</h1>
          <p className="text-muted-foreground">Gerencie seus textos de perguntas e respostas</p>
        </div>
        <div className="text-center py-6 text-red-500">Erro ao carregar textos: {result.error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Textos de Perguntas</h1>
        <p className="text-muted-foreground">Gerencie seus textos de perguntas e respostas</p>
      </div>

      <QuestionTextsContent questionTexts={result.data} totalPages={1} currentPage={1} userId={userId} />
    </div>
  );
}
