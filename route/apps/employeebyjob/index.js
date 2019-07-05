const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/', controller.employeebyjob_post)

module.exports = router

// apps/employeebyjob