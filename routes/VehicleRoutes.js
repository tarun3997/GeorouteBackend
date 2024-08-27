const { sendNotification } = require('../controllers/PushNotificationController')
const { handelVehicleDetail, getVehicleDetails, getVehicleCount, getVehicleDetailById } = require('../controllers/VehicleDetailController')
const { VehicleLocation } = require('../controllers/VehicleLocationController')

const router = require('express').Router()
router.post('/location', VehicleLocation)
// router.post('/notification', sendNotification)
router.post('/vehicle-detail', handelVehicleDetail)
router.get('/get/vehicle-details', getVehicleDetails)
router.get('/get/vehicle-details-id', getVehicleDetailById)
router.get('/vehicle-count', getVehicleCount)

module.exports = router