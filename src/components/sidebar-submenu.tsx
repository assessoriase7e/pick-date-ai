"use client";

import { useState } from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import { SidebarItem } from "./sidebarItem";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarSubmenuProps {
  icon: LucideIcon;
  label: string;
  items: {
    href: string;
    icon: LucideIcon;
    label: string;
    isActive: boolean;
  }[];
  isActive?: boolean;
  isMobile?: boolean;
}

export function SidebarSubmenu({
  icon: Icon,
  label,
  items,
  isActive = false,
  isMobile = false,
}: SidebarSubmenuProps) {
  const [isOpen, setIsOpen] = useState(isActive);

  if (isMobile) {
    return (
      <div className="w-full">
        <Button
          variant={isActive ? "default" : "ghost"}
          className="w-full justify-start hidden lg:block"
          disabled
        >
          <Icon className="h-5 w-5 mr-2" />
          <span>{label}</span>
        </Button>
        <div className="flex flex-col">
          {items.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={item.isActive}
              isMobile={true}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative group w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-10 h-10 hover:bg-primary hover:text-background relative",
                    {
                      "text-background bg-primary": isActive,
                    }
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{label}</span>
                </Button>
              </CollapsibleTrigger>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-background border border-border"
            >
              {label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-background border border-border rounded-md px-3 py-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-md whitespace-nowrap z-50">
          {label}
        </div>

        <CollapsibleContent className="mt-1 flex flex-col items-center transition-all duration-200 ease-in-out relative">
          <div className="flex flex-col space-y-1 w-full items-center relative">
            <div className="border border-primary h-full w-[102%] rounded-lg absolute top-1"></div>

            {items.map((item) => (
              <div key={item.href} className="relative group w-full">
                <SidebarItem
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={item.isActive}
                />
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-background border border-border rounded-md px-3 py-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-md whitespace-nowrap z-50">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
