'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('maintenance_requests', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      equipment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'equipment', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      title: { type: Sequelize.STRING(120), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
      priority: { type: Sequelize.STRING(16), allowNull: false },
      status: { type: Sequelize.STRING(16), allowNull: false, defaultValue: 'new' },
      planned_at: { type: Sequelize.DATE, allowNull: true },
      author: { type: Sequelize.STRING(100), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('maintenance_requests');
  },
};