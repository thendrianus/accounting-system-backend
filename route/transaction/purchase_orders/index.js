const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.purchase_orders_post)
router.put('/', controller.purchase_orders_put)

router.post('/detail', controller.purchase_ordersDetail_post)

router.post('/select', controller.purchase_ordersselect_post)

module.exports = router

// transaction/purchase_orders