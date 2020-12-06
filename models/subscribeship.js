'use strict';
module.exports = (sequelize, DataTypes) => {
  const Subscribeship = sequelize.define('Subscribeship', {
    subscriberId: DataTypes.INTEGER,
    subscribedId: DataTypes.INTEGER
  }, {});
  Subscribeship.associate = function(models) {
    
  };
  return Subscribeship;
};