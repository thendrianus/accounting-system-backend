const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.post('/', controller.article_post)
router.put('/', controller.article_put)

router.get('/category', controller.articleCategory_get)

router.post('/search', controller.articleSearch_post)

module.exports = router

// website/article