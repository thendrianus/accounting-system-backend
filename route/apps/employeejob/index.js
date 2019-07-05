const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.employeejob_post)
router.put('/', controller.employeejob_put)
router.post('/select', controller.employeejobselect_post)

module.exports = router

// apps/employeejob/select