const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/getGirooutOptions', controller.getGirooutOptions_get)
router.post('/', controller.giroout_post)
router.put('/', controller.giroout_put)
router.post('/search', controller.girooutSearch_post)

module.exports = router

// accounting/giroout/search