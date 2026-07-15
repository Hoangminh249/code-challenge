import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { sanitizeAmountInput } from "@/lib/swapRate";

interface AmountInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string;
  onValueChange: (value: string) => void;
  invalid?: boolean;
}

export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  ({ value, onValueChange, invalid = false, className, readOnly, ...props }, ref) => {
    return (
      <input
        ref={ref}
        inputMode="decimal"
        autoComplete="off"
        readOnly={readOnly}
        value={value}
        onChange={(event) => {
          if (readOnly) {
            return;
          }

          onValueChange(sanitizeAmountInput(event.target.value));
        }}
        className={cn(
          "w-full min-w-0 bg-transparent text-right text-3xl font-semibold tracking-tight text-foreground placeholder:text-muted focus:outline-none",
          readOnly && "cursor-default",
          className,
        )}
        placeholder="0"
        aria-invalid={invalid}
        {...props}
      />
    );
  },
);

AmountInput.displayName = "AmountInput";
