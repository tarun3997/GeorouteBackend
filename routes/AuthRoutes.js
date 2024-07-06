const { handelRegistration, handelLogin } = require('../controllers/AuthController')


const router = require('express').Router()

router.post('/auth/register', handelRegistration)
router.post('/auth/login', handelLogin)


module.exports = router