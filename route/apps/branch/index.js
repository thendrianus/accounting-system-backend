const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.branch_post)
router.put('/', controller.branch_put)
router.post('/s', controller.branches_post)
router.post('/select', controller.branchselect_post)

module.exports = router

// apps/branch