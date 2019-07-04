'use strict'
module.exports = (sequelize, DataTypes) => {
  const Tweet = sequelize.define(
    'Tweet',
    {
      UserId: DataTypes.INTEGER,
      description: DataTypes.TEXT
    },
    {}
  )
  Tweet.associate = function(models) {
<<<<<<< HEAD
    Tweet.belongsTo(models.User, { onDelete: 'cascade', hooks: true })
    Tweet.hasMany(models.Reply)
    Tweet.hasMany(models.Like)
=======
    Tweet.belongsTo(models.User)
    Tweet.hasMany(models.Reply, { onDelete: 'cascade', hooks: true })
    Tweet.hasMany(models.Like, { onDelete: 'cascade', hooks: true })
>>>>>>> 80a64cb7f2770338a9f3506df51996fcb305a5ff
    Tweet.belongsToMany(models.User, {
      through: models.Like,
      foreignKey: 'TweetId',
      as: 'LikedUsers'
    })
  }
  return Tweet
}
