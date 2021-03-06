'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    account: DataTypes.STRING,
    cover: DataTypes.STRING,
    avatar: DataTypes.STRING,
    role: DataTypes.STRING,
    introduction: DataTypes.TEXT
  }, {});
  User.associate = function (models) {
    User.hasMany(models.Reply)
    User.hasMany(models.Tweet)
    User.hasMany(models.Like)
    User.belongsToMany(User, {
      through: models.Followship,
      foreignKey: 'followingId',
      as: 'follower'
    })
    User.belongsToMany(User, {
      through: models.Followship,
      foreignKey: 'followerId',
      as: 'following'
    })
    User.hasMany(models.ReplyComment)
    User.hasMany(models.PublicChat)
    User.hasMany(models.PrivateChat)
    User.belongsToMany(User, {
      through: models.Subscribeship,
      foreignKey: 'subscriberId',
      as: 'subscribed'
    })
    User.belongsToMany(User, {
      through: models.Subscribeship,
      foreignKey: 'subscribedId',
      as: 'subscriber'
    })
    User.belongsToMany(User, {
      through: models.Notice,
      foreignKey: 'UserId',
      as: 'notified'
    })
    User.belongsToMany(User, {
      through: models.Notice,
      foreignKey: 'notifierId',
      as: 'notifier'
    })
  };
  return User;
};