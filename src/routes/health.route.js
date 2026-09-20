const Router = require('express')
const router = Router()

const healthController = require('../controllers/healthController');

router.get('/', healthController.check.bind(healthController))

module.exports = router