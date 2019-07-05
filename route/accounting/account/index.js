const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/select', controller.accountselect_post)

router.post('/', require('./add.controller'))
router.put('/', controller.account_put)

router.get('/category', controller.accountcategorytype_get)

router.post('/banks', controller.accountbanks_post)

router.post('/bank', controller.accountbank_post)
router.put('/bank', controller.accountbank_put)

module.exports = router

// accounting/account/bank