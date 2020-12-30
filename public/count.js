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
    printData(datas)
  }
})

function printData(datas) {
  var source = $('#template').html()
  var templateMissions = Handlebars.compile(source)

  for (let user of datas.users) {
    var dataStamp = {
      id: user.id,
      avatar: user.avatar,
      name: user.name,
      account: user.account,
      introduction: user.introduction,
      isFollowing: user.isFollowing,
      userId: datas.logInUser.id,
      username: datas.logInUser.name,
      userAvatar: datas.logInUser.avatar,
      userAccount: datas.logInUser.account,
      userIntroduction: datas.logInUser.introduction,
    }

    // will not appear user himself
    if (user.id !== datas.logInUser.id) {
      var template = templateMissions(dataStamp)
      $('#append').append(template)
    }
  }
}