const db = require('../models')
const Reply = db.Reply

const replyController = {
  postReply: async (req, res) => {
    if (req.body.comment === '') {
      req.flash('error_messages', '請確認填寫回覆內容喔！')
      res.redirect(`/tweets/${req.params.tweetId}/replies`)
    } else {
      await Reply.create({
        UserId: req.user.id,
        TweetId: req.params.tweetId,
        comment: req.body.comment
      })
      res.redirect(`/tweets/${req.params.tweetId}/replies`)
    }
  }
}

module.exports = replyController
