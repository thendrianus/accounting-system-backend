const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.uom_post)
router.put('/', controller.uom_put)
router.post('/select', controller.uomselect_post)

module.exports = router

// apps/uom