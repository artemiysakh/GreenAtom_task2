const Router = require('express')
const requestsController = require ('../controllers/requestsController')
const  validate  = require('../middlewares/validate')
const  asyncHandler  = require('../middlewares/asyncHandler');
const {createRequestSchema, updateRequestSchema, changeStatusSchema, listRequestsQuerySchema, idParamSchema, assignSchema, assigneeIdParamSchema,} = require('../validators/request.validator');
const router = Router()

router.get('/', validate({ query: listRequestsQuerySchema }), requestsController.getAllRequests)
router.post('/', validate({ body: createRequestSchema }), requestsController.createRequest)
router.get('/:id', validate({ params: idParamSchema }), requestsController.getRequest)
router.patch('/:id', validate({ params: idParamSchema, body: updateRequestSchema }), requestsController.updateRequest)
router.patch('/:id/status', validate({ params: idParamSchema, body: changeStatusSchema }), requestsController.changeStatus)
router.delete('/:id', validate({ params: idParamSchema }), requestsController.deleteRequest)
router.post('/:id/assignees', validate({ params: idParamSchema, body: assignSchema }), asyncHandler(requestsController.assign));
router.delete('/:id/assignees/:userId', validate({ params: assigneeIdParamSchema }), asyncHandler(requestsController.unassign));
router.get('/:id/history', validate({ params: idParamSchema }), asyncHandler(requestsController.getHistory));

module.exports = router