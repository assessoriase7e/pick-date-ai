"use client";

import { forwardRef } from "react";
import { PatternFormat, type NumericFormatProps } from "react-number-format";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PhoneInputProps extends Omit<NumericFormatProps, "format"> {
  className?: string;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <PatternFormat
        getInputRef={ref}
        format="(##) #####-####"
        mask="_"
        allowEmptyFormatting={false}
        customInput={Input}
        className={cn(className)}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
