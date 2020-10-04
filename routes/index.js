const userController = require('../controllers/userController')
const adminController = require('../controllers/adminController')
const tweetController = require('../controllers/tweetController')
const replyController = require('../controllers/replyController')

const helpers = require('../_helpers');

module.exports = (app, passport) => {
  const authenticated = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      //if (helpers.getUser(req).role === 'user') { return next() }
      return next()
    }
    req.flash('error_messages', '錯誤賬號類型，請使用後台登錄！')
    return res.redirect('/signin')
  }
  const authenticatedAdmin = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      console.log(req.user)
      if (req.user.role === 'admin') { return next() }
      return res.redirect('/signin')
    }
    res.redirect('/signin')
  }

  app.get('/', authenticated, (req, res) => { return res.redirect('/tweets') })
  //admin pages
  app.get('/admin/tweets', authenticatedAdmin, adminController.getTweets)
  app.delete('/admin/tweets/:id', authenticatedAdmin, adminController.deleteTweet)
  app.get('/admin/users', authenticatedAdmin, adminController.getUsers)
  
  //user login 
  app.get('/', (req, res) => { return res.redirect('/tweets') })
  app.get('/signin', userController.loginPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.login)
  app.get('/signup', userController.registerPage)
  app.post('/signup', userController.register)
  app.get('/logout', userController.logout)

  //admin login
  app.get('/admin/signin', userController.adminLoginPage)
  app.post('/admin/signin', passport.authenticate('local', { failureRedirect: '/admin/signin', failureFlash: true }), userController.adminLogin)
  app.get('/admin/logout', userController.adminLogout)

  //tweet page
  app.get('/tweets', authenticated, tweetController.getTweets)
  app.post('/tweets', authenticated, tweetController.postTweets)
  app.get('/tweets/:tweetId/replies', authenticated, tweetController.getReply)
  app.post('/tweets/:tweetId/replies', authenticated, tweetController.postReply)
  app.delete('/tweets/:tweetId', authenticated, tweetController.deleteTweet)
  app.delete('/tweets/:replyId/replies', authenticated, tweetController.deleteReply)
  app.put('/tweets/:tweetId', authenticated, tweetController.editTweet)
  app.put('/tweets/:replyId/replies', authenticated, tweetController.editReply)

  //Like
  app.post('/tweets/:tweetId/like', authenticated, userController.likeTweet)
  app.post('/tweets/:tweetId/unlike', authenticated, userController.unlikeTweet)
  app.post('/like/:replyId/replies', authenticated, userController.likeReply)
  app.delete('/like/:replyId/replies', authenticated, userController.dislikeReply)

  //Reply
  app.post('/replies/:replyId', authenticated, replyController.postReply)
  app.delete('/replies/:replyId', authenticated, replyController.deleteReply)
  app.put('/replies/:replyId', authenticated, replyController.editReply)

  //follow
  app.post('/followships', authenticated, userController.postFollowing)
  app.delete('/followships/:userId', authenticated, userController.deleteFollowing)

  app.get('/users/settings', authenticated, userController.getUserSettings)
  app.put('/users/settings/:id', authenticated, userController.putUserSettings)
  app.get('/users/:userId/tweets', authenticated, userController.getUserTweets)
  app.get('/users/:userId/replies', authenticated, userController.getUserReplies)
  app.get('/users/:userId/likes', authenticated, userController.getUserLikes)
  app.get('/users/:userId/followers', authenticated, userController.getUserFollowers)
  app.get('/users/:userId/followings', authenticated, userController.getUserFollowings)
  
}