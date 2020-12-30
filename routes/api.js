const express = require('express')
const router = express.Router()
const auth = require('../config/auth')
const userController = require('../controllers/userController')

//user
router.get('/api/users/:userId', auth.apiAuthenticated, userController.apiGetUserInfo)
router.post('/api/users/:userId', auth.apiAuthenticated, userController.apiPostUserInfo)
router.post('/api/signin', userController.apiSignIn)

module.exports = router