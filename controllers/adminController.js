const db = require('../models')
const Tweet = db.Tweet

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
      console.log(result.count, result)

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
  }
}

module.exports = adminController
