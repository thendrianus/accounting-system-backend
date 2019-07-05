const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/component', controller.app_permission_component_post)
router.post('/group', controller.app_permission_group_post)
router.put('/group', controller.app_permission_group_put)
router.post('/select', controller.app_permission_groupselect_post)
router.put('/select', controller.app_permission_groupselect_put)

module.exports = router

// apps/permission/component