"use client";

import { UploadthingProvider } from "@uploadthing/react";
import { ReactNode } from "react";

interface UploadthingProviderWrapperProps {
  children: ReactNode;
}

export function UploadthingProviderWrapper({
  children,
}: UploadthingProviderWrapperProps) {
  return <UploadthingProvider>{children}</UploadthingProvider>;
}
