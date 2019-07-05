const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/list', controller.getInventoryoutList_get)
router.post('/', controller.inventoryout_post)
router.post('/s', controller.inventoryouts_post)

module.exports = router

// accounting/inventoryout/list