const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/list', controller.getInventorytransferList_get)
router.post('/', controller.inventorytransfer_post)
router.post('/s', controller.inventorytransfers_post)

module.exports = router

// accounting/inventorystocktransfer/list