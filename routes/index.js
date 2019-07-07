const tweetController = require('../controllers/tweetController')
const adminController = require('../controllers/adminController.js')
const userController = require('../controllers/userController')
const replyController = require('../controllers/replyController')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const helpers = require('../_helpers')

module.exports = (app, passport) => {
  const authenticated = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      return next()
    }
    res.redirect('/signin')
  }
  const authenticatedAdmin = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      if (helpers.getUser(req).role === 'admin') {
        return next()
      }
      return res.redirect('/')
    }
    res.redirect('/signin')
  }

  app.get('/', authenticated, (req, res) => res.redirect('/tweets'))
  app.get('/tweets', authenticated, tweetController.getTweets)
  app.post('/tweets', authenticated, tweetController.postTweet)
  app.get('/tweets/:tweetId/replies', authenticated, tweetController.getTweet)
  app.post('/tweets/:tweetId/replies', authenticated, replyController.postReply)

  app.get('/users/:id/tweets', authenticated, userController.getUser)
  app.get('/users/:id/edit', authenticated, userController.editUser)
  app.put('/users/:id', authenticated, upload.single('avatar'), userController.putUser)
  app.get('/users/:id/followings', authenticated, userController.getFollowings)
  app.get('/users/:id/followers', authenticated, userController.getFollowers)

  app.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/tweets'))
  app.get('/admin/tweets', authenticatedAdmin, adminController.getTweets)
  app.delete('/admin/tweets/:id', authenticatedAdmin, adminController.deleteTweet)
  app.get('/admin/users', authenticatedAdmin, adminController.getUsers)

  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)
  app.get('/signin', userController.signInPage)
  app.post(
    '/signin',
    passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }),
    userController.signIn
  )
  app.get('/logout', userController.logout)

  app.post('/followships', authenticated, userController.addFollowing)
  app.delete('/followships/:id', authenticated, userController.removeFollowing)

  // 喜不喜歡
  app.get('/users/:id/likes', authenticated, userController.getLike)
  app.post('/tweets/:id/like', authenticated, userController.addLike)
  app.post('/tweets/:id/unlike', authenticated, userController.removeLike)
}
