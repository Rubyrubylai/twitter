const db = require('../models')
const ReplyComment = db.ReplyComment
const helpers = require('../_helpers');

const replyController = {
  // postReply: (req, res) => {
  //   const { comment } = req.body
  //   if (!comment) {
  //     req.flash('error_messages', '留言不得為空白')
  //     return res.redirect('back')
  //   }
  //   else {
  //     ReplyComment.create({
  //       UserId: helpers.getUser(req).id,
  //       ReplyId: req.params.replyId,
  //       comment
  //     })
  //       .then(replyComment => {
  //         return res.redirect('back')
  //       })
  //   }
  // },

  deleteReply: (req, res) => {
    console.log('------------replyCommentId')
    console.log(req.body.replyCommentId)
    ReplyComment.findByPk(req.body.replyCommentId)
      .then(replyComment => {
        replyComment.destroy()
          .then(replyComment => {
            return res.send('delete replyComment')
          })
      })
  },

  editReply: (req, res) => {
    console.log('===========replycomment')
    console.log(req.body.replyCommentId)
    console.log(req.body.updatedDesc)
    ReplyComment.findByPk(req.body.replyCommentId)
      .then(replyComment => {
        // const { comment } = req.body
        // if (!comment) {
        //   req.flash('error_messages', '留言不得為空白')
        //   return res.redirect('back')
        // }
        // if (comment.length > 100) {
        //   req.flash('error_messages', '留言字數不得超過100字')
        //   return res.redirect('back')
        // }
        // else {
          replyComment.update({
            comment: req.body.updatedDesc
          })
            .then(replyComment => {
              // req.flash('success_messages', '已成功更新留言')
              // return res.redirect('back')
              return res.send('updated replyComment')
            })
        // }
      })
  }
}

module.exports = replyController