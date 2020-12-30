const express = require('express')
const router = express.Router()
const auth = require('../config/auth')
const userController = require('../controllers/userController')
const tweetController = require('../controllers/tweetController')
const replyController = require('../controllers/replyController')

//like
router.delete('/like', auth.authenticated, userController.dislikeReply)

//reply
router.delete('/:replyId', auth.authenticated, tweetController.deleteReply)
router.put('/:replyId', auth.authenticated, tweetController.editReply)

//reply comment
router.put('/replyComments/:replyCommentId', auth.authenticated, replyController.editReply)
router.delete('/replyComments/:replyCommentId', auth.authenticated, replyController.deleteReply)

module.exports = router