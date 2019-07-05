const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/getReconciliation_adjOptions', controller.getReconciliation_adjOptions_get) // //// Not in used by frontend
router.post('/', controller.reconciliation_adj_post)
router.put('/', controller.reconciliation_adj_put)
router.post('/search', controller.reconciliation_adjSearch_post)

module.exports = router

// accounting/reconciliation_adj/search