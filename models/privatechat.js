'use strict';
module.exports = (sequelize, DataTypes) => {
  const PrivateChat = sequelize.define('PrivateChat', {
    UserId: DataTypes.INTEGER,
    receiveId: DataTypes.INTEGER,
    message: DataTypes.TEXT,
    unread: DataTypes.BOOLEAN
  }, {});
  PrivateChat.associate = function(models) {
    PrivateChat.belongsTo(models.User, {
      foreignKey: 'UserId',
      as: 'Sender'
    })
    PrivateChat.belongsTo(models.User, {
      foreignKey: 'receiveId',
      as: 'Receiver'
    })
  };
  return PrivateChat;
};