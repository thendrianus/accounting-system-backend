const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/', controller.login_get)
router.post('/', controller.login_post)
router.put('/', controller.login_put)

module.exports = router

// apps/login