var socket = io()

const chatMessages = document.getElementById('chat-messages')
const privateIcon = document.getElementById('private-icon')
const userList = document.getElementById('user-list')
const user = document.getElementById('userId')
const userId = Number(user.value)

//join the room in the beginning
const receiveId = window.location.pathname.split('/')[2]
socket.emit('joinRoom', { receiveId })

//alert
socket.on('alertNotice', (data) => {
  //the alert will only show on the receiver page
  console.log('------------data')
  console.log(data.receiveId)
  if (data.receiveId === userId) {
    let htmlString = `
    <h6><i class="fas fa-bell fa-lg m-2"></i><div class="red-dot"></div></i>通知 (${data.count})</h6>
    `
    noticeIcon.innerHTML = htmlString
  }
})

//alert
socket.on('alert', (data) => {
  //the alert will only show on the receiver page
  if (data.receiveId === userId) {
    let htmlString = `
    <h6><i class="fas fa-envelope fa-lg m-2" id="private-icon"><div class="red-dot"></div></i>私人訊息 (${data.count})</h6>
    `
    privateIcon.innerHTML = htmlString
  }
})


if ($('.selector').val() === 'public') {
//online user
  socket.on('online', (data) => {
    userList.innerHTML = ''
    data.forEach(data => {
      appendUserData(data)
    })
    
  })

  socket.on('offline', (data) => {
    var user = document.getElementById(`user-${data.id}`).parentNode
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

//read
$('#chat-form').click(e => {
  let htmlString = `
  <h6><i class="fas fa-envelope fa-lg m-2" id="private-icon"></i>私人訊息</h6>
  `
  privateIcon.innerHTML = htmlString
  socket.emit('read', { userId, receiveId })
})

//private message
socket.on('privateMessage', (data) => {
  appendData(data)

  chatMessages.scrollTop = chatMessages.scrollHeight
})



  
function appendUserData(data) {
  let htmlString 
  htmlString = `
  <div class="list-group-item">
    <div class="flex-container" id="user-${data.id}">
      <div class="mr-2">
        <a href="/users/${data.id}/tweets">
          <img src="${data.avatar}" alt="user avatar" class="user-avatar"
            style="border-radius: 50%; height:50px; width: 50px">
        </a>
      </div>
      <div style="display: flex; align-items: center">
        <a href="/users/${data.id}/tweets" style="text-decoration:none; color:black"><strong>${data.username}</strong></a>
        <font class="text-muted"> @${data.account}</font>
      </div>
    </div>
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