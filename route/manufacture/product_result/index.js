const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/detail', controller.product_result_detail_get)
router.post('/detail', controller.product_result_detail_post)

router.post('/', controller.product_result_post)
router.put('/', controller.product_result_put)

router.post('/select', controller.product_resultselect_post)
router.put('/select', controller.product_resultselect_put)

module.exports = router

// manufacture/product_result