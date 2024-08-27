const { sendNotification, handelGetNotification, handelAdminGetNotification } = require("../controllers/PushNotificationController")

const router = require("express").Router()

router.get("/get-notification/:id", handelGetNotification)
router.get("/admin/get-notification", handelAdminGetNotification)
router.post('/notification', sendNotification)


module.exports = router