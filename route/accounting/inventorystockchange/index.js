const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/list', controller.getInventorychgList_get)
router.post('/', controller.inventorychg_post)
router.post('/s', controller.inventorychgs_post)

module.exports = router

// accounting/inventorystockchange/list