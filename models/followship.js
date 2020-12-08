'use strict';
module.exports = (sequelize, DataTypes) => {
  const Followship = sequelize.define('Followship', {
    followerId: DataTypes.INTEGER,
    followingId: DataTypes.INTEGER,
    NoticeId: DataTypes.INTEGER
  }, {});
  Followship.associate = function (models) {
    Followship.belongsTo(models.Notice)
  };
  return Followship;
};
