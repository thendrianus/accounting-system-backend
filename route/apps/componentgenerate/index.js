const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/component_gen', controller.component_gen_get)
router.post('/component_gen', controller.component_gen_post)
router.put('/component_gen', controller.component_gen_put)
router.post('/', controller.componentgenerate_post)
router.put('/', controller.componentgenerate_put)
router.get('/:id', controller.componentgenerated_post) //// Not in used by frontend

module.exports = router

// apps/componentgenerate/component_gen