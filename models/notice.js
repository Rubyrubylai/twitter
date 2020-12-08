'use strict';
module.exports = (sequelize, DataTypes) => {
  const Notice = sequelize.define('Notice', {
    description: DataTypes.TEXT,
    UserId: DataTypes.INTEGER,
    unread: DataTypes.BOOLEAN,
    TweetId: DataTypes.INTEGER,
    LikeId: DataTypes.INTEGER,
    ReplyId: DataTypes.INTEGER,
    ReplyCommentId: DataTypes.INTEGER,
    FollowshipId: DataTypes.INTEGER
  }, {});
  Notice.associate = function(models) {
    Notice.belongsTo(models.User)
    Notice.belongsTo(models.Tweet)
    Notice.belongsTo(models.Like)
    Notice.belongsTo(models.Reply)
    Notice.belongsTo(models.ReplyComment)
    Notice.belongsTo(models.Followship)
  };
  return Notice;
};