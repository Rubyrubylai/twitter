const express = require('express')
const router = express.Router()
const auth = require('../config/auth')
const userController = require('../controllers/userController')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const imagesUpload = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
])

router.get('/settings', auth.authenticated, userController.getUserSettings)
router.put('/settings/:id', auth.authenticated, userController.putUserSettings)

router.get('/:userId/tweets', auth.authenticated, userController.getUserTweets)
router.get('/:userId/replies', auth.authenticated, userController.getUserReplies)
router.get('/:userId/likes', auth.authenticated, userController.getUserLikes)
router.get('/:userId/followers', auth.authenticated, userController.getUserFollowers)
router.get('/:userId/followings', auth.authenticated, userController.getUserFollowings)
router.put('/:userId', auth.authenticated, imagesUpload, userController.putUserInfo)
router.post('/:userId', auth.authenticated, imagesUpload, userController.putUserInfo)
router.get('/:userId', auth.authenticated, userController.getUserInfo)

module.exports = router