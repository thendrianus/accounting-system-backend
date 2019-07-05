const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.conversion_cost_post)
router.put('/', controller.conversion_cost_put)

router.post('/select', controller.conversion_costselect_post)

module.exports = router

// manufacture/conversion_cost