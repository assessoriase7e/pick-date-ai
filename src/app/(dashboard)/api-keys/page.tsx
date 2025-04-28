import { Suspense } from "react";
import { ApiKeysContent } from "./api-keys-content";
import { LoaderCircle } from "lucide-react";
import { ApiDocsAccordion } from "@/components/docs/ApiDocsAccordion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { audioRoutes } from "@/mocked/docs/audio";
import { usersRoutes } from "@/mocked/docs/users";
import { documentsRoutes } from "@/mocked/docs/documents";
import { imagesRoutes } from "@/mocked/docs/images";
import { linksRoutes } from "@/mocked/docs/links";
import { getByIdsRoutes } from "@/mocked/docs/get-by-ids";
import { getByUserRoutes } from "@/mocked/docs/get-by-user";
import { attendantPromptsRoutes } from "@/mocked/docs/attendant-prompts";

export default function ApiKeysPage() {
  return (
    <div className="container mx-auto space-y-6">
      <Suspense fallback={<LoaderCircle className="animate-spin" />}>
        <ApiKeysContent />
      </Suspense>

      <div className="space-y-10">
        <Accordion type="multiple">
          <AccordionItem value="docs">
            <AccordionTrigger>
              <h3 className="text-xl font-semibold">Documentação</h3>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-8">
                <ApiDocsAccordion doc={audioRoutes} />
                <ApiDocsAccordion doc={usersRoutes} />
                <ApiDocsAccordion doc={documentsRoutes} />
                <ApiDocsAccordion doc={imagesRoutes} />
                <ApiDocsAccordion doc={linksRoutes} />
                <ApiDocsAccordion doc={attendantPromptsRoutes} />
                <ApiDocsAccordion doc={getByIdsRoutes} />
                <ApiDocsAccordion doc={getByUserRoutes} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
