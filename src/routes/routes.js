const Router = require('express')

const equipmentRouter = require('./equipment.route')
const healthRouter = require('./health.route')
const requestsRouter = require('./requests.route')

const router = Router()

router.use('/health', healthRouter)
router.use('/equipment', equipmentRouter)
router.use('/requests', requestsRouter)

module.exports = router 