"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

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

const getMethodColor = (method: string) => {
  switch (method.toUpperCase()) {
    case "GET":
      return "bg-blue-500";
    case "POST":
      return "bg-green-500";
    case "PUT":
      return "bg-yellow-500";
    case "PATCH":
      return "bg-orange-500";
    case "DELETE":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

export const ApiDocsAccordion = ({ doc }: { doc: ApiDocData }) => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [openSection, setOpenSection] = useState<boolean>(false);

  const toggleItem = (itemId: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const toggleSection = () => {
    setOpenSection((prev) => !prev);
  };

  return (
    <div className="space-y-6">
      <Collapsible
        open={openSection}
        onOpenChange={toggleSection}
        className="w-full border rounded-lg p-4"
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <h3 className="text-lg font-semibold">{doc.title}</h3>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${
              openSection ? "transform rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="grid grid-cols-1 gap-4">
            {doc.routes.map((route, index) => {
              const itemId = `${route.method}-${route.path}-${index}`;
              return (
                <Card key={index} className="overflow-hidden">
                  <Collapsible
                    open={openItems[itemId]}
                    onOpenChange={() => toggleItem(itemId)}
                    className="w-full"
                  >
                    <CardHeader>
                      <CollapsibleTrigger className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${getMethodColor(route.method)} text-white`}
                          >
                            {route.method.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium">{route.path}</span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            openItems[itemId] ? "transform rotate-180" : ""
                          }`}
                        />
                      </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="pt-2">
                        <p className="text-sm mb-4 text-muted-foreground">
                          {route.description}
                        </p>

                        {route.query && route.query.length > 0 && (
                          <div className="mb-4">
                            <p className="font-semibold text-xs mb-1">
                              Query Params:
                            </p>
                            <ul className="list-disc pl-5 text-xs">
                              {route.query.map((param, i) => (
                                <li key={i}>
                                  <strong>{param.name}</strong>: {param.type}
                                  {param.optional ? " (opcional)" : ""} –{" "}
                                  {param.description}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {route.body && route.body.length > 0 && (
                          <div className="mb-4">
                            <p className="font-semibold text-xs mb-1">Body:</p>
                            <ul className="list-disc pl-5 text-xs">
                              {route.body.map((param, i) => (
                                <li key={i}>
                                  <strong>{param.name}</strong>: {param.type}
                                  {param.optional ? " (opcional)" : ""}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {route.headers && route.headers.length > 0 && (
                          <div className="mb-4">
                            <p className="font-semibold text-xs mb-1">Headers:</p>
                            <ul className="list-disc pl-5 text-xs">
                              {route.headers.map((param, i) => (
                                <li key={i}>
                                  <strong>{param.name}</strong>: {param.type} –{" "}
                                  {param.description}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-xs mb-1">Respostas:</p>
                          <ul className="list-disc pl-5 text-xs">
                            {route.responses.map((res, i) => (
                              <li key={i}>
                                <strong>{res.code}</strong>: {res.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
