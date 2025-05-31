"use client";

import { ArrowRightIcon } from "@radix-ui/react-icons";
import { ComponentPropsWithoutRef, ReactNode, useRef } from "react";
import { motion, useInView } from "motion/react";
import * as LucideIcons from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps extends ComponentPropsWithoutRef<"div"> {
  name: string;
  className: string;
  background: ReactNode;
  iconName: string; // Mudamos de Icon para iconName
  description: string;
  href: string;
  cta?: string;
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-3 gap-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  iconName,
  description,
  href,
  cta,
  ...props
}: BentoCardProps) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { margin: "-300px" });
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Renderiza dinamicamente o ícone do Lucide baseado no nome
  const IconComponent =
    (LucideIcons as unknown as Record<string, React.ElementType>)[iconName] ||
    LucideIcons.HelpCircle; // Fallback para um ícone padrão

  return (
    <div
      key={name}
      ref={cardRef}
      className={cn(
        "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
        // light styles
        "bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        // dark styles
        "transform-gpu border border-accent/25 dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
        className
      )}
      {...props}
    >
      <div>{background}</div>
      <motion.div
        className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300"
        initial={{ y: 0 }}
        animate={
          isMobile
            ? { y: isInView ? -80 : 0, scale: isInView ? 1.05 : 1 }
            : { y: 0, scale: 1 }
        }
        transition={{ duration: 0.5 }}
      >
        <IconComponent className="h-12 w-12 origin-left transform-gpu text-primary" />
        <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">
          {name}
        </h3>
        <p className="max-w-lg text-neutral-400">{description}</p>
      </motion.div>

      {cta && (
        <motion.div
          className="pointer-events-none absolute bottom-0 flex w-full flex-row items-center p-4"
          initial={{ y: 40, opacity: 0 }}
          animate={{
            y: isInView ? 0 : 40,
            opacity: isInView ? 1 : 0,
          }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            asChild
            size="sm"
            className="pointer-events-auto"
          >
            <a href={href}>
              {cta}
              <ArrowRightIcon className="ms-2 h-4 w-4 rtl:rotate-180" />
            </a>
          </Button>
        </motion.div>
      )}
      <motion.div
        className="pointer-events-none absolute inset-0 transform-gpu"
        initial={{ opacity: 0 }}
        animate={{
          opacity: isInView ? 0.03 : 0,
          backgroundColor: isInView ? "black" : "transparent",
        }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
};

export { BentoCard, BentoGrid };
