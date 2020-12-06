const db = require('../models')
const User = db.User
const PublicChat = db.PublicChat
const PrivateChat = db.PrivateChat
const Notice = db.Notice
const Tweet = db.Tweet
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
            return res.render('chat', { messages: privateChat, users })
        })  
      })
    })    
  },

  getPrivateMessageCount: (req, res) => {
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
      //未讀訊息
      const unreadMessage = privateChat.filter(p => {
        return p.receiveId === req.user.id && p.unread === 1
      })
      const unreadMessageCount = unreadMessage.length
    
      res.send({
        'success': true,
        'result': unreadMessageCount,
        'message': '資料拿取成功'
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
      include: [{ model: User, as: 'User', 
        include: [{ model: User, as: 'subscribed'
        }] 
      }],
      order: [[ 'updatedAt', 'DESC' ]]
    })
    .then(notices => { 
      return res.render('notice', { notices })
    })

  }
}

module.exports = messageController



