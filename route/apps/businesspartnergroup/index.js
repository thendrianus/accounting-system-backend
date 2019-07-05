const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.businesspartnergroup_post)
router.put('/', controller.businesspartnergroup_put)
router.post('/select', controller.businesspartnergroupselect_post)

module.exports = router

// apps/businesspartnergroup/select