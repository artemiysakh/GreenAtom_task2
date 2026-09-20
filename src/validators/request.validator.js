const z=require('zod')

const RequestSchema = z.strictObject({
  equipmentId: z.uuid(),
  title: z.string().min(5).max(120),
  description: z.string().max(2000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  plannedAt: z.iso.datetime().optional(),
});

const createRequestSchema = RequestSchema;

const updateRequestSchema = RequestSchema
  .partial()
  .omit({ equipmentId: true });

const changeStatusSchema = z.strictObject({
  status: z.enum(['new', 'in_progress', 'done', 'rejected']),
});

const listRequestsQuerySchema = z.strictObject({
  equipmentId: z.uuid().optional(),
  status: z.enum(['new', 'in_progress', 'done', 'rejected']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  plannedFrom: z.iso.datetime().optional(),
  plannedTo: z.iso.datetime().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'plannedAt', 'priority', 'status']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
const idParamSchema = z.strictObject({
  id: z.uuid(),
});
module.exports = {
  createRequestSchema,updateRequestSchema,changeStatusSchema,listRequestsQuerySchema,idParamSchema
}