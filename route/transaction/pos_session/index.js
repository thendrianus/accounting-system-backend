const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.pos_session_post)
router.put('/', controller.pos_session_put)

router.post('/select', controller.pos_sessionselect_post)

module.exports = router

// transaction/pos_session