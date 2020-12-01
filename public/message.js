var socket = io()

const chatForm = document.getElementById('chat-form')
const chatMessages = document.getElementById('chat-messages')
const selector = document.querySelector('.selector')

if (selector.value === 'public') {
//online user
  socket.on('online', (data) => {
    appendUserData(data)
  })
    
  function appendUserData(data) {
    const u = document.getElementById('user-list')
    let htmlString 
    htmlString = `
      <div class="flex-container">
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
}

//join the room when enter private message page
const receiveId = window.location.pathname.split('/')[2]
if (selector.value === 'private') {
  socket.emit('joinRoom', { receiveId })
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


// const privateMessage = document.body.getElementById('private-message')
// privateMessage.addEventListener('click', e => {
//   //private message
//   const messageToId = window.location.pathname.split('/')[2]
//   console.log('cccc')
//   console.log(messageToId)
//   socket.emit('joinRoom', { messageToId, msg })
// })



//private message
socket.on('privateMessage', (data) => {
  appendData(data)

  chatMessages.scrollTop = chatMessages.scrollHeight
})

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

// //alert
// socket.on('alert', () => {
//   const privateMessage = document.getElementById('private-message')
//   let htmlString = `
//   <div style="border:4px red solid;border-radius:2px;" ></div>
//   `
//   console.log(htmlString)
//   privateMessage.appendChild((document.createElement('div'))).innerHTML = htmlString
// })