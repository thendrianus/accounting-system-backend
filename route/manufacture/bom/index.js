const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/cost', controller.bom_cost_post)

router.post('/inventory', controller.bom_inventory_post)

router.post('/', controller.bom_post)
router.put('/', controller.bom_put)

router.post('/select', controller.bomselect_post)

module.exports = router

// manufacture/bom