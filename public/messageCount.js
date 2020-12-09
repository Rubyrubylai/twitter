const xhr = new XMLHttpRequest()
xhr.open('get','/count')
// xhr.setRequestHeader('Content-type','application/json;charset=utf-8')

xhr.onload = function() {
  const data = JSON.parse(xhr.responseText)
  const privateCount = data.publicCount
  const publicCount = data.privateCount
  if (privateCount >= 1) {
    display(privateCount)
  }
  if (publicCount >= 1) {
    displayPublic(publicCount)
  }
  if (data.hasNotice) {
    displayNotice()
  }
}

xhr.send()

function display(privateCount) {
  $('#public-icon').html(`
      <h6><i class="fas fa-comments m-2"><div class="red-dot-public"></div></i>公開聊天室 (${privateCount})</h6>
    `)
}

function displayPublic(publicCount) {
  $('#private-icon').html(`
    <h6><i class="fas fa-envelope fa-lg m-2"><div class="red-dot"></div></i>私人訊息 (${publicCount})</h6>
  `)
}

function displayNotice() {
  let htmlString = `
  <h6><i class="fas fa-bell fa-lg m-2"></i><div class="red-dot-notice"></div>通知</h6>
  `
  noticeIcon.innerHTML = htmlString
}