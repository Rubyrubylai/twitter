const xhr = new XMLHttpRequest()
xhr.open('get','/privateMessageCount')
// xhr.setRequestHeader('Content-type','application/json;charset=utf-8')

xhr.onload = function() {
  const data = JSON.parse(xhr.responseText)
  const messageCount = data.result
  if (messageCount >= 1) {
    display(messageCount)
  }
}

xhr.send()

function display(messageCount) {
  let htmlString = `
  <h6><i class="fas fa-envelope fa-lg m-2" id="private-icon"><div class="red-dot"></div></i>私人訊息 (${messageCount})</h6>
  `
  privateIcon.innerHTML = htmlString
}