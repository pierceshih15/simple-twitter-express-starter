const db = require('../models')
const moment = require('moment')
const Tweet = db.Tweet
const User = db.User
const Reply = db.Reply
const Like = db.Like

const pageLimit = 5

const adminController = {
  getTweets: (req, res) => {
    let offset = 0
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }

    Tweet.findAndCountAll({
      include: User,
      offset: offset,
      limit: pageLimit
    }).then(result => {
      // console.log(result.count, result)

      let page = Number(req.query.page) || 1
      let pages = Math.ceil(result.count / pageLimit)
      let totalPage = Array.from({
        length: pages
      }).map((item, index) => index + 1)
      let prev = page - 1 ? 1 : page - 1
      let next = page + 1 ? pages : pages + 1

      const data = result.rows.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50)
      }))
      return res.render('admin/tweets', {
        tweets: data,
        page: page,
        pageLimit: pageLimit,
        totalPage: totalPage,
        prev: prev,
        next: next
      })
    })
  },

  // 刪除單一推特的資料
  deleteTweet: (req, res) => {
    return Tweet.destroy({
      where: {
        id: req.params.id
      }
    }).then(tweet => {
      res.redirect('/admin/tweets')
    })
  },

  // 取得使用者清單
  getUsers: (req, res) => {
    return User.findAll({
      include: [
        Tweet,
        Like,
        Reply,
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' }
      ]
    }).then(users => {
      let ResponseData = users.map(user => ({
        ...user.dataValues,
        TweetCount: user.Tweets.length
      }))
      ResponseData.sort((a, b) => b.TweetCount - a.TweetCount)
      res.render('admin/users', { users: ResponseData })
    })
  }
}

module.exports = adminController
