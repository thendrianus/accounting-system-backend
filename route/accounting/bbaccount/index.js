const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/', controller.bbaccount_get)
router.post('/', controller.bbaccount_post)

module.exports = router

// accounting/bbaccount