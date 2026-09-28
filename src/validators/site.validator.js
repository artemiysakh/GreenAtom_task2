const z = require('zod');

const idParamSchema = z.strictObject({ id: z.uuid() });

module.exports = { idParamSchema };