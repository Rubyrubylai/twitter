function dislike(obj) {
  console.log($(obj).parent())
  const tweetId = $(obj).siblings('.tweetId').val()
  const icon = document.querySelector('.icon')
  const tweetUserId = $(obj).siblings('.tweetUserId').val()
  const likesCount = $(obj).siblings('.likesCount').val() - 1
  console.log(tweetId)
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