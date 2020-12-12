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
  var comment = $(obj).siblings('.comment').val()
  const tweetId = Number($(obj).siblings('.tweetId').val())
  const tweetUserId = Number($(obj).siblings('.tweetUserId').val())
  const avatar =$(obj).siblings('.avatar').val()
  const name = $(obj).siblings('.name').val()
  const account =$(obj).siblings('.account').val()
  const tweetUserName = $(obj).siblings('.tweetUserName').val()
  const time = $(obj).siblings('.time').val()
  
  if (comment.length === 0) {
    return false
  }
  else if (comment.length > 100) {
    return false
  }
  else {
    $('#tweet-replies').append(`
    <div class="flex-container mb-2">
      <div>
        <a href="/users/${userId}/tweets">
          <img class="user-avatar" src="${avatar}" alt="user avatar">
        </a>
      </div>
      <div>
        <a class="a-black" href="/users/${userId}/tweets"><strong>${name}</strong></a>
        <font class="reply-font">@${account} • ${time}</font>
        <p>
        ${comment}
        </p>
        <font class="reply-to-font">回覆給</font>
        <font class="reply-to-account">@${tweetUserName}</font>
      </div>
    </div>
    `)
    
    
    socket.emit('reply', { comment, userId, tweetId, tweetUserId, tweetUserName, time, account })
    $(obj).siblings('.comment').val('')
  }
}

socket.on('replyMessage', ({ replyId, avatar, username, description, data }) => {
  var updatedTime = moment(new Date()).fromNow()
  $('.tweeReply-form').append(`
    <li class="list-group-item" id="reply-${replyId}">
    <div class="flex-container">
      <div>
        <a href="/users/${userId}/tweets">
          <img class="user-avatar" src="${avatar}" alt="user avatar">
        </a>
      </div>
      <div>
          <div class="dropdown more">
            <a class="a-custom" role="button" data-toggle="dropdown"
              aria-haspopup="true" aria-expanded="false">
              •••
            </a>
            <div class="dropdown-menu" aria-labelledby="more">
              <button data-toggle="modal" data-target="#er${replyId}" class="dropdown-item">修改此留言</button>
              <button data-toggle="modal" data-target="#tr${replyId}" class="dropdown-item">刪除此留言</button>
            </div>
          </div>
        <a href="/users/${userId}/tweets" class="a-black"><strong>${username}</strong></a>
        <font class="text-muted">@${data.account} • <span id="reply-time-${replyId}">${data.time}</span></font>
        <br>
        <font class="text-muted reply">回覆</font>
        <a href="/users/${data.tweetUserId}/tweets" class="a-coral">@${data.tweetUserName}</a>
        <p id="reply-description-${replyId}">${description}</p>
        <div>
          <button data-toggle="modal" data-target="#r${replyId}" class="tweet-icon"><i class="far fa-comment"></i></button>
          <div id="replyComment-count-${replyId}" class="comments-count">0</div>
        </div>
          <input type="hidden" class="tweetId" value="${data.id}">
          <input type="hidden" class="replyId" value="${replyId}">
          <input type="hidden" class="replyUserId" value="${userId}">
          <input type="hidden" class="likesCount" value="0">
          <input type="hidden" class="type" value="reply">
          <div class="flex-container">
            <button onclick="like(this)" class="tweet-icon"><i class="far fa-heart"></i></button>
          <div class="count">0</div>
        </div>
      </div>
    </div>
    
    <div class="modal fade modal-open" id="er${replyId}" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h4>編輯留言</h4>
          </div>
          <input type="hidden" class="type" value="reply">
          <input type="hidden" class="replyId" value="${replyId}">
          <form onsubmit="edit(this); return false;">
            <div class="modal-body flex-container">
              <div>
                <img src="${avatar}" alt="user avatar" class="user-avatar">
              </div>
              <div class="post-tweet">  
                <textarea placeholder="留言..." class="form-control description" name="comment" rows="3">${description}</textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="submit" class="btn btn-edit">儲存</button>
              <button type="button" class="btn btn-cancel" data-dismiss="modal">取消</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="modal fade modal-open" id="tr${replyId}" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h4>刪除留言?</h4>
          </div>
          <div class="modal-body">
            確定要刪除這則留言?
          </div>
          <div class="modal-footer">
            <input type="hidden" class="type" value="reply">
            <input type="hidden" class="replyId" value="${replyId}">
            <button onclick="remove(this)" type="button" class="btn btn-delete">刪除</button>
            <button type="button" class="btn btn-cancel" data-dismiss="modal">取消</button>
        </div>
        </div>
      </div>
    </div>

    <div class="modal fade" aria-hidden="true" id="r${replyId}">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close btn-close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="flex-container mb-2">
              <div>
                <a href="/users/${userId}/tweets">
                  <img class="mr-3 user-avatar" src="${avatar}" alt="user avatar">
                </a>
              </div>
              <div>
                <a class="a-black" href="/users/${userId}/tweets"><strong>${username}</strong></a>
                <font class="reply-font">@${data.account} • ${data.time}</font>
                <p>
                  ${description}
                </p>
              </div>
            </div>
            <div id="reply-comments-${replyId}">

            </div>
            <div class="flex-container">
              <div>
                <img src="${avatar}" alt="user avatar" class="user-avatar">
              </div>
              <div class="post-tweet">
                <div id="reply-comment-form">
                  <textarea placeholder="推你的回覆" class="form-control comment" id="reply-comment" rows="3"
                    ></textarea>
                  <input type="hidden" class="tweetId" value="${data.tweetId}">
                  <input type="hidden" class="replyId" value="${replyId}">
                  <input type="hidden" class="replyUserId" value="${userId}">
                  <input type="hidden" class="avatar" value="${avatar}">
                  <input type="hidden" class="name" value="${username}">
                  <input type="hidden" class="account" value="${data.account}">
                  <input type="hidden" class="replyUserName" value="${username}">
                  <input type="hidden" class="time" value="${updatedTime}">
                  <button  onclick="replyComment(this)" class="btn btn-reply" type="button">留言</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    `)
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
    socket.emit('replyComment', { comment, userId, tweetId, replyId, replyUserId, name, account, time, replyUserName })
    $(obj).siblings('.comment').val('')
  }
}

