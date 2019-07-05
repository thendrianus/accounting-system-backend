const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.tax_post)
router.put('/', controller.tax_put)
router.post('/select', controller.taxselect_post)

module.exports = router

// apps/tax/select