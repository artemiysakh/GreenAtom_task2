const z = require('zod');

const equipmentLoadQuerySchema = z.strictObject({
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
  minRequests: z.coerce.number().int().min(0).max(10000).optional(),
});

module.exports = { equipmentLoadQuerySchema };