socket.on('replyCommentMessage', ({ avatar, replyCommentId, data }) => {
  console.log('---------------replyComment')
  console.log(avatar)
  console.log(replyCommentId)
  console.log(data)
  console.log($(`#reply-comments-${data.replyId}`))
  $(`#reply-comments-${data.replyId}`).append(`
  <div class="flex-container mb-2" id="replyComment-${replyCommentId}">
    <div>
      <a href="/users/${userId}/tweets">
        <img class="user-avatar" src="${avatar}" alt="user avatar">
      </a>
    </div>
    <div>
      <div class="dropdown more">
        <a class="a-black" role="button" data-toggle="dropdown"
          aria-haspopup="true" aria-expanded="false">
          •••
        </a>
        <div class="dropdown-menu" aria-labelledby="more">
          <button data-toggle="modal" data-target="#erc${replyCommentId}" class="dropdown-item">修改此留言</button>
          <button data-toggle="modal" data-target="#cr${replyCommentId}" class="dropdown-item">刪除此留言</button>
        </div>
      </div>
      <a href="/users/${userId}/tweets
      " class="a-black"><strong>${data.name}</strong></a>
      <font color="grey">@${data.account} • <span id="replyComment-time-${replyCommentId}"> ${data.time}</span></font>
      <p id="replyComment-description-${replyCommentId}">
      ${data.comment}
      </p>
      <font color="grey" size="2px">回覆給</font>
      <font color="coral" size="2px">@${data.replyUserName}</font>
    </div>
  </div>

  <div class="modal fade modal-open" id="erc${replyCommentId}" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h4>編輯留言</h4>
        </div>
        <input type="hidden" class="type" value="replyComment">
        <input type="hidden" class="replyCommentId" value="${replyCommentId}">
        <form onsubmit="edit(this); return false;">
        <div class="modal-body flex-container">
          <div>
            <img src="${avatar}" alt="user avatar" class="user-avatar">
          </div>
          <div class="post-tweet">
            <textarea placeholder="留言..." class="form-control description" name="comment" rows="3">${data.comment}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-edit">儲存</button>
          <button type="button" class="btn btn-cancel" data-dismiss="modal">取消</button>
        </div>
        </form>
      </div>
    </div>
  </div>

  <div class="modal fade modal-open" id="cr${replyCommentId}" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h4>刪除留言?</h4>
        </div>
        <div class="modal-body">
          確定要刪除這則留言?
        </div>
        <div class="modal-footer">
          <input type="hidden" class="type" value="replyComment">
          <input type="hidden" class="replyCommentId" value="${replyCommentId}">
          <input type="hidden" class="replyId" value="${data.replyId}">
          <button onclick="remove(this)" type="button" class="btn btn-delete">刪除</button>
          <button type="button" class="btn btn-cancel" data-dismiss="modal">取消</button>
      </div>
      </div>
    </div>
  </div>

  `)
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
  var userForm = $(`.user-sheet`)
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
  var newNode = document.createElement('div')
  newNode.className = 'notice'
  if (followship) {
    newNode.innerHTML = `
    <a href="/tweets/${data.id}/replies">
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