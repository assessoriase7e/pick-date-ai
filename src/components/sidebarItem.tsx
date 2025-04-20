import Link from "next/link";
import { Button } from "./ui/button";
import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
}

export function SidebarItem({
  href,
  icon: Icon,
  label,
  isActive = false,
}: SidebarItemProps) {
  return (
    <Link href={href} className="relative group w-full">
      <Button
        variant="ghost"
        size="icon"
        className={`w-10 h-10 hover:bg-primary hover:text-background ${
          isActive ? "text-background bg-primary" : ""
        }`}
      >
        <Icon className="h-5 w-5" />
        <span className="sr-only">{label}</span>
      </Button>
      <div
        className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-background border border-border rounded-md px-3 py-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md whitespace-nowrap ${
          isActive ? "bg-primary text-background" : ""
        }`}
      >
        {label}
      </div>
    </Link>
  );
}
