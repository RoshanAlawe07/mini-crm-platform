import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  total_spend: z.number().optional(),
  last_active: z.string().datetime().optional(),
  visits_count: z.number().optional(),
});

export const orderSchema = z.object({
  customer_id: z.number().optional(),
  customer_email: z.string().email().optional(),
  amount: z.number().min(1),
  order_date: z.string().datetime().optional(),
});
