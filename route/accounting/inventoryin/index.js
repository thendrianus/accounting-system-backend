const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/list', controller.getInventoryinList_get)
router.post('/', controller.inventoryin_post)
router.post('/s', controller.inventoryins_post)

module.exports = router

// accounting/inventoryin/list