function dislike(obj) {
  const form = $(obj).parent()
  const type = $(obj).parent().siblings('.type').val()
  const type2 = $(obj).parent().siblings('.type2').val()
  const tweetId = $(obj).parent().siblings('.tweetId').val()
  const tweetUserId = $(obj).parent().siblings('.tweetUserId').val()
  const replyId = $(obj).parent().siblings('.replyId').val()
  const replyUserId = $(obj).parent().siblings('.replyUserId').val()
  const likesCount = Number($(obj).siblings('.count').text()) - 1
  const tweetLikesCount = Number($('#tweet-like').text()) - 1

  if (type === 'tweet') {
    $.ajax({
      method: 'DELETE',
      url: '/tweets/like',
      data: { tweetId, tweetUserId },
      dataType: 'text',
      success: function(response) {
        if (type2 === 'tweetLike') {
          form.html(`
            <button onclick="like(this)" class="tweet-icon"><i class="far fa-heart fa-lg"></i></button>
          `)
          $('#tweet-like').text(tweetLikesCount)
        }
        else {
          form.html(`
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
          <button onclick="like(this)" class="tweet-icon"><i class="far fa-heart"></i></button>
          <div class="count">${likesCount}</div> 
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
  const type = $('.type').val()
  const followingId = Number($(obj).parent().siblings('.followingId').val())
  var userForm = $(`#follow-${followingId}`)
  const rightForm = $(`#right-follow-${followingId}`)

  $.ajax({
    method: 'DELETE',
    url: `/followships`,
    data: { followingId },
    dataType: 'text',
    success: function(response) {
      rightForm.parent().html(`
        <button id="right-follow-${followingId}" onclick="follow(this)" type="button" class="btn btn-outline-twitter rounded-pill">跟隨</button>
      `)
      if (type === 'userFollowings' && userId === receiveId) {
        //the followings will be remove when user unfollow them in himself userFollowing page
        userForm.parents('.follow-list').remove()
      }
      else if (type === 'userFollowers' && userId !== receiveId && followingId === receiveId) {
        //the user will be remove when user unfollow follower in others userFollower page
        userForm = $(`#user-${userId}`)
        userForm.parents('.follow-list').remove()
      }
      else {
        userForm.parent().html(`
        <button id="follow-${followingId}" onclick="follow(this)" type="button" class="btn btn-outline-twitter rounded-pill">跟隨</button>
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
        reply.remove()
        $('#reply-count').text(replyCount-1)
        $(`.modal`).modal('hide')
        $('body').removeClass('modal-open')
        $('.modal-backdrop').remove()
      }
    })
  }
  else if (type === 'replyComment') {
    const replyCommentId = $(obj).siblings('.replyCommentId').val()
    const replyId = $(obj).siblings('.replyId').val()
    const replyComment = $(`#replyComment-${replyCommentId}`)
    const replyCommentCount = $(`#replyComment-count-${replyId}`)
    console.log(replyCommentCount)
    // const replyCommentCount = $(`replyComment-count-${replyId}`).text()
    $.ajax({
      method: 'DELETE',
      url: `/replyComments/${replyCommentId}`,
      data: { replyCommentId },
      dataType: 'text',
      success: function() {
        replyComment.remove()
        // $(`replyComment-count-${replyId}`).text(replyCommentCount-1)
        replyCommentCount.text(Number(replyCommentCount.text())-1)
        $(`.modal-open`).modal('hide')
        $('body').removeClass('modal-open')
        $('.modal-backdrop').remove()
      }
    })
  }

  return false
}


function edit(obj) {
  const type = $(obj).siblings('.type').val()
  var updatedTime = moment(new Date()).fromNow()
  
  if (type === 'tweet') {
    const tweetId = $(obj).siblings('.tweetId').val()
    const tweetDesc = $(`#tweet-description-${tweetId}`)
    const updatedDesc = $(obj).children().children(":nth-child(2)").children().val()

    

    //tweets page
    const tweetsTime = $(`#tweets-time-${tweetId}`)
    //tweet page
    const tweetTime = $(`#tweet-time-${tweetId}`)
    var updatedTweetTime = new Date()
    var date = getDate(updatedTweetTime)

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
          tweetsTime.text(`updated ${updatedTime}`)
          tweetTime.text(`updated ${date}`)
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
    const replyTime = $(`#reply-time-${replyId}`)

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
          replyTime.text(`updated ${updatedTime}`)
          $(`.modal`).modal('hide')
          $('body').removeClass('modal-open')
          $('.modal-backdrop').remove()
        },
        error: function() {
          console.error(err)
        }
      })
    }
  } else if (type === 'replyComment') {   
    const replyCommentId = $(obj).siblings('.replyCommentId').val()
    const replyCommentDesc = $(`#replyComment-description-${replyCommentId}`)
    const updatedDesc = $(obj).children().children(":nth-child(2)").children().val()
    const replyCommentTime = $(`#replyComment-time-${replyCommentId}`)
    if (!updatedDesc) {
      return false
    }
    if (updatedDesc.length > 100) {
      return false
    }
    else {
      $.ajax({
        method: 'PUT',
        url: `/replyComments/${replyCommentId}`,
        data: { replyCommentId, updatedDesc },
        dataType: 'text',
        success: function() {
          replyCommentDesc.text(`${updatedDesc}`)
          replyCommentTime.text(`updated ${updatedTime}`)
          $(`.modal-open`).modal('hide')
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

function getDate(a) {
  let Y = a.getFullYear()
  let M = a.getMonth() + 1
  let D = a.getDate()
  let h = a.getHours()
  let m = a.getMinutes()
  let t
  if (h >= 12) {
    t = '下午'
    h = h - 12
  } else {
    t = '上午'
  }
  return t + h + ':' + m + ' • ' + Y + '年' + M + '月' + D + '日'
}