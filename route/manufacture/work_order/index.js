const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/detail', controller.work_order_detail_get)
router.post('/detail', controller.work_order_detail_post)

router.post('/', controller.work_order_post)
router.put('/', controller.work_order_put)

router.post('/select', controller.work_orderselect_post)

module.exports = router

// manufacture/work_order