const { z } = require('zod');

const orderSchema = z.object({
  id: z.string().min(2)
});

module.exports = { orderSchema };