const {handelDriverDetail, IsUserIsAdmin} = require('../controllers/DriverController')
const { handleNewVehicleRepairing, handelVehicleRepairingDone, handelVehicleTable } = require('../controllers/VehicleRepairingController')

const router = require('express').Router()

router.get('/driver/get-detail/:id', handelDriverDetail)
router.get('/check-user/:id', IsUserIsAdmin)
router.post('/add-repairing', handleNewVehicleRepairing)
router.post('/repairing-done', handelVehicleRepairingDone)
router.get('/vehicle-table', handelVehicleTable)

module.exports = router