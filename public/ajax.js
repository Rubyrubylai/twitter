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
        </div>
        `)
        if (type2 === 'tweetLike') {
          form.children().append(`
            <input type="hidden" class="type2" value="tweetLike">
            <button onclick="like(this)" class="btn-push"><i class="far fa-heart fa-lg"></i></button>
          `)
          $('#tweet-like').text(likesCount)
        }
        else {
          form.children().append(`
            <button onclick="like(this)" class="btn-push"><i class="far fa-heart"></i></button>
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
        </div>
        `)
        if (type2 === 'tweetLike') {
          form.children().append(`
            <input type="hidden" class="type2" value="tweetLike">
            <button onclick="like(this)" class="btn-push"><i class="far fa-heart fa-lg"></i></button>
          `)
          $('#tweet-like').text(likesCount)
        }
        else {
          form.children().append(`
            <button onclick="like(this)" class="btn-push"><i class="far fa-heart"></i></button>
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
    method: 'POST',
    url: `/followships/delete`,
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
    method: 'POST',
    url: '/subscribe',
    data: { subscribedId },
    dataType: 'text',
    success: function(response) {
      form.html(`
      <button onclick="subscribe(this)" class="btn-push">
        <input type="hidden" id="subscribedId" value="${subscribedId}">
        <i class="far fa-bell fa-2x mt-1 mx-2" style="color: rgb(255, 102, 0);"></i>
      </button>
      `)
    },
    error: function() {
      console.error(err)
    }
  })
  return false
}

// function edit(obj) {
//   const replyId = Number($(obj).siblings('.replyCommentId').val())
//   const comment = $('.replyComment').text()
//   const avatar = $(obj).siblings('.avatar').val()
//   const name = $(obj).siblings('.name').val()
//   const account = $(obj).siblings('.account').val()
//   const replyUserName = $(obj).siblings('.replyUserName').val()
//   const time = $(obj).siblings('.time').val()
//   const form = $('#reply-comment-form')
//   console.log('------------')
//   console.log('comment')
//   if (!comment) {
//     return false
//   }
//   if (comment.length > 100) {
//     return false
//   }
//   else {
//     $.ajax({
//       method: 'PUT',
//       url: '/replies',
//       data: { replyId, comment },
//       dataType: 'text',
//       success: function(response) {
//         form(`
//         <div class="flex-container mb-2">
//           <div>
//             <a href="/users/${userId}/tweets">
//               <img class="mr-3 user-avatar" src="${avatar}" alt="user avatar">
//             </a>
//           </div>
//           <div>
//             <div class="dropdown show" style="position:absolute; right:20px;">
//               <a style="color:black; text-decoration:none;" role="button" id="more" data-toggle="dropdown"
//                 aria-haspopup="true" aria-expanded="false">
//                 •••
//               </a>
//               <div class="dropdown-menu" aria-labelledby="more">
//                 <button data-toggle="modal" data-target="#er${replyId}" class="dropdown-item">修改此留言</button>
//                 <button data-toggle="modal" data-target="#cr${replyId}" class="dropdown-item">刪除此留言</button>
//               </div>
//             </div>
//             <a href="/users/${userId}/tweets
//             " style="text-decoration:none; color:black"><strong>${name}</strong></a>
//             <font color="grey">@${account} • ${time}</font>
//             <p>
//             ${comment}
//             </p>
//             <font color="grey" size="2px">回覆給</font>
//             <font color="coral" size="2px">@${replyUserName}</font>
//           </div>
//         </div>
//         `)
//       },
//       error: function() {
//         console.error(err)
//       }
//     })
//   }
//   return false
// }