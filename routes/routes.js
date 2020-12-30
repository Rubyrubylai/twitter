const express = require('express')
const router = express.Router()
const auth = require('../config/auth')
const passport = require('../config/passport')
const userController = require('../controllers/userController')
const messageController = require('../controllers/messageController')

//user login 
router.get('/', auth.authenticated, (req, res) => { return res.redirect('/tweets') })
router.get('/signin', userController.loginPage)
router.get('/signin/:type', userController.emailLoginPage)
router.post('/signin', passport.authenticate('account-local', { failureRedirect: '/signin', failureFlash: true }), userController.login)
router.post('/signin/email', passport.authenticate('email-local', { failureRedirect: '/signin/email', failureFlash: true }), userController.emailLogin)
router.get('/signup', userController.registerPage)
router.post('/signup', userController.register)
router.get('/logout', userController.logout)

//follow
router.delete('/followships', auth.authenticated, userController.deleteFollowing)
router.get('/topFollowing', auth.authenticated, userController.topFollowing)

//message
router.get('/message', auth.authenticated, messageController.getMessage)
router.get('/message/:userId', auth.authenticated, messageController.getPrivateMessage)
router.get('/count', auth.authenticated, messageController.getCount)
router.get('/notice', auth.authenticated, messageController.getNotice)
router.delete('/subscribe', auth.authenticated, messageController.deleteSubscribed)

module.exports = router