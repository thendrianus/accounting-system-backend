const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/list', controller.getInventoryadjList_get)
router.post('/', controller.inventoryadj_post)
router.post('/s', controller.inventoryadjs_post)

module.exports = router

// accounting/inventoryadj/list