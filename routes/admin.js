const express = require('express')
const router = express.Router()
const auth = require('../config/auth')
const passport = require('../config/passport')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')

//admin pages
router.get('/tweets', auth.authenticatedAdmin, adminController.getTweets)
router.delete('/tweets/:id', auth.authenticatedAdmin, adminController.deleteTweet)
router.get('/users', auth.authenticatedAdmin, adminController.getUsers)

//admin login
router.get('/signin', userController.adminLoginPage)
router.post('/signin', passport.authenticate('account-local', { failureRedirect: '/admin/signin', failureFlash: true }), userController.adminLogin)
router.get('/signin/:type', userController.adminEmailLoginPage)
router.post('/signin/email', passport.authenticate('email-local', { failureRedirect: '/admin/signin/email', failureFlash: true }), userController.adminEmailLogin)
router.get('/logout', userController.adminLogout)

module.exports = router