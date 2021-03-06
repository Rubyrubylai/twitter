const noticeBtn = document.querySelector('.notice-btn')
const noticeId = document.getElementById('noticeId')
let followship

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
    <i class="far fa-bell-slash fa-2x mt-1 mx-2 a-coral"></i>
  </button>
  `)
  socket.emit('notice', subscribedId)
}

//post a tweet
function tweet(obj) {
  const description = $(obj).children().children(":nth-child(2)").children('.description').val()
  const username = $(obj).children().children(":nth-child(2)").children('.username').val()

  if (description.length === 0) {
    return false
  }
  else if (description.length > 140) {
    return false
  }
  else {
    socket.emit('tweet', { description, userId, username })
  }
}

// notice subscriber that the subscriber post a tweet
socket.on('tweet', (data) => {
  notice(data, followship)
})

//like a tweet or reply
function like(obj) {
  const form = $(obj).parent()
  const type = $(obj).parent().siblings('.type').val()
  const type2 = $(obj).parent().siblings('.type2').val()
  const tweetId = Number($(obj).parent().siblings('.tweetId').val())
  const tweetUserId = Number($(obj).parent().siblings('.tweetUserId').val())
  const replyId = Number($(obj).parent().siblings('.replyId').val())
  const replyUserId = Number($(obj).parent().siblings('.replyUserId').val())
  const likesCount = Number($(obj).siblings('.count').text()) + 1
  const tweetLikesCount = Number($('#tweet-like').text()) + 1

  if (type2 === 'tweetLike') {
    form.html(`
      <button onclick="dislike(this)" class="btn-push"><i class="fas fa-heart fa-lg like-icon"></i></button>
    `)
    $('#tweet-like').text(tweetLikesCount)
  }
  else {
    form.html(`
      <button onclick="dislike(this)" class="btn-push"><i class="fas fa-heart like-icon"></i></button>
      <div class="count">${likesCount}</div> 
    `)
  }
  socket.emit('like', { tweetId, tweetUserId, replyId, replyUserId, type })
}

socket.on('like', (data) => {  
  if(data.tweetUserId === userId) {
    notice(data, followship)
  }
  if(data.replyUserId === userId) {
    notice(data, followship)
  }
})

//post a tweetReply
function reply(obj) {
  const comment = $(obj).siblings('.comment').val()
  const tweetId = Number($(obj).siblings('.tweetId').val())
  const tweetUserId = Number($(obj).siblings('.tweetUserId').val())
  const avatar =$(obj).siblings('.avatar').val()
  const name = $(obj).siblings('.name').val()
  const account =$(obj).siblings('.account').val()
  const tweetUserName = $(obj).siblings('.tweetUserName').val()
  const time = $(obj).siblings('.time').val()
  const replyCount = Number($('#reply-count').text())

  if (comment.length === 0) {
    return false
  }
  else if (comment.length > 100) {
    return false
  }
  else {
    let source = $('#template-tweet').html()
    let templateMissions = Handlebars.compile(source)
    let dataStamp = {
      userId,
      avatar,
      name,
      account,
      time,
      comment,
      tweetUserName
    }
    let template = templateMissions(dataStamp)
    $('#tweet-replies').append(template)
    
    $('#reply-count').text(replyCount+1)

    socket.emit('reply', { comment, userId, tweetId, tweetUserId, tweetUserName, time, account })
    $(obj).siblings('.comment').val('')
  }
}

socket.on('replyMessage', ({ replyId, avatar, username, description, data }) => {
  const updatedTime = moment(new Date()).fromNow()
  let source = $('#template-reply').html()
  let templateMissions = Handlebars.compile(source)
  let dataStamp = {
    replyId,
    avatar,
    username,
    description,
    data,
    updatedTime,
  }
  let template = templateMissions(dataStamp)
  $('.tweeReply-form').append(template)
})

socket.on('reply', (data) => {  
  if(data.tweetUserId === userId) {
    notice(data, followship)
  }
})

//post a replyComment
function replyComment(obj) {
  const comment = $(obj).siblings('.comment').val()
  const tweetId = Number($(obj).siblings('.tweetId').val())
  const replyId = Number($(obj).siblings('.replyId').val())
  const replyUserId = Number($(obj).siblings('.replyUserId').val())
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
    socket.emit('replyComment', { comment, userId, tweetId, replyId, replyUserId, name, account, time, replyUserName })
    $(obj).siblings('.comment').val('')
  }
}

socket.on('replyCommentMessage', ({ avatar, replyCommentId, data }) => {
  const replyCommentCount = $(`#replyComment-count-${data.replyId}`)
  replyCommentCount.text(Number(replyCommentCount.text())+1)

  let source = $('#template-replyComment').html()
  let templateMissions = Handlebars.compile(source)
  let dataStamp = {
    avatar,
    replyCommentId,
    data
  }
  let template = templateMissions(dataStamp)
  $(`#reply-comments-${data.replyId}`).append(template)
})

