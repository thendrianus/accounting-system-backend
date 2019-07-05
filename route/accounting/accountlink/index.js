const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/', controller.accountlink_get)
router.post('/', controller.accountlink_post)

module.exports = router

// accounting/accountlink