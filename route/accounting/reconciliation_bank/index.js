const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.reconciliation_bank_post)
router.put('/', controller.reconciliation_bank_put)
router.post('/search', controller.reconciliation_bankSearch_post)

module.exports = router

// accounting/reconciliation_bank/search