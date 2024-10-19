const { UpdateVehicleKmLimit, UpdateVehicleFuel } = require('../controllers/VehicleUpdateController')

const router = require('express').Router()

router.post('/vehicle-km-limit', UpdateVehicleKmLimit)

router.post('/vehicle-fuel',UpdateVehicleFuel)

module.exports = router