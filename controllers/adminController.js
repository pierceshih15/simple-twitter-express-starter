const db = require('../models')
const Tweet = db.Tweet

const adminController = {
  getTweets: (req, res) => {
    return res.render('admin/tweets')
  }
}

module.exports = adminController
