const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/', controller.language_get)

module.exports = router

// apps/language