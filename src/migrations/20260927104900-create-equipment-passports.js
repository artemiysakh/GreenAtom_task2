'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('equipment_passports', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      equipment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'equipment', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      manufacturer: { type: Sequelize.STRING(100), allowNull: false },
      model: { type: Sequelize.STRING(100), allowNull: false },
      rated_power: { type: Sequelize.FLOAT, allowNull: false },
      last_verified_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('equipment_passports');
  },
};