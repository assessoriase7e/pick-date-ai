import Link from "next/link";
import { Button } from "./ui/button";
import { LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  isMobile?: boolean;
}

export function SidebarItem({
  href,
  icon: Icon,
  label,
  isActive = false,
  isMobile = false,
}: SidebarItemProps) {
  if (isMobile) {
    return (
      <Link href={href}>
        <Button
          variant={isActive ? "default" : "ghost"}
          className="w-full justify-start"
        >
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </Button>
      </Link>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link href={href} className="relative group w-full">
            <Button
              variant="ghost"
              className={`w-10 h-10 hover:bg-primary hover:text-background ${
                isActive ? "text-background bg-primary" : ""
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="sr-only">{label}</span>
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-background border border-primary mb-4 h-10 flex items-center justify-center w-32"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
