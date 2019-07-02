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
    Tweet.belongsTo(models.User)
    Tweet.hasMany(models.Reply, { onDelete: 'cascade', hooks: true })
    Tweet.hasMany(models.Like, { onDelete: 'cascade', hooks: true })
    Tweet.belongsToMany(models.User, {
      through: models.Like,
      foreignKey: 'TweetId',
      as: 'LikedUsers'
    })
  }
  return Tweet
}
