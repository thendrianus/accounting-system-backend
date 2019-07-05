const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/report', controller.report_get)
router.post('/', controller.report_template_post)
router.post('/s', controller.report_templates_post)
router.put('/s', controller.report_templates_put)

module.exports = router

// apps/report_template/report