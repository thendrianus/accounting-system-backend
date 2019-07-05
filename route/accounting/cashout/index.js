const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.cashout_post)
router.put('/', controller.cashout_put)
router.post('/search', controller.cashoutSearch_post)

module.exports = router

// accounting/cashout/search