const z=require('zod')

const EquipmentSchema = z.strictObject({
  name: z.string().min(3).max(100),
  type: z.enum(['turbine', 'inverter', 'sensor', 'substation']),
  serialNumber: z.string().min(1),
  location: z.strictObject({
    lat: z.number(),
    lon: z.number(),
  }),
  status: z.enum(['operational', 'maintenance', 'fault', 'decommissioned']),
  installedAt: z.iso.datetime(),
});

const createEquipmentSchema = EquipmentSchema;

const updateEquipmentSchema = EquipmentSchema
  .partial()
  .omit({ serialNumber: true, status: true });

const listEquipmentQuerySchema = z.strictObject({
  type: z.enum(['turbine', 'inverter', 'sensor', 'substation']).optional(),
  status: z.enum(['operational', 'maintenance', 'fault', 'decommissioned']).optional(),
  sortBy: z.enum(['name', 'installedAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const idParamSchema = z.strictObject({
  id: z.uuid(),
});
module.exports = {
  createEquipmentSchema,updateEquipmentSchema,listEquipmentQuerySchema,idParamSchema
}