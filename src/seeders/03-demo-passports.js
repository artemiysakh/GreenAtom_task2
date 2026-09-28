'use strict';
const { randomUUID } = require('node:crypto');

module.exports = {
  async up(queryInterface) {
    const [equipment] = await queryInterface.sequelize.query('SELECT id, name FROM equipment ORDER BY serial_number');
    const now = new Date();

    const passports = equipment.map((e, i) => ({
      id: randomUUID(),
      equipment_id: e.id,
      manufacturer: ['Vestas', 'Siemens', 'ABB', 'GE'][i % 4],
      model: `Model-${i + 1}`,
      rated_power: 2.5 + i * 0.5,
      last_verified_at: new Date('2025-01-01T00:00:00Z'),
      created_at: now,
      updated_at: now,
    }));

    await queryInterface.bulkInsert('equipment_passports', passports);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('equipment_passports', null, {});
  },
};