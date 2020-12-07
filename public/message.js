var socket = io()

const chatForm = document.getElementById('chat-form')
const chatMessages = document.getElementById('chat-messages')
const selector = document.querySelector('.selector')
const user = document.getElementById('userId')
const privateIcon = document.getElementById('private-icon')
const userList = document.getElementById('user-list')
const noticeBtn = document.querySelector('.notice-btn')
const noticeId = document.getElementById('noticeId')

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

//post a tweet
$('#tweet').submit((e) => {
  console.log(e.target.description.value)
  const description = e.target.description.value
  if (!description) {
    e.preventDefault()
  }
  if (description.length > 140) {
    e.preventDefault()
  }
  else {
    userId = user.value
    socket.emit('tweet', { description, userId })
  }
})

// notice subscriber that the subscriber post a tweet
socket.on('tweet', (data) => {
  const noticeList = document.getElementById('notice-list')

  noticeList.innerHTML += `
  <div class="notice">
    <a href="/tweets/${data.tweetId}/replies">
      <img src="${data.avatar}" alt="user avatar" class="user-avatar">
      <p class="notice-desc">${data.noticeDescription}</p>
    </a>
  </div>
  `
})

//like a tweet
$('.like-form').submit((e) => {
  const tweetId = e.target.tweetId.value
  const tweetUserId = e.target.tweetUserId.value
  var likesCount = Number(e.target.likesCount.value) + 1
  const form = e.target
  form.innerHTML = `
  <form action="/tweets/${tweetId}/unlike" method="POST" style="float:left;">
    <button type="submit" class="btn-push"><i class="fas fa-heart" style="color: rgb(224, 36, 94);"></i></button>
    <div style="float:right;">${likesCount}</div>
  </form>
  
  `
  socket.emit('like', { tweetId, tweetUserId })
  e.preventDefault()
})
  
socket.on('like', (data) => {  
  if(data.tweetUserId === user.value) {
    const noticeList = document.getElementById('notice-list')

    noticeList.innerHTML += `
    <div class="notice">
      <a href="/tweets/${data.tweetId}/replies">
        <img src="${data.avatar}" alt="user avatar" class="user-avatar">
        <p class="notice-desc">${data.noticeDescription}</p>
      </a>
    </div>
    `
  }
  
})

//turn on notification
$('.notice-btn').click((e) => {
  const room = noticeId.value
  socket.emit('notice', room)
})

if (selector.value === 'public') {
  
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