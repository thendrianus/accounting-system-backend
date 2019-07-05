const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.widget_post)
router.put('/', controller.widget_put)

router.get('/category', controller.widgetcategory_get)

router.post('/detail', controller.widgetdetail_post)
router.put('/detail', controller.widgetdetail_put)

router.post('/details', controller.widgetdetails_post)

router.get('/list', controller.widgetList_get)

router.get('/search', controller.widgetSearch_get)

module.exports = router

// website/widget