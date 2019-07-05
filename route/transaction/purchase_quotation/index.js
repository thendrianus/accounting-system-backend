const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.purchase_quotations_post)
router.put('/', controller.purchase_quotations_put)

router.post('/detail', controller.purchase_quotationsDetail_post)

router.post('/select', controller.purchase_quotationsselect_post)

module.exports = router

// transaction/purchase_quotation