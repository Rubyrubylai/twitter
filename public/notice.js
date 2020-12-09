const noticeBtn = document.querySelector('.notice-btn')
const noticeId = document.getElementById('noticeId')
const noticeIcon = document.getElementById('notice-icon')

//turn on notification
$('.notice-btn').click((e) => {
  const room = Number(noticeId.value)
  socket.emit('notice', room)
})

function subscribe(obj) {
  const subscribedId = Number($(obj).children('#subscribedId').val())
  const form = $(obj).parent()
  form.html(`
  <button onclick="unsubscribe(this)" class="btn-push">
    <input type="hidden" id="subscribedId" value="${subscribedId}">
    <i class="far fa-bell-slash fa-2x mt-1 mx-2" style="color: rgb(255, 102, 0);"></i>
  </button>
  `)
  socket.emit('notice', subscribedId)
}

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
function like(obj) {
  const type = $(obj).siblings('.type').val()
  const type2 = $(obj).siblings('.type2').val()
  const tweetId = Number($(obj).siblings('.tweetId').val())
  const tweetUserId = Number($(obj).siblings('.tweetUserId').val())
  const replyId = Number($(obj).siblings('.replyId').val())
  const replyUserId = Number($(obj).siblings('.replyUserId').val())
  
  var likesCount = Number($(obj).siblings('.count').text()) + 1
  const form = $(obj).parent()
  console.log(form)
  form.html(`
      <div class="flex-container">       
        <input type="hidden" class="tweetId" value="${tweetId}">
        <input type="hidden" class="tweetUserId" value="${tweetUserId}">
        <input type="hidden" class="likesCount" value="${likesCount}">
        <input type="hidden" class="replyId" value="${replyId}">
        <input type="hidden" class="replyUserId" value="${replyUserId}">
      </div>
  `)
  if (type2 === 'tweetLike') {
    form.children().append(`
      <input type="hidden" class="type2" value="tweetLike">
      <button onclick="dislike(this)" class="btn-push"><i class="fas fa-heart fa-lg like-icon"></i></button>
    `)
    $('#tweet-like').text(likesCount)
  }
  else {
    form.children().append(`
      <button onclick="dislike(this)" class="btn-push"><i class="fas fa-heart like-icon"></i></button>
      <div class="count">${likesCount}</div> 
    `)
  }
  
  if (type === 'tweet') {
    form.children().append('<input type="hidden" class="type" value="tweet"></input>')
  }
  else {
    form.children().append('<input type="hidden" class="type" value="reply"></input>')
  }
  socket.emit('like', { tweetId, tweetUserId, replyId, replyUserId, type })
}

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
  var comment = $(obj).siblings('.comment').val()
  const tweetId = Number($(obj).siblings('.tweetId').val())
  const tweetUserId = Number($(obj).siblings('.tweetUserId').val())
  const avatar =$(obj).siblings('.avatar').val()
  const name = $(obj).siblings('.name').val()
  const account =$(obj).siblings('.account').val()
  const tweetUserName = $(obj).siblings('.tweetUserName').val()
  const time = $(obj).siblings('.time').val()
  const commentNode = document.getElementById('commentNode')

  if (comment.length === 0) {
    e.preventDefault()
  }
  else if (comment.length > 100) {
    e.preventDefault()
  }
  else {
    const tweetReplies = document.getElementById('tweetReplies')

    $('#tweetReplies').append(`
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
    `)
    commentNode.value = ''
    
    socket.emit('reply', { comment, userId, tweetId, tweetUserId })
    
  }
})

socket.on('reply', (data) => {  
  if(data.tweetUserId === userId) {
    notice(data)
  }
})

//post a replyComment
function replyComment(obj) {
  var comment = $(obj).siblings('.comment').val()
  const tweetId = Number($(obj).siblings('.tweetId').val())
  const replyId = Number($(obj).siblings('.replyId').val())
  const replyUserId = Number($(obj).siblings('.replyUserId').val())
  const avatar = $(obj).siblings('.avatar').val()
  const name = $(obj).siblings('.name').val()
  const account = $(obj).siblings('.account').val()
  const replyUserName = $(obj).siblings('.replyUserName').val()
  const time = $(obj).siblings('.time').val()
  
  if (comment.length === 0) {
    return false
  }
  else if (comment.length > 100) {
    return false
  }
  else {
    $('#reply-comments').append(`
    <div class="flex-container mb-2">
      <div>
        <a href="/users/${userId}/tweets">
          <img class="mr-3 user-avatar" src="${avatar}" alt="user avatar">
        </a>
      </div>
      <div>
        <div class="dropdown show" style="position:absolute; right:20px;">
          <a style="color:black; text-decoration:none;" role="button" id="more" data-toggle="dropdown"
            aria-haspopup="true" aria-expanded="false">
            •••
          </a>
          <div class="dropdown-menu" aria-labelledby="more">
            <button data-toggle="modal" data-target="#er${replyId}" class="dropdown-item">修改此留言</button>
            <button data-toggle="modal" data-target="#cr${replyId}" class="dropdown-item">刪除此留言</button>
          </div>
        </div>
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
    `)
    $('#reply-comment')
    
    socket.emit('replyComment', { comment, userId, tweetId, replyId, replyUserId })
    $(obj).siblings('.comment').val('')
  }
}

socket.on('replyComment', (data) => {  
  if(data.replyUserId === userId) {
    notice(data)
  }
})

//follow a tweet
function follow(obj) {
  const followingId = Number($(obj).siblings('.followingId').val())
  const form = $(obj).parent()
  form.html(`
  <input type="hidden" class="followingId" value="${followingId}">
  <button onclick="unfollow(this)" type="submit" class="btn btn-outline-twitter-active rounded-pill">正在跟隨</button>
  `)
  $('#follower-count').text(Number($('#follower-count').text())+1)
  socket.emit('follow', followingId)
}

socket.on('follow', (data) => {  
  if(data.followingId === userId) {
    const noticeList = document.getElementById('notice-list')
    var newNode = document.createElement('div')
    newNode.className = 'notice'
    noticeList.innerHTML = `
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
    if (noticeList.children[0]) {
      noticeList.insertBefore(newNode, noticeList.children[0])
    }
    else {
      noticeList.appendChild(newNode)
    } 
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