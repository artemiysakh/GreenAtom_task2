const Router = require('express')
const equipmentController = require ('../controllers/equipmentController')
const validate = require('../middlewares/validate')
const {createEquipmentSchema, updateEquipmentSchema, listEquipmentQuerySchema, idParamSchema} = require('../validators/equipment.validator');
const { listRequestsQuerySchema } = require('../validators/request.validator');
const router = Router()

router.get('/', validate({ query: listEquipmentQuerySchema }), equipmentController.getAllEquipment)
router.post('/', validate({ body: createEquipmentSchema }), equipmentController.createEquipment)
router.get('/:id', validate({ params: idParamSchema }), equipmentController.getEquipment)
router.patch('/:id', validate({ params: idParamSchema, body: updateEquipmentSchema }), equipmentController.updateEquipment)
router.delete('/:id', validate({ params: idParamSchema, }), equipmentController.deleteEquipment)
router.get('/:id/requests', validate({ params: idParamSchema, query: listRequestsQuerySchema }), equipmentController.getByReqEquipment)
router.get('/:id/weather', validate({ params: idParamSchema, query: listEquipmentQuerySchema }), equipmentController.getPredict)

module.exports = router