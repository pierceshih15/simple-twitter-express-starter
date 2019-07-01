const bcrypt = require('bcrypt-nodejs')
const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Reply = db.Reply
const Like = db.Like
const Followship = db.Followship
const Sequelize = require('sequelize')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      User.findOne({
        where: {
          [Sequelize.Op.or]: [{ email: req.body.email }, { name: req.body.name }]
        }
      }).then(user => {
        if (user) {
          req.flash('error_messages', '名稱或是信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null),
            avatar: 'https://img.icons8.com/ios/100/000000/guest-male-filled.png',
            introduction: 'Hello, I am a slacker',
            role: 'user'
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/tweets')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  getUser: (req, res) => {
    return User.findByPk(req.params.id, {
      include: [
        { model: Tweet, include: [User, Reply, Like] },
        { model: Tweet, as: 'LikedTweets' },
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' }
      ]
    }).then(user => {
      const isFollowed = req.user.Followings.map(d => d.id).includes(user.id)
      let tweetArray = user.Tweets.sort((a, b) => b.createdAt - a.createdAt)
      return res.render('users/profile', { profile: user, isFollowed, tweetArray })
    })
  },

  editUser: (req, res) => {
    return User.findByPk(req.params.id).then(user => {
      return res.render('users/edit', { user })
    })
  },

  putUser: (req, res) => {
    if (Number(req.params.id) !== req.user.id) {
      return res.redirect(`/users/${req.user.id}/tweets`)
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id).then(user => {
          user
            .update({
              name: req.body.name,
              introduction: req.body.introduction,
              avatar: file ? img.data.link : user.avatar
            })
            .then(user => {
              req.flash('success_messages', `用戶 ${user.name} 資料更新成功！`)
              res.redirect(`/users/${req.params.id}/tweets`)
            })
        })
      })
    } else {
      return User.findByPk(req.params.id).then(user => {
        user.update({ name: req.body.name, introduction: req.body.introduction }).then(user => {
          req.flash('success_messages', `用戶 ${user.name} 資料更新成功！`)
          res.redirect(`/users/${req.params.id}/tweets`)
        })
      })
    }
  }
}

module.exports = userController
