const bcrypt = require('bcrypt-nodejs')
const db = require('../models')
const { User, Tweet, Reply, Like, Followship, ReplyComment, Notice } = db
const helpers = require('../_helpers')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

let more = 10
const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const multer = require('multer')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const userController = {
  apiSignIn: (req, res) => {
    if (!req.body.account || !req.body.password) {
      return res.json({ status: 'error', message: "required fields didn't exist" })
    }
    // 檢查 user 是否存在與密碼是否正確
    let useraccount = req.body.account
    let password = req.body.password
    User.findOne({ where: { account: useraccount } }).then(user => {
      if (!user) return res.status(401).json({ status: 'error', message: 'no such user found' })
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ status: 'error', message: 'passwords did not match' })
      }
      // 簽發 token
      const payload = { id: user.id }
      const token = jwt.sign(payload, process.env.JWT_SECRET)
      return res.json({
        status: 'success',
        message: 'ok',
        token: token,
        user: {
          id: user.id, name: user.name, email: user.email, role: user.role
        }
      })
    })
  },

  registerPage: (req, res) => {
    return res.render('user/register', { layout: 'mainLogin' })
  },

  register: (req, res) => {
    if (req.body.checkPassword !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // confirm unique user
      User.findOne({
        where: {
          $or: [
            { email: req.body.email },
            { account: req.body.account }
          ]
        }
      })
        .then(user => {
          if (user) {
            req.flash('error_messages', '信箱或賬號重複！')
            return res.redirect('/signup')
          } else {
            User.create({
              name: req.body.name,
              email: req.body.email,
              account: req.body.account,
              password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null),
              role: 'user'
            }).then(user => {
              req.flash('success_messages', '成功註冊帳號！')
              return res.redirect('/signin')
            })
          }
        })
    }
  },

  loginPage: (req, res) => {
    return res.render('user/login', { layout: 'mainLogin' })
  },

  login: (req, res) => {
    req.flash('success_messages', '成功登入！')
    return res.redirect('/tweets')
  },

  emailLoginPage: (req, res) => {
    const params = req.params.type
    return res.render('user/login', { params, layout: 'mainLogin' })
  },

  emailLogin: (req, res) => {
    req.flash('success_messages', '成功登入！')
    return res.redirect('/tweets')
  },

  logout: (req, res) => {
    req.flash('success_messages', '成功登出！')
    req.logout()
    return res.redirect('/signin')
  },

  dislikeTweet: (req, res) => {
    Like.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        TweetId: req.body.tweetId
      }
    })
    .then(like => {
      Notice.destroy({
        where: {
          UserId: req.body.tweetUserId,
          LikeId: like.id
        }
      })
      .then(notice => {
        like.destroy()
        .then(like => {
          return res.send('dislike tweet')
        })
      })   
    })
  },

  dislikeReply: (req, res) => {
    Like.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        ReplyId: req.body.replyId
      }
    })
      .then(like => {
        Notice.destroy({
          where: {
            UserId: req.body.replyUserId,
            LikeId: like.id
          }
        })
        .then(notice => {
          like.destroy()
          .then(like => {
            return res.send('dislike reply')
          })
        })
        
      })
  },

  deleteFollowing: (req, res) => {
    Followship.findOne({
      where: {
        followerId: helpers.getUser(req).id,
        followingId: req.body.followingId
      }
    })
    .then(followship => {
      Notice.destroy({
        where: {
          UserId: req.body.followingId,
          notifierId: helpers.getUser(req).id
        }
      })
      .then(notice => {
        followship.destroy()
        .then(followship => {
          return res.send('delete followship')
        })
      })
    })
  },

  adminLoginPage: (req, res) => {
    return res.render('admin/login', { layout: 'mainLogin' })
  },

  adminLogin: (req, res) => {
    req.flash('success_messages', '成功登入！')
    return res.redirect('/admin/tweets')
  },

  adminEmailLoginPage: (req, res) => {
    const params = req.params.type
    return res.render('admin/login', { params, layout: 'mainLogin' })
  },

  adminEmailLogin: (req, res) => {
    req.flash('success_messages', '成功登入！')
    return res.redirect('/admin/tweets')
  },

  adminLogout: (req, res) => {
    req.flash('success_messages', '成功登出！')
    req.logout()
    return res.redirect('/admin/login')
  },

  getUserSettings: (req, res) => {
    const loginUser = helpers.getUser(req)
    return User.findByPk(loginUser.id).then(user => {
      return res.render('user/settings', {
        user: user.toJSON()
      })
    })
  },

  putUserSettings: (req, res) => {
    const { account, name, email, password, checkPassword } = req.body
    const id = req.params.id
    let passwordCheck = false
    // check user auth
    if (helpers.getUser(req).id !== Number(id)) {
      req.flash('error_messages', '只能編輯自己的賬號')
      return res.redirect('back')
    }
    // check data
    if (!account || !name || !email) {
      req.flash('error_messages', '請填入賬號/名稱/Email')
      return res.redirect('back')
    }
    // check password
    if (password && !checkPassword) {
      req.flash('error_messages', '請確認密碼')
      passwordCheck = false
      return res.redirect('back')
    }
    if (!password && checkPassword) {
      req.flash('error_messages', '請填入密碼')
      passwordCheck = false
      return res.redirect('back')
    }
    if (password || checkPassword) {
      if (password !== checkPassword) {
        req.flash('error_messages', '密碼與確認密碼不符')
        passwordCheck = false
        return res.redirect('back')
      } else {
        passwordCheck = true
      }
    }
    if (passwordCheck) {
      // user change password
      return User.findByPk(id).then(user => {
        user.update({
          account,
          name,
          email,
          password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
        })
      }).then(user => {
        req.flash('success_messages', '賬戶資料更改成功！')
        return res.redirect('back')
      }).catch(err => console.log(err))
    } else {
      // user not change password
      return User.findByPk(id).then(user => {
        user.update({
          account,
          name,
          email
        })
      }).then(user => {
        req.flash('success_messages', '賬戶資料更改成功')
        return res.redirect('back')
      }).catch(err => console.log(err))
    }
  },

  getUserTweets: (req, res) => {
    const reqUserId = req.params.userId
    const loginUser = helpers.getUser(req)
    return User.findByPk(reqUserId, {
      order: [[{ model: Tweet }, 'createdAt', 'DESC']],
      include: [
        { model: Tweet, include: [Like, Reply] },
        { model: User, as: 'following' },
        { model: User, as: 'follower' },
        { model: User, as: 'subscriber'}
      ]
    }).then(user => {
      

      const tweets = user.toJSON().Tweets.map(tweet => ({
        id: user.toJSON().id,
        avatar: user.toJSON().avatar,
        account: user.toJSON().account,
        name: user.toJSON().name,
        description: tweet.description ? tweet.description.substring(0, 160) : 0,
        updatedAt: tweet.updatedAt,
        replyCount: tweet.Replies.length,
        likeCount: tweet.Likes.length,
        tweetId: tweet.id,
        isLiked: loginUser.Likes.map(like => like.TweetId).includes(tweet.id),
        
      }))
      const isFollowed = user.follower.map(follower => follower.id).includes(loginUser.id)
      const isSubscribed = user.subscriber.map(user => user.id).includes(loginUser.id)

      return res.render('user/userTweets', {
        tweets,
        userId: user.toJSON().id,
        cover: user.toJSON().cover,
        avatar: user.toJSON().avatar,
        account: user.toJSON().account,
        name: user.toJSON().name,
        introduction: user.toJSON().introduction,
        followingsCount: user.toJSON().following.length,
        followersCount: user.toJSON().follower.length,
        tweetsCount: tweets.length,
        isFollowed,
        isSubscribed
      })
 
    })
  },

  getUserReplies: (req, res) => {
    const reqUserId = req.params.userId
    const loginUser = helpers.getUser(req)
    return User.findByPk(reqUserId, {
      order: [[{ model: Reply }, 'createdAt', 'DESC']],
      include: [
        {
          model: Reply,
          include: [
            { model: Tweet, include: [User, Reply, Like] },
            { model: ReplyComment },
            { model: Like }
          ]
        },
        { model: User, as: 'following' },
        { model: User, as: 'follower' },
        { model: User, as: 'subscriber'},
        Tweet
      ]
    }).then(user => {
      const replies = user.Replies.map(reply => ({
        // Reply
        ...reply.dataValues,
        avatar: user.toJSON().avatar,
        account: user.toJSON().account,
        name: user.toJSON().name,
        comment: reply.comment,
        updatedAt: reply.updatedAt,
        replyCommentsCount: reply.ReplyComments.length,
        replyLikeCount: reply.Likes.length,
        isReplyLiked: loginUser.Likes.map(like => like.ReplyId).includes(reply.id),
        // Tweet
        tweetId: reply.TweetId,
        tweetUserId: reply.Tweet ? reply.Tweet.User.id: null,
        tweetUserAccount: reply.Tweet  ? reply.Tweet.User.account: null,
        tweetUserName: reply.Tweet ? reply.Tweet.User.name: null,
        tweetDescription: reply.Tweet ? reply.Tweet.description.substring(0, 160): null,
        replyCount: reply.Tweet ? reply.Tweet.Replies.length: null,
        tweetLikeCount: reply.Tweet ? reply.Tweet.Likes.length: null,
        isLiked: loginUser.Likes.map(like => like.TweetId).includes(reply.TweetId)
      }))
      const isFollowed = user.follower.map(follower => follower.id).includes(loginUser.id)
      const isSubscribed = user.subscriber.map(user => user.id).includes(loginUser.id)

      return res.render('user/userReplies', {
        replies,
        userId: user.toJSON().id,
        cover: user.toJSON().cover,
        avatar: user.toJSON().avatar,
        account: user.toJSON().account,
        name: user.toJSON().name,
        introduction: user.toJSON().introduction,
        followingsCount: user.toJSON().following.length,
        followersCount: user.toJSON().follower.length,
        tweetsCount: user.toJSON().Tweets.length,
        isFollowed,
        isSubscribed
      })
    })
  },

  getUserLikes: (req, res) => {
    const reqUserId = req.params.userId
    const loginUser = helpers.getUser(req)
    return User.findByPk(reqUserId, {
      order: [[{ model: Like }, 'createdAt', 'DESC']],
      include: [ // TweetId: { $gt: 0 } --> TweetId大於0, 用來排除TweetID=Null (like reply)的情況
        // { model: Like, where: { TweetId: { $gt: 0 } }, include: [{ model: Tweet, include: [User, Reply, Like] }] },
        { model: Like, include: [{ model: Tweet, include: [User, Reply, Like] }, 
          { model: Reply, include: [User, ReplyComment, Like] }] },
        { model: User, as: 'following' },
        { model: User, as: 'follower' },
        { model: User, as: 'subscriber'},
        Tweet
      ]
    }).then(user => {
      
      const data = user.Likes.map(r => ({
        ...r.dataValues,
        id: r.dataValues.Tweet ? r.dataValues.Tweet.User.id : null,
        avatar: r.dataValues.Tweet ? r.dataValues.Tweet.User.avatar : null,
        account: r.dataValues.Tweet ? r.dataValues.Tweet.User.account : null,
        name: r.dataValues.Tweet ? r.dataValues.Tweet.User.name :null,
        description: r.dataValues.Tweet ? r.dataValues.Tweet.description.substring(0, 160) : null,
        updatedAt: r.dataValues.Tweet ? r.dataValues.Tweet.updatedAt : null,
        replyCount: r.dataValues.Tweet ? r.dataValues.Tweet.Replies.length : null,
        likeCount: r.dataValues.Tweet ? r.dataValues.Tweet.Likes.length : null,

        isLiked: loginUser.Likes.map(l => l.TweetId).includes(r.TweetId)
      }))

      const isFollowed = user.follower.map(follower => follower.id).includes(loginUser.id)
      const isSubscribed = user.subscriber.map(user => user.id).includes(loginUser.id)

      let likes = true

      return res.render('user/userLikes', {
        data,
        userId: user.toJSON().id,
        cover: user.toJSON().cover,
        avatar: user.toJSON().avatar,
        account: user.toJSON().account,
        name: user.toJSON().name,
        introduction: user.toJSON().introduction,
        followingsCount: user.toJSON().following.length,
        followersCount: user.toJSON().follower.length,
        tweetsCount: user.toJSON().Tweets.length,
        likes,
        isFollowed,
        isSubscribed
      })
    })
  },

  getUserFollowers: (req, res) => {
    const reqUserId = req.params.userId
    return User.findByPk(reqUserId, {
      include: [
        Tweet,
        { model: User, as: 'follower' }
      ]
    }).then(data => {
      const tweetsCount = data.toJSON().Tweets.length
      const name = data.toJSON().name
      const userId = data.dataValues.id
      data = data.follower.map(r => ({
        ...r.dataValues,
        id: r.id,
        avatar: r.avatar,
        account: r.account,
        name: r.name,
        introduction: r.introduction ? r.introduction.substring(0, 140) : 0,
        followshipCreatedAt: r.Followship.createdAt,
        // 追蹤者人數
        followerCount: data.follower.length,
        isFollowed: helpers.getUser(req).following.map(d => d.id).includes(r.id)
      }))
      // 排序
      data = data.sort((a, b) => a.followshipCreatedAt - b.followshipCreatedAt)

      let followers = true

      return res.render('user/userFollowers', {
        userId,
        data,
        name: name,
        tweetsCount: tweetsCount,
        followers
      })
    })
  },

  getUserFollowings: (req, res) => {
    const reqUserId = req.params.userId
    return User.findByPk(reqUserId, {
      include: [
        Tweet,
        { model: User, as: 'following' }
      ]
    }).then(data => {
      const tweetsCount = data.toJSON().Tweets.length
      const name = data.toJSON().name
      const userId = data.dataValues.id
      data = data.following.map(r => ({
        ...r.dataValues,
        id: r.id,
        avatar: r.avatar,
        account: r.account,
        name: r.name,
        introduction: r.introduction ? r.introduction.substring(0, 140) : 0,
        followshipCreatedAt: r.Followship.createdAt,
        // 追蹤者人數
        isFollowed: helpers.getUser(req).following.map(d => d.id).includes(r.id)
      }))
      // 排序
      data = data.sort((a, b) => a.followshipCreatedAt - b.followshipCreatedAt)

      let followings = true

      return res.render('user/userFollowings', {
        userId,
        data,
        name: name,
        tweetsCount: tweetsCount,
        followings
      })
    })
  },

  putUserInfo: (req, res) => {
    const { name, introduction } = req.body
    const id = req.params.userId
    // check user auth
    if (helpers.getUser(req).id !== Number(id)) {
      req.flash('error_messages', '只能編輯自己的賬戶')
      return res.redirect('back')
    }
    if (!req.body.name) {
      req.flash('error_messages', "請填入名稱")
      return res.redirect('back')
    }
    const { files } = req
    // upload cover
    const uploadCover = new Promise((resolve, reject) => {
      let coverURL = ''
      if (files.cover) {
        imgur.setClientID(IMGUR_CLIENT_ID)
        imgur.upload(files.cover[0].path, (err, img) => {
          if (err) return reject(err)
          coverURL = img.data.link
          resolve(coverURL)
        })
      } else {
        coverURL = null
        resolve(coverURL)
      }
    })
    // upload avatar
    const uploadAvatar = new Promise((resolve, reject) => {
      let avatarURL = ''
      if (files.avatar) {
        imgur.setClientID(IMGUR_CLIENT_ID)
        imgur.upload(files.avatar[0].path, (err, img) => {
          if (err) return reject(err)
          avatarURL = img.data.link
          resolve(avatarURL)
        })
      } else {
        avatarURL = null
        resolve(avatarURL)
      }
    })
    // update All
    async function updateUser() {
      try {
        const [coverURL, avatarURL] = await Promise.all([uploadCover, uploadAvatar])
        return User.findByPk(id).then(user => {
          user.update({
            name: name,
            introduction: introduction,
            cover: coverURL || user.cover,
            avatar: avatarURL || user.avatar
          })
        }).then((user) => {
          req.flash('success_messages', '用戶資料更新成功')
          return res.redirect('/users/' + id + '/tweets')
        })
      } catch (err) {
        console.log('Error:', err)
      }
    }
    updateUser()
  },

  getUserInfo: (req, res) => {
    const id = req.params.userId
    const loginId = helpers.getUser(req).id
    // check user auth
    if (loginId !== Number(id)) {
      req.flash('error_messages', '只能編輯自己的賬戶')
      return res.redirect('/users/' + loginId + '/tweets')
    }
    return User.findByPk(id).then(user => {
      return res.render('user/userInfo', {
        ...user.toJSON()
      })
    })
  },

  apiGetUserInfo: (req, res) => {
    const id = req.params.userId
    const loginId = helpers.getUser(req).id
    // check user auth
    if (loginId !== Number(id)) {
      return res.json({ status: 'error', message: 'permission denied' })
    }
    return User.findByPk(id).then(user => {
      return res.json({
        ...user.toJSON()
      })
    })
  },

  apiPostUserInfo: (req, res) => {
    const id = req.params.userId
    const loginId = helpers.getUser(req).id
    const { name, introduction } = req.body
    // check user auth
    if (loginId !== Number(id)) {
      return res.json({ status: 'error', message: 'permission denied' })
    }
    return User.findByPk(id).then(user => {
      user.update({
        name: name,
        introduction: introduction
      })
    }).then(() => {
      return res.json({ status: 'success', message: 'Updated successfully' })
    }).catch(err => console.log(err))
  },

  //Top 10 followings
  topFollowing: (req, res) => {
    User.findAll({
      include: [{ model: User, as: 'follower' }]
    })
      .then(users => {
        users = users.map(user => ({
          ...user.dataValues,
          isFollowing: user.follower.map(follower => follower.id).includes(helpers.getUser(req).id)
        }))

        users.forEach((user, index, arr) => {
          if (user.role === "admin") {
            arr.splice(index, 1);
          }
        })

        //sort by the amount of the followers
        users.sort((a, b) => {
          return b.follower.length - a.follower.length
        })

        //more followers
        if (req.query.more) {
          more = more + 10
        }
        users = users.slice(0, more)
        
        User.findByPk(helpers.getUser(req).id)
        .then(logInUser => {
          return res.send({ users, logInUser })
        })
        
      })
  }
}

module.exports = userController