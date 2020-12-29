

$.get('/count', function(data) {
  // const publicCount = data.publicCount
  const privateCount = data.privateCount
  const noticeCount = data.noticeCount
  // if (publicCount >= 1) {
  //   displayPublic(publicCount)
  // }
  if (privateCount >= 1) {
    displayPrivate(privateCount)
  }
  if (noticeCount >= 1) {
    displayNotice(noticeCount)
  }
})

// function displayPublic(publicCount) {
//   $('private-icon').html(`
//       <h6><i class="fas fa-comments nav-icon"><div class="red-dot-public"></div></i>公開聊天室 (${publicCount})</h6>
//     `)
// }

function displayPrivate(privateCount) {
  $('#private-icon').html(`
    <h6><i class="fas fa-envelope fa-lg nav-icon"><div class="red-dot-private"></div></i>私人訊息 (${privateCount})</h6>
  `)
}

function displayNotice(noticeCount) {
  $('#notice-icon').html(`
  <h6><i class="fas fa-bell fa-lg nav-icon"><div class="red-dot-notice"></div></i>通知 (${noticeCount})</h6>
  `)
}


$.ajax({
  url:'/topFollowing',
  method: 'GET',
  success: function (datas) {
    for (let user of datas.users) {
      innerHTML = `
      <li class="list-group-item top-follow-list">
        <div class="flex-container">
          <div class="mr-2">
            <a href="/users/${user.id}/tweets">
              <img src="${user.avatar}" alt="user avatar" class="user-avatar">
            </a>
          </div>
          <div >
            <a class="a-black" href="/users/${user.id}/tweets"><strong>${user.name}</strong><br></a>
            <span class="text-muted">@${user.account}</span>
          </div>
          <input type="hidden" class="followingId" value="${user.id}">
          <input type="hidden" class="name" value="${user.name}">
          <input type="hidden" class="avatar" value="${user.avatar}">
          <input type="hidden" class="account" value="${user.account}">
          <input type="hidden" class="introduction" value="${user.introduction}">
          <input type="hidden" class="userId" value="${datas.logInUser.id}">
          <input type="hidden" class="username" value="${datas.logInUser.name}">
          <input type="hidden" class="userAvatar" value="${datas.logInUser.avatar}">
          <input type="hidden" class="userAccount" value="${datas.logInUser.account}">
          <input type="hidden" class="userIntroduction" value="${datas.logInUser.introduction}">
          <div class="align-self-center ml-auto">
      `
      if (user.isFollowing) {
        innerHTML += `
            <button id="right-follow-${user.id}"onclick="unfollow(this)" type="submit" class="btn btn-outline-twitter-active rounded-pill">正在跟隨</button>
            
        `
      }
      else {
        innerHTML += `
        <button id="right-follow-${user.id}" onclick="follow(this)" type="button" class="btn btn-outline-twitter rounded-pill">跟隨</button>
        `
      }
      innerHTML += `
          </div>
        </div>
      </li>
      `
      $('#append').append(innerHTML)
    }
    //printData(data)
  }
})

var source = $('#template').html()
var templateMissions = Handlebars.compile(source)


function printData(datas) {
  for (let data of datas) {

    var dataStamp = {
      id: data.id,
      avatar: data.avatar,
      name: data.name,
      account: data.account,
      introduction: data.introduction
    }


    var template = templateMissions(dataStamp)
    console.log(template)
    
    $('#append').append(template)

  }
}