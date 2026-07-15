import { z } from "zod";
import { isPositiveAmount } from "@/lib/swapRate";

export const swapFormSchema = z
  .object({
    fromSymbol: z.string().min(1, "Select a source token"),
    toSymbol: z.string().min(1, "Select a destination token"),
    amount: z
      .string()
      .refine((value) => value.trim().length > 0, "Enter an amount")
      .refine(isPositiveAmount, "Enter a valid amount greater than 0"),
  })
  .refine((values) => values.fromSymbol !== values.toSymbol, {
    message: "Choose two different tokens",
    path: ["toSymbol"],
  });

export type SwapFormValues = z.infer<typeof swapFormSchema>;
