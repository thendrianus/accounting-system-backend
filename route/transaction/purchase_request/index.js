const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.purchase_requests_post)
router.put('/', controller.purchase_requests_put)

router.post('/detail', controller.purchase_requestsDetail_post)

router.post('/select', controller.purchase_requestsselect_post)

module.exports = router

// transaction/purchase_request