'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Followships', 'NoticeId', {
      type: Sequelize.INTEGER
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Followships', 'NoticeId')
  }
};
