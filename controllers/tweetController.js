const db = require('../models')
const Tweet = db.Tweet
const User = db.User
const Like = db.Like
const Reply = db.Reply

const tweetController = {
  getTweets: async (req, res) => {
    const tweetValue = req.session.tweetValue
    req.session.tweetValue = ''

    const tweets = await Tweet.findAll({
      include: [User, Like, Reply],
      order: [['createdAt', 'DESC']]
    })
    const users = await User.findAll({
      include: [{ model: User, as: 'Followers' }]
    })

    let allTweets = tweets.map(tweet => ({
      ...tweet.dataValues,
      numOfReply: tweet.Replies.length,
      numOfLike: tweet.Likes.length
    }))

    let topTenUsers = users.map(user => ({
      ...user.dataValues,
      FollowerCount: user.Followers.length,
      // 判斷目前登入使用者是否已追蹤該 User 物件
      isFollowed: req.user.Followings.map(following => following.id).includes(user.id)
    }))

    topTenUsers = topTenUsers.sort((a, b) => {
      return b.FollowerCount - a.FollowerCount
    })
    res.render('tweets', { allTweets, topTenUsers, tweetValue })
  },

  postTweet: async (req, res) => {
    const tweetValue = req.body.description
    if (tweetValue === '') {
      req.flash('error_messages', '請確認填寫內容喔！')
      res.redirect('/tweets')
    } else if (tweetValue.length > 140) {
      req.flash('error_messages', '字數超過 140 字限制，請縮減~')
      req.session.tweetValue = req.body.description
      res.redirect('/tweets')
    } else {
      await Tweet.create({
        UserId: req.user.id,
        description: req.body.description
      })

      res.redirect('/tweets')
    }
  }
}

module.exports = tweetController
