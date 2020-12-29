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
  success: function (data) {

    printData(data)
  }
})

var source = $('#template').html()
console.log(source)
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
    
    //console.log(dataStamp)
    var template = templateMissions(dataStamp)
    //console.log(template)
    
    $('.append').append(template)

  }
}