const Router = require('express')

const equipmentRouter = require('./equipment.route')
const healthRouter = require('./health.route')
const requestsRouter = require('./requests.route')
const siteRouter = require('./site.route');
const reportRouter = require('./report.route');

const router = Router()

router.use('/health', healthRouter)
router.use('/equipment', equipmentRouter)
router.use('/requests', requestsRouter)
router.use('/sites', siteRouter);
router.use('/reports', reportRouter);

module.exports = router 


