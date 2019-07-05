const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.employee_account_post)
router.put('/', controller.employee_account_put)
router.post('/select', controller.employee_accountselect_post)

module.exports = router

// company/employee_account