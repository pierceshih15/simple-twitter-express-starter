const db = require('../models')
const Tweet = db.Tweet
const User = db.User
const Like = db.Like
const Reply = db.Reply
const Followship = db.Followship

const tweetController = {
  getTweets: async (req, res) => {
    const tweetValue = req.session.tweetValue
    req.session.tweetValue = ''

    const tweets = await Tweet.findAll({
      // 喜歡與不喜歡的新增，多拿以 LikedUsers 為參考的 User 資料
      include: [User, Reply, Like, { model: User, as: 'LikedUsers' }],
      // 原始
      // include: [User, Like, Reply],
      // 原始
      order: [['createdAt', 'DESC']]
    })

    const users = await User.findAll({
      include: [{ model: User, as: 'Followers' }]
    })

    let allTweets = tweets.map(tweet => ({
      ...tweet.dataValues,
      numOfReply: tweet.Replies.length,
      numOfLike: tweet.Likes.length,
      // 喜歡與不喜歡的新增
      isLiked: tweet.LikedUsers.map(a => a.id).includes(req.user.id)
    }))

    let topTenUsers = []
    let promises = users.map(async user => {
      topTenUsers.push({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        // 判斷目前登入使用者是否已追蹤該 User 物件
        isFollowed: req.user.Followings.map(following => following.id).includes(user.id),
        followshipId: await Followship.findOne({
          where: {
            followerId: req.user.id,
            followingId: user.id
          }
        }).then(followship => (followship ? followship.dataValues.id : ''))
      })
      return 'ok'
    })
    await Promise.all(promises)

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
  },

  getTweet: async (req, res) => {
    const tweetData = await Tweet.findOne({
      where: { id: req.params.tweetId },
      include: [User, Like, { model: Reply, include: User }]
    })

    let tweet = {
      ...tweetData.dataValues,
      numOfReply: tweetData.Replies.length,
      numOfLike: tweetData.Likes.length
    }

    const tweetUserData = await User.findOne({
      where: { id: tweetData.User.id },
      include: [
        Tweet,
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' },
        { model: Tweet, as: 'LikedTweets' }
      ]
    })

    let tweetUser = {
      ...tweetUserData.dataValues,
      numOfTweet: tweetUserData.Tweets.length,
      numOfFollowing: tweetUserData.Followings.length,
      numOfFollower: tweetUserData.Followers.length,
      numOfLikedTweet: tweetUserData.LikedTweets.length,
      isFollowed: req.user.Followings.map(following => following.id).includes(tweetUserData.id),
      followshipId: await Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: tweetUserData.id
        }
      }).then(followship => (followship ? followship.dataValues.id : ''))
    }

    res.render('reply', { tweet, tweetUser })
  }
}

module.exports = tweetController
