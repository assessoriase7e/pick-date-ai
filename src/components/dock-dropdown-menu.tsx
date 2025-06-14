import Link from "next/link";
import { LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface DropdownMenuItem {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  color?: string;
}

export interface DockDropdownMenuProps {
  /** Ícone do trigger do dropdown */
  triggerIcon: LucideIcon;
  /** Texto do tooltip do trigger */
  triggerTooltip: string;
  /** Lista de itens do menu */
  items: DropdownMenuItem[];
  /** Título opcional do grupo de itens */
  groupLabel?: string;
  /** Posição do dropdown */
  side?: "top" | "bottom" | "left" | "right";
  /** Alinhamento do dropdown */
  align?: "start" | "center" | "end";
  /** Classes CSS adicionais para o trigger */
  triggerClassName?: string;
  /** Classes CSS adicionais para o conteúdo */
  contentClassName?: string;
  /** Se deve mostrar separador após o label */
  showSeparator?: boolean;
}

export function DockDropdownMenu({
  triggerIcon: TriggerIcon,
  triggerTooltip,
  items,
  groupLabel,
  side = "top",
  align = "center",
  triggerClassName,
  contentClassName,
  showSeparator = true,
}: DockDropdownMenuProps) {
  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button className={cn("flex items-center justify-center transition-colors", triggerClassName)}>
                <TriggerIcon className="h-6 w-6" />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side={side} className="bg-background border border-border">
            {triggerTooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent
        side={side}
        align={align}
        className={cn("min-w-[200px]", side === "top" && "mb-2", contentClassName)}
      >
        {groupLabel && (
          <>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {groupLabel}
            </DropdownMenuLabel>
            {showSeparator && <DropdownMenuSeparator />}
          </>
        )}

        {items.map((item) => {
          const ItemIcon = item.icon;
          return (
            <DropdownMenuItem key={item.href} asChild>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 cursor-pointer transition-colors",
                  item.isActive && "bg-accent text-accent-foreground font-medium"
                )}
              >
                <ItemIcon
                  className={cn(
                    "h-4 w-4",
                    item.color || "text-muted-foreground",
                    item.isActive && "text-accent-foreground"
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {item.isActive && <div className="w-2 h-2 rounded-full bg-primary" />}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Hook para facilitar o uso com as rotas do sidebar
export function useDropdownMenuItems(routes: any[], filterPaths: string[]) {
  return routes
    .filter((route) => filterPaths.includes(route.href))
    .map((route) => ({
      href: route.href,
      icon: route.icon,
      label: route.label,
      isActive: route.isActive,
      color: route.color,
    }));
}
