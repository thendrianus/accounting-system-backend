const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/list', controller.getInventorybbList_get)
router.post('/', controller.inventorybb_post)
router.post('/s', controller.inventorybbs_post)

module.exports = router

// accounting/inventorybb/list