import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border-2 border-valle-silver-300 bg-white px-3 py-2 text-sm text-valle-navy-800 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-valle-silver-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-valle-blue-600 focus-visible:border-valle-blue-600 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
