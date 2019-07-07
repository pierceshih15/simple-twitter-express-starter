var chai = require('chai')
var request = require('supertest')
var sinon = require('sinon')
var app = require('../../app')
var helpers = require('../../_helpers')
var should = chai.should()
const db = require('../../models')

describe('# followship request', () => {
  context('#create', () => {
    describe('when user1 wants to follow user2', () => {
      before(async () => {
        this.ensureAuthenticated = sinon.stub(helpers, 'ensureAuthenticated').returns(true)
        this.getUser = sinon.stub(helpers, 'getUser').returns({ id: 1, Followings: [] })
        await db.User.destroy({ where: {}, truncate: true })
        await db.Followship.destroy({ where: {}, truncate: true })
        await db.User.create({})
        await db.User.create({})
      })

      it('can not follow self', done => {
        request(app)
          .post('/followships')
          // .send('id=1') 這裡的 id 應該要寫得更清楚是為了寫入到 followship 內的 followingId 欄位
          .send('followingId=1')
          .set('Accept', 'application/json')
          // .expect(200) Create followship 並不需要重新 render 一個新頁面，簡單用 res.redirect() 跳轉就好
          .expect(302)
          .end(function(err, res) {
            if (err) return done(err)
            db.User.findByPk(1, {
              include: [{ model: db.User, as: 'Followers' }, { model: db.User, as: 'Followings' }]
            }).then(user => {
              user.Followings.length.should.equal(0)
              return done()
            })
          })
      })

      it('will show following', done => {
        request(app)
          .post('/followships')
          // .send('id=2') 這裡的 id 應該要寫得更清楚是為了寫入到 followship 內的 followingId 欄位
          .send('followingId=2')
          .set('Accept', 'application/json')
          .expect(302)
          .end(function(err, res) {
            if (err) return done(err)
            db.User.findByPk(1, {
              include: [{ model: db.User, as: 'Followers' }, { model: db.User, as: 'Followings' }]
            }).then(user => {
              user.Followings.length.should.equal(1)
              return done()
            })
          })
      })

      after(async () => {
        this.ensureAuthenticated.restore()
        this.getUser.restore()
        await db.User.destroy({ where: {}, truncate: true })
        await db.Followship.destroy({ where: {}, truncate: true })
      })
    })
  })

  context('#destroy', () => {
    describe('when user1 wants to unfollow user2', () => {
      before(async () => {
        this.ensureAuthenticated = sinon.stub(helpers, 'ensureAuthenticated').returns(true)
        this.getUser = sinon.stub(helpers, 'getUser').returns({ id: 1, Followings: [] })
        await db.User.destroy({ where: {}, truncate: true })
        await db.Followship.destroy({ where: {}, truncate: true })
        await db.User.create({})
        await db.User.create({})
        await db.Followship.create({ followerId: 1, followingId: 2 })
      })

      it('will update following index', done => {
        request(app)
          // .delete('/followships/2') 原來左邊的規格看起來像 /followship/:followingId，不符合 RESTful 的網址風格，應改為 DETELE /followship/:id，id 是緊跟著前面的資源，在這裡就是直接刪除 followship 資料表中唯一的一筆紀錄
          .delete('/followships/1')
          .set('Accept', 'application/json')
          .expect(302)
          .end(function(err, res) {
            if (err) return done(err)
            db.User.findByPk(1, {
              include: [{ model: db.User, as: 'Followers' }, { model: db.User, as: 'Followings' }]
            }).then(user => {
              user.Followings.length.should.equal(0)
              return done()
            })
          })
      })

      after(async () => {
        this.ensureAuthenticated.restore()
        this.getUser.restore()
        await db.User.destroy({ where: {}, truncate: true })
        await db.Followship.destroy({ where: {}, truncate: true })
      })
    })
  })
})
