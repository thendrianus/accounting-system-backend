const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.currency_post)
router.put('/', controller.currency_put)
router.post('/select', controller.currencyselect_post)

module.exports = router

// apps/currency/select