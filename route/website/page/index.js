const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.page_post)
router.put('/', controller.page_put)

router.get('/category', controller.pageCategory_get)

router.post('/detail', controller.pagedetails_post)

router.get('/search', controller.pageSearch_get)

router.post('/widgetdetails', controller.pagewidgetdetails_post)
router.put('/widgetdetails', controller.pagewidgetdetails_put)

module.exports = router

// website/page