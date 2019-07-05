const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.cash_transfer_post)
router.put('/', controller.cash_transfer_put)
router.post('/search', controller.cash_transferSearch_post)

module.exports = router

// accounting/cash_transfer/search