const { handelRegistration, handelLogin } = require('../controllers/AuthController')
const VehicleLocation = require('../controllers/VehicleLocationController')

const router = require('express').Router()

router.post('/auth/register', handelRegistration)
router.post('/auth/login', handelLogin)
router.post('/location', VehicleLocation)

module.exports = router