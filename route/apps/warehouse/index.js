const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.warehouse_post)
router.put('/', controller.warehouse_put)
router.post('/select', controller.warehouseselect_post)

module.exports = router

// apps/warehouse/select