const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.employee_post)
router.put('/', controller.employee_put)
router.get('/listAll', controller.employeeListAll_get)
router.post('/select', controller.employeeselect_post)
router.put('/select', controller.employeeselect_put)

module.exports = router

// hrd/employee