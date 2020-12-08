function dislike(obj) {
  const icon = $(obj).parent()
  const tweetId = $(obj).siblings('.tweetId').val()
  const tweetUserId = $(obj).siblings('.tweetUserId').val()
  const likesCount = $(obj).siblings('.likesCount').val() - 1
  console.log(icon)
  $.ajax({
    method: 'POST',
    url: '/tweets/dislike',
    data: { tweetId, tweetUserId },
    dataType: 'text',
    success: function(response) {
      icon.html(`
      <form class="like-form">
        <input type="hidden" name="tweetId" value="${tweetId}">
        <input type="hidden" name="tweetUserId" value="${tweetUserId}">
        <input type="hidden" name="likesCount" value="${likesCount}">
        <input type="hidden" name="type" value="tweet">
        <button type="submit" class="btn-push" name="icon"><i class="far fa-heart"></i></button>
        <div class="count">${likesCount}</div>
      </form>
      `)
    },
    error: function() {
      console.error(err)
    }
  })
  return false
}

function dislikeReply(obj) {
  const icon = $(obj).parent()
  const tweetId = $(obj).siblings('.tweetId').val()
  const replyId = $(obj).siblings('.replyId').val()
  const replyUserId = $(obj).siblings('.replyUserId').val()
  const likesCount = $(obj).siblings('.likesCount').val() - 1
  $.ajax({
    method: 'POST',
    url: '/replies/dislike',
    data: { replyId, replyUserId },
    dataType: 'text',
    success: function(response) {
      icon.html(`
      <div class="flex-container">
        <input type="hidden" class="tweetId" value="${tweetId}">
        <input type="hidden" class="replyId" value="${replyId}">
        <input type="hidden" class="replyUserId" value="${replyUserId}">
        <input type="hidden" class="likesCount" value="${likesCount}">
        <button class="btn-push"><i class="fas fa-heart like-icon"></i></button>
        <div class="count">${likesCount}</div>
      </div>
      `)
    },
    error: function() {
      console.error(err)
    }
  })
  return false
}

function unfollow(obj) {
  const followingId = $(obj).siblings('.followingId').val()
  const followIcon = $(obj).parent()
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