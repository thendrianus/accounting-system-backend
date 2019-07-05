const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.sale_dos_post)
router.put('/', controller.sale_dos_put)

router.post('/detail', controller.sale_dosDetail_post)

router.post('/select', controller.sale_dosselect_post)

module.exports = router

// transaction/sale_delivery_order