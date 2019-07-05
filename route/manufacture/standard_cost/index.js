const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/detail', controller.standard_cost_detail_get)
router.post('/detail', controller.standard_cost_detail_post)

router.post('/', controller.standard_cost_post)
router.put('/', controller.standard_cost_put)

router.post('/select', controller.standard_costselect_post)

module.exports = router

// manufacture/standard_cost