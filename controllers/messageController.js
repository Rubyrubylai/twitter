const db = require('../models')
const User = db.User
const PublicChat = db.PublicChat
const PrivateChat = db.PrivateChat
const { Op } = require("sequelize")

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
      //remove the user himself
      users = users.filter(user => { return user.id !== req.user.id })

      const loginUser = req.user
      
      //private messages that are sent to individuals
      PrivateChat.findAll({ where: {
        [Op.or]: [ {
          UserId: req.user.id,
          receiveId: req.params.userId
        }, {
          UserId: req.params.userId,
          receiveId: req.user.id
        }]
      }})
      .then(privateChat => {
        return res.render('chat', { messages: privateChat, loginUser, users })
      })
    })
  }
}

module.exports = messageController