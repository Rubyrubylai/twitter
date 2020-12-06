'use strict';
module.exports = (sequelize, DataTypes) => {
  const Notice = sequelize.define('Notice', {
    description: DataTypes.TEXT,
    UserId: DataTypes.INTEGER,
    unread: DataTypes.BOOLEAN,
    TweetId: DataTypes.INTEGER
  }, {});
  Notice.associate = function(models) {
    Notice.belongsTo(models.User)
  };
  return Notice;
};