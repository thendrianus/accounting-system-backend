const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.sale_quotations_post)
router.put('/', controller.sale_quotations_put)

router.post('/detail', controller.sale_quotationsDetail_post)

router.post('/select', controller.sale_quotationsselect_post)

module.exports = router

// transaction/sale_quotation