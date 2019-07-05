const express = require('express')
const router = express.Router()
const controller = require('./controller')
const async = require('async')


router.post('/', controller.inventory_post)

router.put('/', controller.inventory_put)

router.post('/prices', controller.inventory_prices_post)

router.post('/price', controller.inventory_price_post)
router.put('/price', controller.inventory_price_put)

router.post('/suppliers', controller.get_inventory_supplier_post)
router.post('/supplier', controller.inventory_supplier_post)
router.put('/supplier', controller.inventory_supplier_put)

router.post('/search', controller.inventorySearch_post)

module.exports = router
