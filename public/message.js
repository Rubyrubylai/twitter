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
  notice(data)
  
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
    notice(data)
  }
})

//post a tweetReply
$('#reply-form').submit((e) => {
  console.log(e.target.tweetId.value)
  console.log(e.target.tweetUserId.value)
  var comment = e.target.comment.value
  const tweetId = e.target.tweetId.value
  const tweetUserId = e.target.tweetUserId.value
  const avatar = e.target.avatar.value
  const name = e.target.name.value
  const account = e.target.account.value
  const tweetUserName = e.target.tweetUserName.value
  const time = e.target.time.value
  const commentNode = document.getElementById('comment')

  if (!comment) {
    e.preventDefault()
  }
  if (comment.length > 100) {
    e.preventDefault()
  }
  else {
    userId = user.value
    const tweetReplies = document.getElementById('tweetReplies')

    tweetReplies.innerHTML += `
    <div class="flex-container mb-2">
      <div>
        <a href="/users/${userId}/tweets">
          <img class="mr-3 user-avatar" src="${avatar}" alt="user avatar">
        </a>
      </div>
      <div>
        <a href="/users/${userId}/tweets
        " style="text-decoration:none; color:black"><strong>${name}</strong></a>
        <font color="grey">@${account} • ${time}</font>
        <p>
        ${comment}
        </p>
        <font color="grey" size="2px">回覆給</font>
        <font color="coral" size="2px">@${tweetUserName}</font>
      </div>
    </div>
    `
    commentNode.value = ''
    
    socket.emit('reply', { comment, userId, tweetId, tweetUserId })
    e.preventDefault()    
  }
})

socket.on('reply', (data) => {  
  if(data.tweetUserId === user.value) {
    notice(data)
  }
})

//follow a tweet
$('.follow-form').submit((e) => {
  const followingId = Number(e.target.followingId.value)
  const form = e.target
  form.innerHTML = `
  <form action="/followships/${followingId}?_method=DELETE" method="POST">
  <button type="submit" class="btn btn-outline-twitter-active rounded-pill">正在跟隨</button>
</form>
  
  `
  socket.emit('follow', followingId)
  e.preventDefault()
})

socket.on('follow', (data) => {  
  if(data.followingId === Number(user.value)) {
    const noticeList = document.getElementById('notice-list')

    noticeList.innerHTML += `
    <div class="notice">
    <a href="/users/${data.followingId}/tweets">
      <div class="flex-container">
      <img src="${data.avatar}" alt="user avatar" class="user-avatar">
        <div class="desc flex-container">
          <span>${data.noticeDescription}</span> 
        </div>
      </div>
    </a> 
    </div>
    `
  }
})

function notice(data) {
  const noticeList = document.getElementById('notice-list')

  noticeList.innerHTML += `
  <div class="notice">
  <a href="/tweets/${data.tweetId}/replies">
    <div class="flex-container">
    <img src="${data.avatar}" alt="user avatar" class="user-avatar">
      <div class="desc flex-container">
        <span>${data.noticeDescription}</span> 
        <font class="text-muted tweet-desc">${data.description}</font>
      </div>
    </div>
  </a> 
  </div>
  `
}

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