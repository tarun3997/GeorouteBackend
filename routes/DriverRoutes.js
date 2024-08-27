const {handelDriverDetail, IsUserIsAdmin} = require('../controllers/DriverController')

const router = require('express').Router()

router.get('/driver/get-detail/:id', handelDriverDetail)
router.get('/check-user/:id', IsUserIsAdmin)

module.exports = router