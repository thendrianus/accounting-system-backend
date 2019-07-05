const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.cashin_post)
router.put('/', controller.cashin_put)
router.post('/search', controller.cashinSearch_post)
router.get('/options', controller.getCashinOptions_get)

module.exports = router

// accounting/cashin/options