const db = require('../models')
const Tweet = db.Tweet
const User = db.User
const Like = db.Like
const Reply = db.Reply

const tweetController = {
  getTweets: async (req, res) => {
    const tweets = await Tweet.findAll({
      include: [User, Like, Reply]
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
    res.render('tweets', { allTweets, topTenUsers })
  }
}

module.exports = tweetController
