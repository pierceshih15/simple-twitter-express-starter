const bcrypt = require('bcrypt-nodejs')
const db = require('../models')
const { User, Tweet, Reply, Like, Followship } = db
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
    }).then(async user => {
      const isFollowed = req.user.Followings.map(d => d.id).includes(user.id)
      let tweetArray = user.Tweets.sort((a, b) => b.createdAt - a.createdAt)
      const followshipId = await Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: user.id
        }
      }).then(followship => (followship ? followship.dataValues.id : ''))
      return res.render('profile', { profile: user, isFollowed, tweetArray, followshipId })
    })
  },

  editUser: (req, res) => {
    return User.findByPk(req.params.id).then(user => {
      return res.render('edit', { user })
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
  },

  addFollowing: async (req, res) => {
    if (req.user.id === parseInt(req.body.followingId)) {
      res.redirect('back')
    } else {
      await Followship.create({
        followerId: req.user.id,
        followingId: parseInt(req.body.followingId)
      })

      res.redirect('back')
    }
  },

  removeFollowing: async (req, res) => {
    await Followship.destroy({ where: { id: req.params.id } })
    res.redirect('back')
  },

  getFollowings: async (req, res) => {
    const userData = await User.findByPk(req.params.id, {
      include: [
        Tweet,
        { model: Tweet, as: 'LikedTweets' },
        { model: User, as: 'Followings', include: [{ model: User, as: 'Followers' }] },
        { model: User, as: 'Followers' }
      ]
    })

    let user = {
      ...userData.dataValues,
      numOfTweet: userData.Tweets.length,
      numOfFollowing: userData.Followings.length,
      numOfFollower: userData.Followers.length,
      numOfLikedTweet: userData.LikedTweets.length,
      isFollowed: req.user.Followings.map(following => following.id).includes(userData.id),
      followshipId: await Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: userData.id
        }
      }).then(followship => (followship ? followship.dataValues.id : ''))
    }

    let userFollowings = []
    let promises = user.Followings.map(async user => {
      userFollowings.push({
        ...user.dataValues,
        introduction: user.introduction ? user.introduction.substring(0, 50) : '',
        FollowerCount: user.Followers.length,
        // 判斷目前登入使用者是否已追蹤該 User 物件
        isFollowed: req.user.Followings.map(following => following.id).includes(user.id),
        followshipId: await Followship.findOne({
          where: {
            followerId: req.user.id,
            followingId: user.id
          }
        }).then(followship => (followship ? followship.dataValues.id : '')),
        followshipCreatedTime: await Followship.findOne({
          where: {
            followerId: req.params.id,
            followingId: user.id
          }
        }).then(followship => followship.createdAt)
      })
      return 'ok'
    })
    await Promise.all(promises)

    userFollowings = userFollowings.sort((a, b) => {
      return b.followshipCreatedTime - a.followshipCreatedTime
    })

    res.render('userFollowing', { profile: user, userFollowings })
  },

  getFollowers: async (req, res) => {
    const userData = await User.findByPk(req.params.id, {
      include: [
        Tweet,
        { model: Tweet, as: 'LikedTweets' },
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers', include: [{ model: User, as: 'Followers' }] }
      ]
    })

    let user = {
      ...userData.dataValues,
      numOfTweet: userData.Tweets.length,
      numOfFollowing: userData.Followings.length,
      numOfFollower: userData.Followers.length,
      numOfLikedTweet: userData.LikedTweets.length,
      isFollowed: req.user.Followings.map(following => following.id).includes(userData.id),
      followshipId: await Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: userData.id
        }
      }).then(followship => (followship ? followship.dataValues.id : ''))
    }

    let userFollowers = []
    let promises = user.Followers.map(async user => {
      userFollowers.push({
        ...user.dataValues,
        introduction: user.introduction ? user.introduction.substring(0, 50) : '',
        FollowerCount: user.Followers.length,
        // 判斷目前登入使用者是否已追蹤該 User 物件
        isFollowed: req.user.Followings.map(following => following.id).includes(user.id),
        followshipId: await Followship.findOne({
          where: {
            followerId: req.user.id,
            followingId: user.id
          }
        }).then(followship => (followship ? followship.dataValues.id : '')),
        followshipCreatedTime: await Followship.findOne({
          where: {
            followerId: user.id,
            followingId: req.params.id
          }
        }).then(followship => followship.createdAt)
      })
      return 'ok'
    })
    await Promise.all(promises)

    userFollowers = userFollowers.sort((a, b) => {
      return b.followshipCreatedTime - a.followshipCreatedTime
    })

    res.render('userFollower', { profile: user, userFollowers })
  },

  getLike: (req, res) => {
    return User.findByPk(req.params.id, {
      include: [
        { model: Tweet, include: [User, Reply, Like] },
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' },
        {
          model: Tweet,
          as: 'LikedTweets',
          include: [User, Reply, Like, { model: User, as: 'LikedUsers' }]
        }
      ]
    }).then(async user => {
      const isFollowed = req.user.Followings.map(d => d.id).includes(user.id)

      const followshipId = await Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: user.id
        }
      }).then(followship => (followship ? followship.dataValues.id : ''))

      const ResponseData = await user.LikedTweets.map(tweet => ({
        ...tweet.dataValues,
        // 設定 tweet 屬性，以便後續排序，按照 tweet 創建時間
        TweetOrder: tweet.Like.createdAt,
        // 設定 isLiked 屬性，以便後續使用
        isLiked: tweet.LikedUsers.map(a => a.id).includes(req.user.id)
      }))

      // 依照 Like 時間（TweetOrder）的先後順序排序
      let tweetArray = await ResponseData.sort((a, b) => b.TweetOrder - a.TweetOrder)

      return res.render('userLike', {
        profile: user,
        isFollowed,
        followshipId,
        tweetArray
      })
    })
  },

  addLike: (req, res) => {
    Like.create({
      UserId: req.user.id,
      TweetId: req.params.id
    }).then(like => {
      return res.redirect('back')
    })
  },

  removeLike: (req, res) => {
    Like.destroy({
      where: {
        UserId: req.user.id,
        TweetId: req.params.id
      }
    })
    return res.redirect('back')
  }
}

module.exports = userController
