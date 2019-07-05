const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/detail', controller.standard_inventory_detail_get)
router.post('/detail', controller.standard_inventory_detail_post)

router.post('/', controller.standard_inventory_post)
router.put('/', controller.standard_inventory_put)

router.post('/select', controller.standard_inventoryselect_post)

module.exports = router

// manufacture/standard_inventory