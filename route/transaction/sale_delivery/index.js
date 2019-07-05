const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.sale_deliverys_post)

router.put('/', controller.sale_deliverys_put)

router.post('/detail', controller.sale_deliverysDetail_post)

router.post('/select', controller.sale_deliverysselect_post)

module.exports = router

// transaction/sale_delivery