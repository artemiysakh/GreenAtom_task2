'use strict';
const { randomUUID } = require('node:crypto');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('sites', [
      { id: randomUUID(), name: 'Ветропарк Северный', code: 'SITE-N', region: 'Мурманская область', latitude: 68.97, longitude: 33.08, created_at: now, updated_at: now },
      { id: randomUUID(), name: 'Ветропарк Южный', code: 'SITE-S', region: 'Ростовская область', latitude: 47.23, longitude: 39.71, created_at: now, updated_at: now },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('sites', null, {});
  },
};