const db = require('../models')
const Tweet = db.Tweet
const Like = db.Like
const User = db.User
const Reply = db.Reply
const ReplyComment = db.ReplyComment

let more = 10
const helpers = require('../_helpers')

const tweetController = {
  getTweets: (req, res) => {
    Tweet.findAll({
      include: [
        Like,
        Reply,
        { model: User, include: [{ model: User, as: 'follower' }] }],
      order: [['updatedAt', 'DESC']]
    }).then(tweets => {
      const loginUser = helpers.getUser(req)

      tweets = tweets.map(tweet => ({
        ...tweet.dataValues,
        likesCount: tweet.dataValues ? tweet.dataValues.Likes.length : null,
        repliesCount: tweet.dataValues ? tweet.dataValues.Replies.length : null,
        user: tweet.dataValues ? tweet.dataValues.User.dataValues : null,
        followerId: tweet.dataValues ? tweet.dataValues.User.dataValues.follower.map(follower => follower.dataValues.id) : null,
        isLiked: loginUser.Likes.map(like => like.TweetId).includes(tweet.id)
      }))

      //filter the tweets to those that user followings & user himself
      tweetFollowings = []
      tweets.forEach(tweet => {
        if (tweet.UserId === loginUser.id) {
          tweetFollowings.push(tweet)
        }
        tweet.followerId.forEach(followerId => {
          if (followerId === loginUser.id) {
            tweetFollowings.push(tweet)
          }
        })
      })



      return res.render('tweets', { tweetFollowings })

    })

  },

    getReply: (req, res) => {
    Tweet.findByPk(req.params.tweetId,
      {
        include: [
          Like,
          User,
          {
            model: Reply, include: [
              User,
              Like,
              { model: ReplyComment, include: [User] }
            ]
          }
        ],
        
      }
    )
      .then(tweet => {
        if (tweet) {
          tweet = tweet.toJSON()
        const loginUser = helpers.getUser(req)

        //like and dislike tweet
        const isLikedTweet = loginUser.Likes.map(likes => likes.TweetId).includes(tweet.id)

        //like and dislike reply
        tweetReplies = tweet.Replies.map(reply => ({
          ...reply,
          isLikedReply: reply.Likes.map(like => like.UserId).includes(loginUser.id)
        }))

        tweetReplies = tweetReplies.sort((a, b) => {
          return a.updatedAt - b.updatedAt
        })

        //Top 10 followers
        User.findAll({
          include: [{ model: User, as: 'follower' }]
        })
          .then(users => {
            users = users.map(user => ({
              ...user.dataValues,
              isFollowing: user.follower.map(follower => follower.id).includes(loginUser.id)
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

            const now = new Date()

            return res.render('tweet', { tweet, isLikedTweet, tweetReplies, users, now })
          })
        }
        else {
          return res.render('delete', { message: '此則貼文已被作者刪除'})
        }
      })
  },

  getNoReply: (req, res) => {
    return res.render('delete', { message: '此則留言已被作者刪除'})
  },

  deleteTweet: (req, res) => {
    Tweet.findByPk(req.body.tweetId)
      .then(tweet => {
        tweet.destroy()
          .then(tweet => {
            return res.send('delete tweet')
          })
      })
  },

  deleteReply: (req, res) => {
    Reply.findByPk(req.body.replyId)
      .then(reply => {
        reply.destroy()
          .then(reply => {
            return res.send('delete reply')
          })
      })
  },

  editTweet: (req, res) => {
    Tweet.findByPk(req.body.tweetId)
      .then(tweet => {
        tweet.update({
          description: req.body.updatedDesc
        })
        .then(tweet => {
          return res.send('update tweet')
        })
      })
  },

  editReply: (req, res) => {
    Reply.findByPk(req.body.replyId)
    .then(reply => {
      reply.update({
        comment: req.body.updatedDesc
      })
      .then(reply => {
        return res.send('edit reply')
      })
    })
  }
}

module.exports = tweetController