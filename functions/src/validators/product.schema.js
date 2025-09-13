const { z } = require('zod');

const productSchema = z.object({
  name: z.string().min(2),
  price: z.number().optional(),
  currency: z.literal('EUR').default('EUR'),
  shopId: z.string().min(1),
  description: z.string().optional(),
  category: z.string(),
  imageUrl: z.string().optional(),
  enabled: z.boolean().default(true),
  visible: z.boolean().default(true),
  createdAt: z.string().optional(0),
  updatedAt: z.string().optional(0)
});

module.exports = { productSchema };