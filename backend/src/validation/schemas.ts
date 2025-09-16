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
  customerId: z.string().min(1, "Customer ID is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  status: z.string().optional(),
});

// Rules format validation schemas
export const ruleOperatorSchema = z.enum([
  "=", "!=", ">", ">=", "<", "<=", 
  "contains", "not_contains", 
  "starts_with", "ends_with",
  "in", "not_in"
]);

export const ruleFieldSchema = z.enum([
  "total_spend", "visits_count", "last_active", 
  "name", "email", "phone", "created_at"
]);

export const singleRuleSchema = z.object({
  field: ruleFieldSchema,
  operator: ruleOperatorSchema,
  value: z.union([z.string(), z.number(), z.array(z.union([z.string(), z.number()]))])
});

export const rulesGroupSchema: z.ZodType<any> = z.lazy(() => 
  z.object({
    op: z.enum(["AND", "OR"]),
    rules: z.array(z.union([singleRuleSchema, rulesGroupSchema]))
  })
);

export const segmentRulesSchema = rulesGroupSchema;

export const segmentSchema = z.object({
  name: z.string().min(1, "Segment name is required"),
  description: z.string().optional(),
  rulesJson: z.string().refine((val) => {
    try {
      const parsed = JSON.parse(val);
      // More lenient validation - just check if it's a valid JSON object
      return typeof parsed === 'object' && parsed !== null;
    } catch {
      return false;
    }
  }, "Invalid rules format - must be valid JSON"),
  createdBy: z.string().min(1, "Created by is required")
});

export const campaignSchema = z.object({
  segmentId: z.string().optional(),
  name: z.string().min(1, "Campaign name is required"),
  messageTemplate: z.string().optional(),
  scheduledAt: z.string().datetime().optional()
});

export const aiHelperSchema = z.object({
  query: z.string().min(1, "Query is required"),
  prompt: z.string().min(1, "Prompt is required")
});

export const previewAudienceSchema = z.object({
  rulesJson: z.string().min(1, "Rules JSON is required"),
  rules: z.any().optional()
});