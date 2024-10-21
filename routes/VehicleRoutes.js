const { sendNotification } = require('../controllers/PushNotificationController')
const { handelVehicleDetail, getVehicleDetails, getVehicleCount, getVehicleDetailById, recordFuelRefill, deleteVehicle } = require('../controllers/VehicleDetailController')
const { VehicleLocation } = require('../controllers/VehicleLocationController')

const router = require('express').Router()
router.post('/location', VehicleLocation)
// router.post('/notification', sendNotification)
router.post('/vehicle-detail', handelVehicleDetail)
router.post('/vehicle-fuel-refill', recordFuelRefill)
router.get('/get/vehicle-details', getVehicleDetails)
router.get('/get/vehicle-details-id', getVehicleDetailById)
router.get('/vehicle-count', getVehicleCount)
router.delete('/remove-vehicle/:id', deleteVehicle);

module.exports = router