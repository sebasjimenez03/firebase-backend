const { z } = require('zod');

const collaboratorSchema = z.object({
  companyName: z.string().min(2)
});

module.exports = { collaboratorSchema };