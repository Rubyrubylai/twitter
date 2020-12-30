var socket = io()

const chatMessages = document.getElementById('chat-messages')
const userList = document.getElementById('user-list')
const user = document.getElementById('userId')
const userId = Number(user.value)

//join the room in the beginning
const receiveId = Number(window.location.pathname.split('/')[2])
socket.emit('joinRoom', { receiveId })

//alert notice
socket.on('alertNotice', (data) => {
  //the alert will only show on the receiver page
  if (data.receiveId === userId) {
    $('#notice-icon').html(`
    <h6><i class="fas fa-bell fa-lg nav-icon"><div class="red-dot-notice"></div></i>通知 (${data.count})</h6>
    `)
  }
})

//read notice
$('#notice-icon').click(() => {
  $('#notice-icon').html(`
  <h6><i class="fas fa-bell fa-lg nav-icon"></i>通知</h6>
  `
  )
  socket.emit('readNotice', { userId })
})



//alert private and public message
socket.on('alert', (data) => {
  // var publicChat = data.publicChat
  // let unreadCount = 0
  // publicChat = publicChat.forEach(p => {
  //   if (p.unread === 1 & p.UserId !== userId) {
  //     unreadCount += 1
  //   }
  // })
  // unreadCount += 1
  // if (data.public && data.userId !== userId) {
  //   $('#public-icon').html(`
  //     <h6><i class="fas fa-comments nav-icon"><div class="red-dot-public"></div></i>公開聊天室 (${unreadCount})</h6>
  //   `)
  // }

  //the alert will only show on the receiver page
  if (data.receiveId === userId) {
    $('#private-icon').html(`
    <h6><i class="fas fa-envelope fa-lg nav-icon"><div class="red-dot-private"></div></i>私人訊息 (${data.count})</h6>
    `)
  }
})

//read private
// $('#chat-form').click(() => {
//   $('#private-icon').html(`
//   <h6><i class="fas fa-envelope fa-lg nav-icon"></i>私人訊息</h6>
//   `)
//   socket.emit('read', { userId, receiveId })
// })

//read public
// $('#public-icon').click(() => {
//   $('#public-icon').html(`
//     <h6><i class="fas fa-comments nav-icon"></i>公開聊天室</h6>
//   `)
//   let public = true
//   socket.emit('read', { userId, receiveId, public })
// })

if ($('.selector').val() === 'public') {
//online user
  socket.on('online', (data) => {
    userList.innerHTML = ''
    data.forEach(data => {
      appendUserData(data)
    })
    
  })

  socket.on('offline', (data) => {
    let user = document.getElementById(`user-${data.id}`).parentNode
    userList.removeChild(user)
  })
}

//send message
$('#chat-form').submit(e => {
  e.preventDefault()
  const msg = e.target.message.value

  
  if ($('.selector').val() === 'public') {
    //public message
    socket.emit('publicMessage', msg)   
  }
  else {
    //private message
    socket.emit('privateMessage', { receiveId, msg })
  }
  //clear inputs
  e.target.elements.message.value = ''
})

//public message
socket.on('publicMessage', (data) => {
  appendData(data)

  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight
})

//private message
socket.on('privateMessage', (data) => {
  appendData(data)

  chatMessages.scrollTop = chatMessages.scrollHeight
})



  
function appendUserData(data) {
  let htmlString 
  htmlString = `
  <div class="user-list" id="user-${data.id}">
    <a href="/users/${data.id}/tweets">
    <div class="flex-container">
      <img src="${data.avatar}" alt="user avatar" class="user-avatar">
      <div class="flex-container">
        <p>${data.username}</p>
        <font class="text-muted"> @${data.account}</font>
      </div>
    </div>
    </a>
  </div>
  `
  userList.innerHTML += htmlString
}

function appendData(data) {
  let htmlString
  if (Number(data.id) === Number(userId)) {
    htmlString = `
      <div class="send-messages">
        <div>
          <div class="send-message">
          ${data.message}
          </div>
          <div class="time text-muted">${data.time}</div> 
        </div> 
      </div>
    `
  } 
  else {
    htmlString = `
    <div class="receive-messages">
      <div>
        <img src="${data.avatar}" class="user-avatar">
      </div>
      <div>
        <div class="receive-message">
        ${data.message}
        </div>
        <div class="time text-muted">${data.time}</div>
      </div>
    </div>
    `
  }
  chatMessages.appendChild((document.createElement('div'))).innerHTML = htmlString
}