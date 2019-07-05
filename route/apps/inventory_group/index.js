const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.inventory_group_post)
router.put('/', controller.inventory_group_put)
router.post('/select', controller.inventory_groupselect_post)

module.exports = router

// apps/inventory_group/select