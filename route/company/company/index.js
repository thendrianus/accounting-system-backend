const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.company_post)
router.put('/', controller.company_put)
router.post('/select', controller.companyselect_post)

module.exports = router

// company/company