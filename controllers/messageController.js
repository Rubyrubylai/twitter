const db = require('../models')
const User = db.User
const PublicChat = db.PublicChat
const PrivateChat = db.PrivateChat
const { Op } = require('sequelize')

const messageController = {
  getMessage: (req, res) => {
    PublicChat.findAll({
      raw: true,
      nest: true
    }).then(publicChat => {
      let public = true
      const loginUser = req.user
      return res.render('chat', { messages: publicChat, loginUser, public })
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
        const unreadMessage = privateChat.filter(p => {
          return p.receiveId === req.user.id && p.unread === 1
        })
        const unreadMessageCount = unreadMessage.length


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
        }}).then(privateChat => {
          
          
            console.log(privateChat)
            return res.render('chat', { messages: privateChat, users, unreadMessageCount })
          
          
        })
        
      })
    })    
  }
}

module.exports = messageController



