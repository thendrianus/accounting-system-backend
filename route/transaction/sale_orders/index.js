const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.sale_orders_post)
router.put('/', controller.sale_orders_put)

router.post('/detail', controller.sale_ordersDetail_post)

router.post('/select', controller.sale_ordersselect_post)

module.exports = router

// transaction/sale_orders