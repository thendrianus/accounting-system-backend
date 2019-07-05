const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.pos_stand_post)
router.put('/', controller.pos_stand_put)

router.post('/select', controller.pos_standselect_post)

module.exports = router

// transaction/pos_stand