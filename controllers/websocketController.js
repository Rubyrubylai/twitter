const time = require('../config/handlebars-helpers').time
const db = require('../models')
const PublicChat = db.PublicChat
const PrivateChat = db.PrivateChat
const User = db.User


module.exports = (io, user, messageToId) => {
  io.on('connection', (socket) => {
    const currentUser = socket.request.session

    console.log('a user connected')

    // announce user online
    User.findOne({
      where: {
        id: socket.request.session.passport ? socket.request.session.passport.user : null
      }
    }).then(user => {
      if(user) {

        //online user
        io.emit('online', {
          id: user.id,
          username: user.name,
          account: user.account,
          avatar: user.avatar
        })

        // run when user disconnects
        socket.on('disconnect', () => {
          
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
          let count = 0
          if (msg) {
            count += 1
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
