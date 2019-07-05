const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.generalledgerperiod_post)
router.put('/', controller.generalledgerperiod_put)

module.exports = router

// accounting/generalledgerperiod