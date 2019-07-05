const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.brand_post)
router.put('/', controller.brand_put)
router.post('/select', controller.brandselect_post)

module.exports = router

// apps/brand