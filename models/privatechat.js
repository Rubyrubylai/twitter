'use strict';
module.exports = (sequelize, DataTypes) => {
  const PrivateChat = sequelize.define('PrivateChat', {
    sendId: DataTypes.INTEGER,
    receiveId: DataTypes.INTEGER,
    message: DataTypes.TEXT
  }, {});
  PrivateChat.associate = function(models) {
    PrivateChat.belongsTo(models.User)
  };
  return PrivateChat;
};