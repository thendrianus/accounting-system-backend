const express = require('express')
const router = express.Router()
const controller = require('./controller')
const purchases_post = require('./purchases_post.controller')
const purchases_put = require('./purchases_put.controller')

router.get('/category', controller.purchasecategory_get)

router.get('/payment', controller.purchasepayment_get)

router.post('/', purchases_post)
router.put('/', purchases_put)

router.post('/detail', controller.purchasesDetail_post)

router.post('/select', controller.purchasesselect_post)

router.get('/status', controller.purchasesstatus_get)

module.exports = router

// transaction/purchase