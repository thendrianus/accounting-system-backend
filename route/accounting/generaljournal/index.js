const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.generaljournal_post)
router.put('/', controller.generaljournal_put)

router.post('/gl', controller.generaljournalgeneralledger_post)
router.put('/gl', controller.generaljournalgeneralledger_put)

router.post('/search', controller.generaljournalSearch_post)
router.get('/options', controller.getGeneraljournalOptions_get)
router.get('/getglactionOptions', controller.getglactionOptions_get) // Not in used by frontend
router.post('/gllist', controller.gllist_post)

module.exports = router

// accounting/generaljournal/gllist
