const express = require('express')
const router = express.Router()
const controller = require('./controller')
const sales_post = require('./sales_post.controller')
const sales_put = require('./sales_put.controller')
 
router.get('/category', controller.salecategory_get)
router.get('/payment', controller.salepayment_get)

router.post('/', sales_post)
router.put('/', sales_put)

router.post('/detail', controller.salesDetail_post)

router.post('/select', controller.salesselect_post)

router.get('/status', controller.salesstatus_get)

module.exports = router

// transaction/sale/category