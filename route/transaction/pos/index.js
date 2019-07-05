const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.poses_post)
router.put('/', controller.poses_put)

router.post('/detail', controller.posesDetail_post)

router.post('/select', controller.posesselect_post)

module.exports = router

// transaction/pos