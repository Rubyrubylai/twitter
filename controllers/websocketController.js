const time = require('../config/handlebars-helpers').time
const db = require('../models')
const PublicChat = db.PublicChat
const PrivateChat = db.PrivateChat
const Tweet = db.Tweet
const User = db.User
const Subscribeship = db.Subscribeship
const Notice = db.Notice
const Like = db.Like
const Reply = db.Reply
const Followship = db.Followship
const { Op } = require('sequelize')

let onlineUsers = []
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('a user connected')

    // announce user online
    User.findOne({
      where: {
        id: socket.request.session.passport ? socket.request.session.passport.user : null
      }
    }).then(user => {
      
      if(user) {
        const avatar = user.avatar
        const userId = Number(user.id)

        onlineUsers.push({
          id: user.id,
          username: user.name,
          account: user.account,
          avatar: user.avatar
        })
        let set = new Set()
        onlineUsers = onlineUsers.filter((item) => !set.has(item.id) ? set.add(item.id) : false)

        // online user
        io.emit('online', onlineUsers )

        // run when user disconnects
        socket.on('disconnect', () => {
          onlineUsers = onlineUsers.filter((item) => item.id !== user.id)
          console.log('--------online')
          console.log(onlineUsers)
          io.emit('offline', { id: user.id })
          console.log('user disconnected')
        })
    
        // listen for chat message
        socket.on('publicMessage', (msg) => {
          if (msg) {
            PublicChat.create({
              UserId: user.id,
              message: msg
            })
            // broadcast to everyone
            io.emit('publicMessage', {
              id: user.id,
              username: user.name,
              account: user.account,
              avatar: user.avatar,
              message: msg,
              time: time(new Date())
            })
          }
        })

        
        // room
        socket.on('joinRoom', ({ receiveId }) => {
          socket.join(receiveId+user.id.toString() || user.id.toString()+receiveId) 
        })

        
        socket.on('privateMessage', ({ receiveId, msg }) => {
          PrivateChat.findAll({
            raw: true,
            nest: true,
            where: {
              [Op.and]: [
                { receiveId: receiveId },
                { unread: true },
              ]
            }
          }).then(privateChat => {
            let count = privateChat.length
            if (msg) {
              count ++
              PrivateChat.create({
                UserId: user.id,
                receiveId: receiveId,
                message: msg,
                unread: true
              })
              io.to(receiveId+user.id.toString()).to(user.id.toString()+receiveId).emit('privateMessage', {
                id: user.id,
                username: user.name,
                account: user.account,
                avatar: user.avatar,
                message: msg,
                time: time(new Date())
              })
              io.emit('alert', {
                count,
                receiveId
              })
            } 
          })
          
        })

        //read
        socket.on('read', ({ userId, receiveId }) => {
          PrivateChat.update({ unread: false }, { 
            where: {
              UserId: Number(receiveId),
              receiveId: Number(userId)
            }
          })
        })

        //add to the room which user subscribes
        Subscribeship.findAll({ where: {
            subscriberId: user.id
          } 
        }).then(subscribe => {
          subscribe.forEach(item => {
            socket.join(item.subscribedId)
          })
        })

        //when receive the notification
        socket.on('notice', (room) => {
          Subscribeship.create({
            subscriberId: user.id,
            subscribedId: Number(room)            
          })
          socket.join(room)
        })

        //when receive the subscribed post a tweet
        socket.on('tweet', (data) => {
          const userId = data.userId
          const description = data.description
          
          
          Tweet.create({
            description,
            UserId: userId
          }).then(tweet => {
            Subscribeship.findAll({ 
              raw: true,
              nest:true,
              where: {
                subscribedId: userId
              }
            })
            .then(subscribeship => {
              id = Number(userId) - 1
              const noticeDescription = `User${id}發布了新貼文`
              const description = tweet.description
              var results = []
              subscribeship.forEach(items => {
                results.push(
                  Notice.create({
                    description: noticeDescription,
                    UserId: items.subscriberId,
                    unread: true,
                    TweetId: tweet.id
                  })
                )
              })
              return Promise.all(results).then(() => {
                const tweetId = tweet.id
                socket.to(userId).emit('tweet', { noticeDescription, avatar, tweetId, description })
              })
            })
           
          })
        })

        //like
        socket.on('like', (data) => {
          var { tweetId, tweetUserId, replyId, replyUserId, type } = data
          id = userId - 1
          if (type === 'tweet') {
            const noticeDescription = `User${id}喜歡你的貼文`
            Like.create({
              UserId: user.id,
              TweetId: tweetId
            })
            .then(like => {
              Notice.create({
                description: noticeDescription,
                UserId: tweetUserId,
                unread: true,
                LikeId:  like.id
              }).then(notice => {
                Tweet.findByPk(tweetId)
                .then(tweet => {
                  const description = tweet.description
                  io.emit('like', { noticeDescription, avatar, tweetId, tweetUserId, description })
                })
              })
            })
          }
          else {
            const noticeDescription = `User${id}喜歡你的留言`
            Like.create({
              UserId: user.id,
              ReplyId: replyId
            })
            .then(like => {
              Notice.create({
                description: noticeDescription,
                UserId: replyUserId,
                unread: true,
                LikeId: like.id
              }).then(notice => {
                Reply.findByPk(replyId)
                .then(reply => {
                  const description = reply.comment
                  io.emit('like', { noticeDescription, avatar, tweetId, description, replyUserId, replyId })
                })
                
              })
            })
          }
          
        })

        //when receive others reply
        socket.on('reply', (data) => {
          const { userId, comment, tweetId, tweetUserId } = data

          Reply.create({
            UserId: Number(userId),
            TweetId: Number(tweetId),
            comment
          }).then(reply => {
            id = Number(userId) - 1
            const noticeDescription = `User${id}回覆你的貼文`

            Notice.create({
              description: noticeDescription,
              UserId: Number(tweetUserId),
              unread: true,
              ReplyId: reply.id
            }).then(notice => {
              const description = reply.comment
              io.emit('reply', { noticeDescription, avatar, tweetId, tweetUserId, description })
            })
           
          })
        })

         //follow
         socket.on('follow', (followingId) => {
          followingId = Number(followingId)
          Followship.create({
            followerId: userId,
            followingId: followingId
          })
          .then(followship => {
            id = userId - 1
            const noticeDescription = `User${id}追蹤你`

            Notice.create({
              description: noticeDescription,
              UserId: followingId,
              unread: true
            }).then(notice => { 
              io.emit('follow', { noticeDescription, avatar, followingId }) 
            })
          })
        })

      }
    }) 
  })
}
