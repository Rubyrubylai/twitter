'use strict';
module.exports = (sequelize, DataTypes) => {
  const PublicChat = sequelize.define('PublicChat', {
    UserId: DataTypes.INTEGER,
    message: DataTypes.TEXT,
    unread: DataTypes.BOOLEAN
  }, {});
  PublicChat.associate = function(models) {
    PublicChat.belongsTo(models.User)
  };
  return PublicChat;
};