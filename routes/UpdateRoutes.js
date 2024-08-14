const { UpdateVehicleKmLimit } = require('../controllers/VehicleUpdateController')

const router = require('express').Router()

router.post('/vehicle-km-limit', UpdateVehicleKmLimit)

module.exports = router