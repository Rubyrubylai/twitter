'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('privateChats', 'unread', {
      type: Sequelize.BOOLEAN
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('privateChats', null)
  }
};
