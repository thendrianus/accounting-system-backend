const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/', controller.navigation_get)
router.post('/', controller.navigation_post)
router.put('/', controller.navigation_put)

module.exports = router

// website/navigation