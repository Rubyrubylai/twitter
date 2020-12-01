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
          console.log('user disconnected')
          io.emit('message')
        })
    
        // listen for chat message
        socket.on('publicMessage', (msg) => {
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
          console.log(msg)
        })
    
        // room
        socket.on('joinRoom', ({ messageToId, msg }) => {
          console.log('----------------')
          console.log(messageToId)
          console.log(user.id)
          PrivateChat.create({
            sendId: user.id,
            receiveId: messageToId,
            msg: msg
          })
          //const roomId = messageToId || user.id.toString() 
          socket.join(messageToId || user.id.toString())
          io.to(user.id.toString()).to(messageToId).emit('privateMessage', {
            id: user.id,
            username: user.name,
            account: user.account,
            avatar: user.avatar,
            message: msg,
            time: time(new Date())
          })
    
          //io.to(messageToId).emit('alert')
        })
      }
    }) 
  })
}
