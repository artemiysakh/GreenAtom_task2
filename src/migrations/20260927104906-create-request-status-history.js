'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('request_status_history', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      request_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'maintenance_requests', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      old_status: { type: Sequelize.STRING(16), allowNull: false },
      new_status: { type: Sequelize.STRING(16), allowNull: false },
      changed_by: { type: Sequelize.STRING(100), allowNull: true },
      comment: { type: Sequelize.TEXT, allowNull: true },
      changed_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('request_status_history');
  },
};