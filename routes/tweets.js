const express = require('express')
const router = express.Router()
const auth = require('../config/auth')
const userController = require('../controllers/userController')
const tweetController = require('../controllers/tweetController')

//Like
router.delete('/like', auth.authenticated, userController.dislikeTweet)

//tweet page
router.get('', auth.authenticated, tweetController.getTweets)
router.put('/:tweetId', auth.authenticated, tweetController.editTweet)
router.delete('/:tweetId', auth.authenticated, tweetController.deleteTweet)

router.get('//replies', auth.authenticated, tweetController.getNoReply)
router.get('/:tweetId/replies', auth.authenticated, tweetController.getReply)

module.exports = router