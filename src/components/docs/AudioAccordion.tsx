"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Param = {
  name: string;
  type: string;
  optional?: boolean;
  description?: string;
};

type Response = {
  code: number;
  description: string;
};

type RouteDoc = {
  method: string;
  path: string;
  description: string;
  query?: Param[];
  body?: Param[];
  headers?: Param[];
  responses: Response[];
};

type ApiDocData = {
  title: string;
  routes: RouteDoc[];
};

export const ApiDocsAccordion = ({ doc }: { doc: ApiDocData }) => {
  return (
    <div>
      <p className="text-lg font-semibold">{doc.title}</p>
      <Accordion type="multiple" className="w-full">
        {doc.routes.map((route, index) => (
          <AccordionItem key={index} value={`${route.method}-${route.path}`}>
            <AccordionTrigger>
              <span className="text-primary">
                {route.method.toUpperCase()}{" "}
                <span className="text-foreground font-light">{route.path}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm mb-2">{route.description}</p>

              {route.query && (
                <>
                  <p className="font-semibold">Query Params:</p>
                  <ul className="list-disc pl-5 mb-2 text-sm">
                    {route.query.map((param, i) => (
                      <li key={i}>
                        <strong>{param.name}</strong>: {param.type}
                        {param.optional ? " (opcional)" : ""} –{" "}
                        {param.description}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {route.body && (
                <>
                  <p className="font-semibold">Body:</p>
                  <ul className="list-disc pl-5 mb-2 text-sm">
                    {route.body.map((param, i) => (
                      <li key={i}>
                        <strong>{param.name}</strong>: {param.type}
                        {param.optional ? " (opcional)" : ""}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {route.headers && (
                <>
                  <p className="font-semibold">Headers:</p>
                  <ul className="list-disc pl-5 mb-2 text-sm">
                    {route.headers.map((param, i) => (
                      <li key={i}>
                        <strong>{param.name}</strong>: {param.type} –{" "}
                        {param.description}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <p className="font-semibold">Respostas:</p>
              <ul className="list-disc pl-5 text-sm">
                {route.responses.map((res, i) => (
                  <li key={i}>
                    <strong>{res.code}</strong>: {res.description}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
