const noticeBtn = document.querySelector('.notice-btn')
const noticeId = document.getElementById('noticeId')
const noticeIcon = document.getElementById('notice-icon')

//turn on notification
$('.notice-btn').click((e) => {
  const room = Number(noticeId.value)
  socket.emit('notice', room)
})

//post a tweet
$('#tweet').submit((e) => {
  const description = e.target.description.value
  const username = e.target.username.value
  if (description.length === 0) {
    e.preventDefault()
  }
  else if (description.length > 140) {
    e.preventDefault()
  }
  else {
    socket.emit('tweet', { description, userId, username })
  }
})

// notice subscriber that the subscriber post a tweet
socket.on('tweet', (data) => {
  notice(data)
  
})


//like a tweet or reply
$('.like-form').submit((e) => {
  let tweetId, tweetUserId, replyId, replyUserId
  const type = e.target.type.value
  if (type === 'tweet') {
    tweetId = Number(e.target.tweetId.value)
    tweetUserId = Number(e.target.tweetUserId.value)
  }
  else {
    tweetId = Number(e.target.tweetId.value)
    replyId = Number(e.target.replyId.value)
    replyUserId = Number(e.target.replyUserId.value)
  }
  var likesCount = Number(e.target.likesCount.value) + 1
  const form = e.target
  form.innerHTML = `
  <div class="flex-container">       
    <input type="hidden" class="tweetId" value="${tweetId}}">
    <input type="hidden" class="tweetUserId" value="${tweetUserId}">
    <input type="hidden" class="likesCount" value="${likesCount}">
    <button class="btn-push"><i class="fas fa-heart like-icon"></i></button>
    <div class="count">${likesCount}</div>
  </div>
  `
  socket.emit('like', { tweetId, tweetUserId, replyId, replyUserId, type })
  e.preventDefault()
})
  
socket.on('like', (data) => {  
  if(data.tweetUserId === userId) {
    notice(data)
  }
  if(data.replyUserId === userId) {
    notice(data)
  }
})

//post a tweetReply
$('#reply-form').submit((e) => {
  var comment = e.target.comment.value
  const tweetId = Number(e.target.tweetId.value)
  const tweetUserId = Number(e.target.tweetUserId.value)
  const avatar = e.target.avatar.value
  const name = e.target.name.value
  const account = e.target.account.value
  const tweetUserName = e.target.tweetUserName.value
  const time = e.target.time.value
  const commentNode = document.getElementById('comment')

  if (comment.length === 0) {
    e.preventDefault()
  }
  else if (comment.length > 100) {
    e.preventDefault()
  }
  else {
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
  if(data.tweetUserId === userId) {
    notice(data)
  }
})

//post a replyComment
$('#reply-comment-form').submit((e) => {
  console.log(e.target)
  var comment = e.target.comment.value
  e.preventDefault()    
  const tweetId = Number(e.target.tweetId.value)
  const replyId = Number(e.target.replyId.value)
  const replyUserId = Number(e.target.replyUserId.value)
  const avatar = e.target.avatar.value
  const name = e.target.name.value
  const account = e.target.account.value
  const replyUserName = e.target.replyUserName.value
  const time = e.target.time.value
  const commentReplyNode = document.getElementById('reply-comment')
  
  if (comment.length === 0) {
    e.preventDefault()
  }
  else if (comment.length > 100) {
    e.preventDefault()
  }
  else {
    const replyComments = document.getElementById('reply-comments')

    replyComments.innerHTML += `
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
        <font color="coral" size="2px">@${replyUserName}</font>
      </div>
    </div>
    `
    commentReplyNode.value = ''
    
    socket.emit('replyComment', { comment, userId, tweetId, replyId, replyUserId })
    e.preventDefault()    
  }
})

socket.on('replyComment', (data) => {  
  if(data.replyUserId === userId) {
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
  if(data.followingId === userId) {
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
  var newNode = document.createElement('div')
  newNode.className = 'notice'
  newNode.innerHTML = `
  <a href="/tweets/${data.tweetId}/replies">
    <div class="flex-container">
    <img src="${data.avatar}" alt="user avatar" class="user-avatar">
      <div class="desc flex-container">
        <span>${data.noticeDescription}</span> 
        <font class="text-muted tweet-desc">${data.description}</font>
      </div>
    </div>
  </a> `
  if (noticeList.children[0]) {
    noticeList.insertBefore(newNode, noticeList.children[0])
  }
  else {
    noticeList.appendChild(newNode)
  } 
  
}