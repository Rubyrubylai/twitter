function dislike(obj) {
  const form = $(obj).parent()
  const type = $(obj).siblings('.type').val()
  const type2 = $(obj).siblings('.type2').val()
  const tweetId = $(obj).siblings('.tweetId').val()
  const tweetUserId = $(obj).siblings('.tweetUserId').val()
  const replyId = $(obj).siblings('.replyId').val()
  const replyUserId = $(obj).siblings('.replyUserId').val()
  const likesCount = $(obj).siblings('.likesCount').val() - 1
  if (type === 'tweet') {
    $.ajax({
      method: 'DELETE',
      url: '/tweets/like',
      data: { tweetId, tweetUserId },
      dataType: 'text',
      success: function(response) {
        form.html(`
        <div class="like-form">
          <input type="hidden" class="tweetId" value="${tweetId}">
          <input type="hidden" class="tweetUserId" value="${tweetUserId}">
          <input type="hidden" class="likesCount" value="${likesCount}">
          <input type="hidden" class="type" value="tweet">
        </div>
        `)
        if (type2 === 'tweetLike') {
          form.children().append(`
            <input type="hidden" class="type2" value="tweetLike">
            <button onclick="like(this)" class="tweet-icon"><i class="far fa-heart fa-lg"></i></button>
          `)
          $('#tweet-like').text(likesCount)
        }
        else {
          form.children().append(`
            <button onclick="like(this)" class="tweet-icon"><i class="far fa-heart"></i></button>
            <div class="count">${likesCount}</div> 
          `)
        }
      },
      error: function() {
        console.error(err)
      }
    })
  }
  else {
    $.ajax({
      method: 'DELETE',
      url: '/replies/like',
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
        </div>
        `)
        if (type2 === 'tweetLike') {
          form.children().append(`
            <input type="hidden" class="type2" value="tweetLike">
            <button onclick="like(this)" class="tweet-icon"><i class="far fa-heart fa-lg"></i></button>
          `)
          $('#tweet-like').text(likesCount)
        }
        else {
          form.children().append(`
            <button onclick="like(this)" class="tweet-icon"><i class="far fa-heart"></i></button>
            <div class="count">${likesCount}</div> 
          `)
        }
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
  const type = $(obj).siblings('.type').val()
  const form = $(obj).parent()
  console.log($(obj).parents('.follow-list'))
  $.ajax({
    method: 'DELETE',
    url: `/followships`,
    data: { followingId },
    dataType: 'text',
    success: function(response) {
      if (type === 'userFollowings') {
        $(obj).parents('.follow-list').remove()
      }
      else {
        form.html(`
        <input type="hidden" class="followingId" value="${followingId}">
        <button onclick="follow(this)" type="button" class="btn btn-outline-twitter rounded-pill">跟隨</button>
        `)
        $('#follower-count').text(Number($('#follower-count').text())-1)
      }
    },
    error: function() {
      console.error(err)
    }
  })
  return false
}

function unsubscribe(obj) {
  const subscribedId = $(obj).children('#subscribedId').val()
  const form = $(obj).parent()
  $.ajax({
    method: 'DELETE',
    url: '/subscribe',
    data: { subscribedId },
    dataType: 'text',
    success: function(response) {
      form.html(`
      <button onclick="subscribe(this)" class="tweet-icon">
        <input type="hidden" id="subscribedId" value="${subscribedId}">
        <i class="far fa-bell fa-2x mt-1 mx-2 a-coral"></i>
      </button>
      `)
    },
    error: function() {
      console.error(err)
    }
  })
  return false
}

function remove(obj) {
  const type = $(obj).siblings('.type').val() 
  if (type === 'tweet') {
    const tweetId = $(obj).siblings('.tweetId').val()
    const tweet = $(`#tweet-${tweetId}`)
    $.ajax({
      method: 'DELETE',
      url: `/tweets/${tweetId}`,
      data: { tweetId },
      dataType: 'text',
      success: function() {
        tweet.parent().children().remove()
        $('.modal').modal('hide')
        $('body').removeClass('modal-open')
        $('.modal-backdrop').remove()
      }
    })
  }
  else if (type === 'reply') {
    const replyId = $(obj).siblings('.replyId').val()
    const reply = $(`#reply-${replyId}`)
    const replyCount = Number($('#reply-count').text())
    $.ajax({
      method: 'DELETE',
      url: `/replies/${replyId}`,
      data: { replyId },
      dataType: 'text',
      success: function() {
        reply.parent().children().remove()
        $('#reply-count').text(replyCount-1)
        $(`.modal`).modal('hide')
        $('body').removeClass('modal-open')
        $('.modal-backdrop').remove()
      }
    })
  }
  else if (type === 'replyComment') {
    const replyCommentId = $(obj).siblings('.replyCommentId').val()
    // const replyId = $('.replyId').val()
    const replyComment = $(`#replyComment-${replyCommentId}`)
    // const replyCommentCount = $(`replyComment-count-${replyId}`).text()
    
    console.log(replyCommentId)
    console.log($(`replyComment-count-${replyCommentId}`))
    $.ajax({
      method: 'DELETE',
      url: `/replyComments/${replyCommentId}`,
      data: { replyCommentId },
      dataType: 'text',
      success: function() {
        replyComment.parent().children().remove()
        // $(`replyComment-count-${replyId}`).text(replyCommentCount-1)
        $(`.modal`).modal('hide')
        $('body').removeClass('modal-open')
        $('.modal-backdrop').remove()
      }
    })
  }

  return false
}


function edit(obj) {
  const type = $(obj).siblings('.type').val()
  
  if (type === 'tweet') {
    const tweetId = $(obj).siblings('.tweetId').val()
    const tweetDesc = $(`#tweet-description-${tweetId}`)
    const updatedDesc = $(obj).children().children(":nth-child(2)").children().val()
    if (!updatedDesc) {
      return false
    }
    if (updatedDesc.length > 100) {
      return false
    }
    else {
      $.ajax({
        method: 'PUT',
        url: `/tweets/${tweetId}`,
        data: { tweetId, updatedDesc },
        dataType: 'text',
        success: function() {
          tweetDesc.text(`${updatedDesc}`)
          $(`.modal`).modal('hide')
          $('body').removeClass('modal-open')
          $('.modal-backdrop').remove()
        },
        error: function() {
          console.error(err)
        }
      })
    }
  }  
  else if (type === 'reply') {   
    const replyId = $(obj).siblings('.replyId').val()
    const replyDesc = $(`#reply-description-${replyId}`)
    const updatedDesc = $(obj).children().children(":nth-child(2)").children().val()
    if (!updatedDesc) {
      return false
    }
    if (updatedDesc.length > 100) {
      return false
    }
    else {
      $.ajax({
        method: 'PUT',
        url: `/replies/${replyId}`,
        data: { replyId, updatedDesc },
        dataType: 'text',
        success: function() {
          replyDesc.text(`${updatedDesc}`)
          $(`.modal`).modal('hide')
          $('body').removeClass('modal-open')
          $('.modal-backdrop').remove()
        },
        error: function() {
          console.error(err)
        }
      })
    }
  }
  
  return false
}