const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.bbcash_post)
router.put('/', controller.bbcash_put)
router.get('/account', controller.bbcashAccount_get)
router.get('/list', controller.getBbcashList_get)

module.exports = router

// accounting/bbcash/list