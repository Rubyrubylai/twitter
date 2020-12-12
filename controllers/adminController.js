const db = require('../models')
const { User, Tweet, Like } = db


const adminControllers = {
  getTweets: (req, res) => {
    return Tweet.findAll({
      raw: true,
      nest: true,
      order: [['createdAt', 'DESC']],
      include: [{ model: User }]
    })
      .then(tweets => {
        tweets = tweets.map(tweet => ({
          ...tweet,
          description: tweet.description.substring(0, 200),
        }))

        return res.render('admin/tweets', { tweets })
      })
  },

  deleteTweet: (req, res) => {
    return Tweet.findByPk(req.params.id)
      .then(tweet => {
        tweet.destroy()
          .then(tweet => {
            res.redirect('/admin/tweets')
          })
      })
  },

  getUsers: (req, res) => {
    return User.findAll({
      // where: { role: 'user' },
      nest: true,
      include: [
        { model: Like },
        { model: Tweet },
        { model: User, as: 'following' },
        { model: User, as: 'follower' },
      ],
    }).then(users => {
      users = users.sort((a, b) => b.Tweets.length - a.Tweets.length)
      res.render('admin/users', { users })
    })
  },
}

module.exports = adminControllers