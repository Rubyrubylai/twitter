function dislike(obj) {
  const form = $(obj).parent().parent()
  const type = $(obj).siblings('.type').val()
  const tweetId = $(obj).siblings('.tweetId').val()
  const tweetUserId = $(obj).siblings('.tweetUserId').val()
  const replyId = $(obj).siblings('.replyId').val()
  const replyUserId = $(obj).siblings('.replyUserId').val()
  const likesCount = $(obj).siblings('.likesCount').val() - 1
  if (type === 'tweet') {
    $.ajax({
      method: 'POST',
      url: '/tweets/dislike',
      data: { tweetId, tweetUserId },
      dataType: 'text',
      success: function(response) {
        form.html(`
        <div class="like-form">
          <input type="hidden" class="tweetId" value="${tweetId}">
          <input type="hidden" class="tweetUserId" value="${tweetUserId}">
          <input type="hidden" class="likesCount" value="${likesCount}">
          <input type="hidden" class="type" value="tweet">
          <button onclick="like(this)" class="btn-push" name="icon"><i class="far fa-heart"></i></button>
          <div class="count">${likesCount}</div>
        </div>
        `)
      },
      error: function() {
        console.error(err)
      }
    })
  }
  else {
    $.ajax({
      method: 'POST',
      url: '/replies/dislike',
      data: { replyId, replyUserId },
      dataType: 'text',
      success: function(response) {
        form.html(`
        <div class="flex-container">
          <input type="hidden" class="tweetId" value="${tweetId}">
          <input type="hidden" class="replyId" value="${replyId}">
          <input type="hidden" class="replyUserId" value="${replyUserId}">
          <input type="hidden" class="likesCount" value="${likesCount}">
          <input type="hidden" class="type" value="reply">
          <button onclick="like(this)" class="btn-push"><i class="far fa-heart"></i></button>
          <div class="count">${likesCount}</div>
        </div>
        `)
      },
      error: function() {
        console.error(err)
      }
    })
  }
  
  return false
}

function unfollow(obj) {
  const followingId = $(obj).siblings('.followingId').val()
  const form = $(obj).parent()
  $.ajax({
    method: 'POST',
    url: `/followships/delete`,
    data: { followingId },
    dataType: 'text',
    success: function(response) {
      form.html(`
      <input type="hidden" class="followingId" value="${followingId}">
      <button onclick="follow(this)" type="button" class="btn btn-outline-twitter rounded-pill">跟隨</button>
      `)
    },
    error: function() {
      console.error(err)
    }
  })
  return false
}