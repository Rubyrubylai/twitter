const time = require('../config/handlebars-helpers').time
const db = require('../models')
const PublicChat = db.PublicChat
const PrivateChat = db.PrivateChat
const User = db.User
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
      onlineUsers.push({
        id: user.id,
        username: user.name,
        account: user.account,
        avatar: user.avatar
      })
      let set = new Set()
      onlineUsers = onlineUsers.filter((item) => !set.has(item.id) ? set.add(item.id) : false)
      
      

      if(user) {
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

      }
    }) 
  })
}
