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
    let allTweets = tweets.map(tweet => ({
      ...tweet.dataValues,
      numOfReply: tweet.Replies.length,
      numOfLike: tweet.Likes.length
    }))
    res.render('tweets', { allTweets })
  }
}

module.exports = tweetController
