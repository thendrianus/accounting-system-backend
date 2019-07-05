const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.template_post)
router.put('/', controller.template_put)

router.get('/category', controller.templatecategory_get)

router.post('/detail', controller.templatedetail_post)
router.put('/detail', controller.templatedetail_put)

router.post('/details', controller.templatedetails_post)

router.get('/search', controller.templateSearch_get)

module.exports = router

// website/template