function dislike(obj) {
  const tweetId = $(obj).siblings('.tweetId').val()
  const icon = document.querySelector('.icon')
  const tweetUserId = $(obj).siblings('.tweetUserId').val()
  const likesCount = $(obj).siblings('.likesCount').val() - 1
  $.ajax({
    method: 'POST',
    url: `/tweets/${tweetId}/unlike`,
    data: tweetId,
    dataType: 'text',
    success: function(response) {
      icon.innerHTML = `
      <form class="like-form">
        <input type="hidden" name="tweetId" value="${tweetId}">
        <input type="hidden" name="tweetUserId" value="${tweetUserId}">
        <input type="hidden" name="likesCount" value="${likesCount}">
        <input type="hidden" name="type" value="tweet">
        
        <button type="submit" class="btn-push" name="icon"><i class="far fa-heart"></i></button>
        <div style="float:right;">${likesCount}</div>
      </form>
      `
    },
    error: function() {
      console.error(err)
    }
  })
  return false
}

function dislikeReply(obj) {
  const tweetId = $(obj).siblings('.tweetId').val()
  const replyId = $(obj).siblings('.replyId').val()
  const replyUserId = $(obj).siblings('.replyUserId').val()
  const likesCount = $(obj).siblings('.likesCount').val() - 1
  const icon = document.querySelector('.icon')
  $.ajax({
    method: 'POST',
    url: `/like/${replyId}/replies`,
    data: replyId,
    dataType: 'text',
    success: function(response) {
      icon.innerHTML = `
      <form action="" class="like-form">
        <input type="hidden" name="tweetId" value="${tweetId}">
        <input type="hidden" name="replyId" value="${replyId}">
        <input type="hidden" name="replyUserId" value="${replyUserId}">
        <input type="hidden" name="likesCount" value="${likesCount}">
        <input type="hidden" name="type" value="reply">
        <button type="submit" class="btn-push" style="float: left; font-size: 10px;"><i
            class="far fa-heart"></i></button>
        <div style="font-size:10px; float: right;">${likesCount}</div>
      </form>
      `
    },
    error: function() {
      console.error(err)
    }
  })
  return false
}

function unfollow(obj) {
  const followingId = $(obj).siblings('.followingId').val()
  // const followIcon = document.querySelector('.follow-icon')
  console.log(followingId)
  const followIcon = $(obj).parent()
  console.log($(obj).parent())
  $.ajax({
    method: 'POST',
    url: `/followships/delete`,
    data: { followingId },
    dataType: 'text',
    success: function(response) {
      followIcon.html(`
      <form class="follow-form">
        <input type="hidden" name="followingId" value="${followingId}">
        <button name="id" type="submit" class="btn btn-outline-twitter rounded-pill">跟隨</button>
      </form>
      `)
    },
    error: function() {
      console.error(err)
    }
  })
  return false
}