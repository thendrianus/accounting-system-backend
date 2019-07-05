const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/', controller.generalledger_get)

module.exports = router

// accounting/generalledger