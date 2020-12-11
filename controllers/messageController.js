const db = require('../models')
const User = db.User
const PublicChat = db.PublicChat
const PrivateChat = db.PrivateChat
const Notice = db.Notice
const Tweet = db.Tweet
const Like = db.Like
const Reply = db.Reply
const ReplyComment = db.ReplyComment
const Followship = db.Followship
const Subscribeship = db.Subscribeship
const { Op } = require('sequelize')

const messageController = {
  getMessage: (req, res) => {
    PublicChat.findAll({
      raw: true,
      nest: true,
      include: [ User ]
    }).then(publicChat => {
      let public = true
     
      return res.render('chat', { messages: publicChat, public })
    })
  },

  getPrivateMessage: (req, res) => {
    //update to read
    PrivateChat.update({ unread: false }, { 
      where: {
        UserId: req.params.userId,
        receiveId: req.user.id
      }
    })
    .then(p => {
      PrivateChat.findAll({
        raw:true,
        nest: true,
        where: {
          [Op.or]: [
            { UserId: req.user.id },
            { receiveId: req.user.id },
          ]
        },
        include: [{ model: User, as: 'Receiver' },
        { model: User, as: 'Sender' }]
      }).then(privateChat => {
        //users that had been chatted before
        const receivers = privateChat.map(p => ({
          ...p.Receiver
        }))
        const senders = privateChat.map(p => ({
          ...p.Sender
        }))
        let users = []
        receivers.forEach(r => {
          users.push(r)
        })
        senders.forEach(s => {
          users.push(s)
        })

        //remove the repeated users
        users = [...new Set(users.map(item => JSON.stringify(item)))].map(item => JSON.parse(item))
        
        //private messages that are sent to individuals
        PrivateChat.findAll({ where: {
          [Op.or] : [{
            UserId: req.params.userId,
            receiveId: req.user.id
          }, {
            UserId: req.user.id,
            receiveId: req.params.userId
            }]
          },
          include: [{ model: User, as: 'Sender' }]
        }).then(privateChat => {
          
          User.findByPk(req.params.userId)
          .then(userTo => {
            return res.render('chat', { messages: privateChat, users, userTo })
          })
        })  
      })
    })    
  },

  getCount: (req, res) => {
    //未讀私人訊息
    PrivateChat.findAll({
      raw:true,
      nest: true,
      where: {
        [Op.or]: [
          { UserId: req.user.id },
          { receiveId: req.user.id },
        ]
      },
      include: [{ model: User, as: 'Receiver' },
      { model: User, as: 'Sender' }]
    }).then(privateChat => {
      
      const unreadMessage = privateChat.filter(p => {
        return p.receiveId === req.user.id && p.unread === 1
      })
      const privateCount = unreadMessage.length

      //未讀公開訊息
      PublicChat.findAll({
        raw: true,
        nest: true,
        where: {
          [Op.and]: [{
            unread: true,
            [Op.not]: [
              { UserId: req.user.id },
            ]
          }]
        }
      })
      .then(publicChat => {
        const publicCount = publicChat.length

        //未讀通知
        Notice.findAll({
          raw:true,
          nest: true,
          where: {
            [Op.and]: [
              { UserId: req.user.id },
              { unread: true },
            ]
          }
        }).then(notice => {
          const noticeCount = notice.length

          res.send({
            privateCount,
            publicCount,
            noticeCount
          })
        })
      })
      
      
    })
  },

  getNotice: (req, res) => {
    Notice.findAll({ 
      raw: true,
      nest: true,
      where: {
        UserId: req.user.id
      },
      include: [
      { model: Tweet, 
        include: [ User ] 
      },
      { model: Like, 
        include: [ User, Tweet, Reply ] 
      },
      { model: Reply, 
        include: [ User, Tweet ] 
      },
      { model: ReplyComment, 
        include: [ User, Reply ] 
      }
      ],
      order: [[ 'updatedAt', 'DESC' ]],
      limit: 15
    })
    .then(notices => {
      var results = []
      noticePromise = new Promise((resolve, reject) => {
        for (let notice of notices ) {
          User.findByPk(notice.notifierId).then(user => {
            if (notice.notifierId) {
              notice['Notifier'] = user.dataValues
              results.push(notice)
              resolve(results)
            }
            else {
              results.push(notice)
            }  
          })
        }
      })
      
      noticePromise.then(results => {
        results.sort((a, b) => {
          return b.createdAt - a.createdAt
        })
      })
      return res.render('notice', { results })
    })
  },

  deleteSubscribed: (req, res) => {
    Subscribeship.destroy({ where: {
        subscriberId: req.user.id,
        subscribedId: req.body.subscribedId
      }
    })
    .then(subscribship => {
      return res.send('delete subscribe')
    })
  }
}

module.exports = messageController



