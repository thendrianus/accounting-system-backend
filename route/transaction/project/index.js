const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.project_post)
router.put('/', controller.project_put)

router.post('/select', controller.projectselect_post)

module.exports = router

// transaction/project