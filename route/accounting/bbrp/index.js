const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.bbrp_post)
router.put('/', controller.bbrp_put)
router.post('/account', controller.bbrpAccount_post)
router.get('/branch', controller.BbrpBranch_get)
router.post('/partner', controller.BbrpBusinessPartner_post)
router.post('/list', controller.getBbrpList_post)

module.exports = router

// accounting/bbrp/list