'use strict'
const bcrypt = require('bcrypt-nodejs')
const faker = require('faker')

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.bulkInsert(
      'Users',
      [
        {
          email: 'root@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          name: 'root',
          avatar: 'https://img.icons8.com/ios/100/000000/guest-male-filled.png',
          introduction: faker.lorem.text(),
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: 'user1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          name: 'user1',
          avatar: 'https://img.icons8.com/ios/100/000000/guest-male-filled.png',
          introduction: faker.lorem.text(),
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: 'user2@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          name: 'user2',
          avatar: 'https://img.icons8.com/ios/100/000000/guest-male-filled.png',
          introduction: faker.lorem.text(),
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    )

    queryInterface.bulkInsert(
      'Tweets',
      Array.from({ length: 15 }).map((d, i) => ({
        description: faker.lorem.text(),
        createdAt: new Date(),
        updatedAt: new Date(),
        UserId: Math.floor(Math.random() * 3) + 1
      })),
      {}
    )

    return queryInterface.bulkInsert(
      'Replies',
      Array.from({ length: 45 }).map((d, i) => ({
        comment: faker.lorem.sentence(),
        UserId: Math.floor(Math.random() * 3) + 1,
        TweetId: (i % 15) + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('Users', null, {})
    queryInterface.bulkDelete('Replies', null, {})
    return queryInterface.bulkDelete('Tweets', null, {})
  }
}
