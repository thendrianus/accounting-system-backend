const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.purchase_receives_post)
router.put('/', controller.purchase_receives_put)

router.post('/detail', controller.purchase_receivesDetail_post)

router.post('/select', controller.purchase_receivesselect_post)

module.exports = router

// transaction/purchase_receive