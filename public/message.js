var socket = io()

const chatForm = document.getElementById('chat-form')
const chatMessages = document.getElementById('chat-messages')
const selector = document.querySelector('.selector')
const userId = document.getElementById('userId')

//join the room when enter private message page
const receiveId = window.location.pathname.split('/')[2]
socket.emit('joinRoom', { receiveId })

console.log('-----------')
console.log(userId.value)
//alert
socket.on('alert', (data) => {
  if (data.receiveId === userId.value) {
    const privateIcon = document.getElementById('private-icon')
  
    let htmlString = `
    <font size="4" color="red">${data.count}</font>
    `
    privateIcon.innerHTML = htmlString
  }
  
})

// if (selector.value === 'public') {
// //online user
//   socket.on('online', (data) => {
//     appendUserData(data)
//   })

  // socket.on('offline', (id) => {
  //   console.log('AAAAAAAAAaaaaa')
  //   const user = document.getElementById(id.toString())
  //   console.log(user)
    
  //   user.remove()
  
  // })
// }

//send message
chatForm.addEventListener('submit', e => {
  e.preventDefault()
  const msg = e.target.message.value

  
  if (selector.value === 'public') {
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
  const u = document.getElementById('user-list')
  let htmlString 
  htmlString = `
    <div class="flex-container" id="${data.id}">
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
  div.innerHTML = htmlString
  u.appendChild(div)
}

function appendData(data) {
  const loginUserId = document.getElementById('loginUserId').value
  const el = document.getElementById('chat-messages')
  let htmlString
  if (Number(data.id) === Number(loginUserId)) {
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
  el.appendChild((document.createElement('div'))).innerHTML = htmlString
}