const { Router } = require('express');
const equipmentController = require('../controllers/equipmentController');
const validate = require('../middlewares/validate');
const { createEquipmentSchema, updateEquipmentSchema, listEquipmentQuerySchema, idParamSchema } = require('../validators/equipment.validator');
const { listRequestsQuerySchema } = require('../validators/request.validator');

const router = Router();

router.get('/',   validate({ query: listEquipmentQuerySchema }),  equipmentController.list.bind(equipmentController));
router.post('/',  validate({ body: createEquipmentSchema }),      equipmentController.create.bind(equipmentController));
router.get('/:id',    validate({ params: idParamSchema }),        equipmentController.getById.bind(equipmentController));
router.patch('/:id',  validate({ params: idParamSchema, body: updateEquipmentSchema }), equipmentController.update.bind(equipmentController));
router.delete('/:id', validate({ params: idParamSchema }),        equipmentController.remove.bind(equipmentController));
router.get('/:id/requests', validate({ params: idParamSchema, query: listRequestsQuerySchema }), equipmentController.listRequests.bind(equipmentController));
router.get('/:id/weather',  validate({ params: idParamSchema }),  equipmentController.getWeather.bind(equipmentController));

module.exports = router;