const { z } = require('zod');
const shopSchema = z.object({
  name: z.string().min(2),
  ownerUserId: z.string().min(1),
  address: z.string().min(5),
  zip: z.string().min(3),
  city: z.string().min(2),
  phone: z.string().optional(),
  enabled: z.boolean().default(true)
});
module.exports = { shopSchema };
