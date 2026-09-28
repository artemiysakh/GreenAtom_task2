const { Router } = require('express');
const router = Router();
const siteController = require('../controllers/siteController');
const  validate  = require('../middlewares/validate');
const { idParamSchema } = require('../validators/site.validator');
const  asyncHandler  = require('../middlewares/asyncHandler');

router.get('/:id/summary', validate({ params: idParamSchema }), asyncHandler(siteController.getSummary));

module.exports = router;