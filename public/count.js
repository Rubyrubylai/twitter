const xhr = new XMLHttpRequest()
xhr.open('get','/count')

// xhr.setRequestHeader('Content-type','application/json;charset=utf-8')

xhr.onload = function() {
  const data = JSON.parse(xhr.responseText)
  const privateCount = data.publicCount
  const publicCount = data.privateCount
  const noticeCount = data.noticeCount
  if (privateCount >= 1) {
    display(privateCount)
  }
  // if (publicCount >= 1) {
  //   displayPublic(publicCount)
  // }
  if (noticeCount >= 1) {
    displayNotice(noticeCount)
  }
}

xhr.send()

function display(privateCount) {
  $('#public-icon').html(`
      <h6><i class="fas fa-comments nav-icon"><div class="red-dot-public"></div></i>公開聊天室 (${privateCount})</h6>
    `)
}

// function displayPublic(publicCount) {
//   $('#private-icon').html(`
//     <h6><i class="fas fa-envelope fa-lg nav-icon"><div class="red-dot-private"></div></i>私人訊息 (${publicCount})</h6>
//   `)
// }

function displayNotice(noticeCount) {
  $('#notice-icon').html(`
  <h6><i class="fas fa-bell fa-lg nav-icon"><div class="red-dot-notice"></div></i>通知 (${noticeCount})</h6>
  `)
}