socket.on('replyComment', (data) => {  
  if(data.replyUserId === userId) {
    notice(data, followship)
  }
})

//follow a tweet
function follow(obj) {
  const type = $('.type').val()
  const followingId = Number($(obj).parent().siblings('.followingId').val())
  const name = $(obj).parent().siblings('.name').val()
  const avatar = $(obj).parent().siblings('.avatar').val()
  const account = $(obj).parent().siblings('.account').val()
  const introduction = $(obj).parent().siblings('.introduction').val()
  const userId = Number($(obj).parent().siblings('.userId').val())
  const username = $(obj).parent().siblings('.username').val()
  const userAvatar = $(obj).parent().siblings('.userAvatar').val()
  const userAccount = $(obj).parent().siblings('.userAccount').val()
  const userIntroduction = $(obj).parent().siblings('.userIntroduction').val()
  const userForm = $(`.user-sheet`)
  const rightForm = $(`#right-follow-${followingId}`)

  rightForm.parent().html(`
    <button id="right-follow-${followingId}" onclick="unfollow(this)" type="button" class="btn btn-outline-twitter-active rounded-pill">正在跟隨</button>
  `)

  if (type === 'userFollowings' && userId === receiveId) {
    //the followings will be add when user follow them in himself userFollowing page
    userForm.append(`
    <div class="follow-list">
      <div class="d-flex p-2 row border-bottom">
        <a href="/users/${followingId}/tweets">
          <img class="mr-3 user_avatar_s" src="${avatar}" alt="Avatar">
        </a>
        <div class="col">
          <a class="a-black" href="/users/${followingId}/tweets">
            <span class="bold">${name}</span><br>
          </a>
          <a href="/users/${followingId}/tweets">
            <span class="follow-font">@${account}</span><br>
          </a>
          <span><small>${introduction}<br></small></span>
        </div>
        <div>
          <input type="hidden" class="followingId" value="${followingId}">
          <div> 
            <button id="follow-${followingId}" onclick="unfollow(this)" type="submit" class="btn btn-outline-twitter-active rounded-pill">正在跟隨</button>
          <div> 
        </div>
      </div>
    </div>
    `)
  }
  else if (type === 'userFollowers' && userId !== receiveId && followingId === receiveId) {
    //the user will be add when user follow follower in others userFollower page
    userForm.append(`
    <div class="follow-list">
      <div class="d-flex p-2 row border-bottom" id="user-${userId}">
        <a href="/users/${userId}/tweets">
          <img class="mr-3 user_avatar_s" src="${userAvatar}" alt="Avatar">
        </a>
        <div class="col">
          <a class="a-black" href="/users/${userId}/tweets">
            <span class="bold">${username}</span><br>
          </a>
          <a href="/users/${userId}/tweets">
            <span class="follow-font">@${userAccount}</span><br>
          </a>
          <span><small>${userIntroduction}<br></small></span>
        </div>
      </div>
    </div>
    `)
    
  }
  else {
    const userForm = $(`#follow-${followingId}`)
    userForm.parent().html(`
    <button id="follow-${followingId}" onclick="unfollow(this)" type="submit" class="btn btn-outline-twitter-active rounded-pill">正在跟隨</button>
    `)
    
    $('#follower-count').text(Number($('#follower-count').text())+1)
  }

  socket.emit('follow', followingId)
}

socket.on('follow', (data) => {  
  if(data.id === userId) {
    let followship = true
    notice(data, followship)
  }  
})

function notice(data, followship) {
  const noticeList = document.getElementById('notice-list')
  let newNode = document.createElement('div')
  newNode.className = 'notice'
  if (followship) {
    newNode.innerHTML = `
    <a href="/users/${data.userId}/tweets">
      <div class="flex-container">
      <img src="${data.avatar}" alt="user avatar" class="user-avatar">
        <div class="desc flex-container">
          <span>${data.noticeDescription}</span>
        </div>
      </div>
    </a> `
  }
  else {
    newNode.innerHTML = `
    <a href="/tweets/${data.id}/replies">
      <div class="flex-container">
      <img src="${data.avatar}" alt="user avatar" class="user-avatar">
        <div class="desc flex-container">
          <span>${data.noticeDescription}</span> 
          <font class="text-muted">${data.description}</font>
        </div>
      </div>
    </a> `
  }
  
  if (noticeList.children[0]) {
    noticeList.insertBefore(newNode, noticeList.children[0])
  }
  else {
    noticeList.appendChild(newNode)
  } 
  
}