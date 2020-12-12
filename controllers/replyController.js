const db = require('../models')
const ReplyComment = db.ReplyComment

const replyController = {
  deleteReply: (req, res) => {
    ReplyComment.findByPk(req.body.replyCommentId)
      .then(replyComment => {
        replyComment.destroy()
          .then(replyComment => {
            return res.send('delete replyComment')
          })
      })
  },

  editReply: (req, res) => {
    ReplyComment.findByPk(req.body.replyCommentId)
      .then(replyComment => {
        replyComment.update({
          comment: req.body.updatedDesc
        })
        .then(replyComment => {
        
          return res.send('updated replyComment')
        })
      })
  }
}

module.exports = replyController