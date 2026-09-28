const { Router } = require('express');
const router = Router();
const reportController = require('../controllers/reportController');
const  validate  = require('../middlewares/validate');
const { equipmentLoadQuerySchema } = require('../validators/report.validator');
const  asyncHandler  = require('../middlewares/asyncHandler');

router.get('/equipment-load', validate({ query: equipmentLoadQuerySchema }), asyncHandler(reportController.getEquipmentLoad));

module.exports = router;