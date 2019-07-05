const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.department_post)
router.put('/', controller.department_put)
router.post('/select', controller.departmentselect_post)

module.exports = router

// company/department