var socket = io()

const chatForm = document.getElementById('chat-form')
const chatMessages = document.getElementById('chat-messages')
const selector = document.querySelector('.selector')
const user = document.getElementById('userId')
const privateIcon = document.getElementById('private-icon')

//join the room in the beginning
const receiveId = window.location.pathname.split('/')[2]
socket.emit('joinRoom', { receiveId })

//alert
socket.on('alert', (data) => {
  //the alert will only show on the receiver page
  if (data.receiveId === user.value) {
    let htmlString = `
    <h6><i class="fas fa-envelope fa-lg m-2" id="private-icon"><div class="red-dot"></div></i>私人訊息 (${data.count})</h6>
    `
    privateIcon.innerHTML = htmlString
  }
})

socket.on('onlineUsers', (data) => {
  let htmlString = `
  <div class="room">${data.username} is online.</div>
  `
  chatMessages.innerHTML += htmlString
})

if (selector.value === 'public') {
//online user
  socket.on('online', (data) => {
    appendUserData(data)
  })

  

  socket.on('offline', (data) => {
    console.log('AAAAAAAAAaaaaa')
    //console.log('userList'+id.toString())
    var userList = document.getElementById('user-list')
    console.log(userList)
    var user = document.getElementById(`user-${data.id}`).parentNode
    console.log(user)
    userList.removeChild(user)
    
    // e.preventDefault()
    //user.remove()
  
  })
}

//send message
chatForm.addEventListener('submit', e => {
  e.preventDefault()
  const msg = e.target.message.value

  
  if (selector.value === 'public') {
    //public message
    socket.emit('publicMessage', msg)   
  }
  else {
    // const unreadCount = document.getElementById('unread-count')
    // console.log('unread-------')
    // console.log(unreadCount)
    // console.log(unreadCount.innerHTML)
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
chatForm.addEventListener('click', (e) => {
  userId = user.value
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
  const u = document.getElementById('user-list')
  let htmlString 
  htmlString = `
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
  `
  var div = document.createElement('div')
  div.className = 'list-group-item'
  div.innerHTML += htmlString
  u.appendChild(div)
}

function appendData(data) {
  const userId = user.value
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