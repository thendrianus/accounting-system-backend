const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/getGiroinOptions', controller.getGiroinOptions_get) //// Not in used by frontend
router.post('/', controller.giroin_post)
router.put('/', controller.giroin_put)
router.post('/search', controller.giroinSearch_post)

module.exports = router

// accounting/giroin/search