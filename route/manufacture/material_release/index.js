const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/detail', controller.material_release_detail_get)
router.post('/detail', controller.material_release_detail_post)

router.post('/', controller.material_release_post)
router.put('/', controller.material_release_put)

router.post('/select', controller.material_releaseselect_post)
router.put('/select', controller.material_releaseselect_put)

module.exports = router

// manufacture/material_release