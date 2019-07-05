const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.isUseChange_post)

module.exports = router

// apps/isusechange