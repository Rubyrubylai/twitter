const db = require('../models')
const User = db.User
const PublicChat = db.PublicChat
const PrivateChat = db.PrivateChat

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
      
        include: [ User ]
      
    }).then(privateChat =>{

      console.log(privateChat)
      const loginUser = req.user
      return res.render('chat', { messages: privateChat, loginUser })
    })
  }
}

module.exports = messageController