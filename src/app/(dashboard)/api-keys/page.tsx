import { Suspense } from "react";
import { ApiKeysContent } from "./api-keys-content";
import { LoaderCircle } from "lucide-react";
import { ApiDocsAccordion } from "@/components/docs/AudioAccordion";
import { professionalRoutes } from "@/mocked/docs/professionals";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { audioRoutes } from "@/mocked/docs/audio";
import { imageRoutes } from "@/mocked/docs/images";

export default function ApiKeysPage() {
  return (
    <div className="container mx-auto py-10 space-y-6">
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
              <ApiDocsAccordion doc={professionalRoutes} />
              <Separator />
              <ApiDocsAccordion doc={audioRoutes} />
              <Separator />

              <ApiDocsAccordion doc={imageRoutes} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
