const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/inventorylabel', controller.inventorylabel_get)//// Not in used by frontend

module.exports = router

// apps/inventorylabel