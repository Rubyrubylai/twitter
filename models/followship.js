'use strict';
module.exports = (sequelize, DataTypes) => {
  const Followship = sequelize.define('Followship', {
    followerId: DataTypes.INTEGER,
    followingId: DataTypes.INTEGER,
    // UserId: DataTypes.INTEGER
  }, {});
  Followship.associate = function (models) {
    // Followship.belongsTo(models.User)
  };
  return Followship;
};
