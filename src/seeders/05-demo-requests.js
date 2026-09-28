'use strict';
const { randomUUID } = require('node:crypto');

module.exports = {
  async up(queryInterface) {
    const [equipment] = await queryInterface.sequelize.query('SELECT id FROM equipment ORDER BY serial_number');
    const now = new Date();

    const statuses = ['new', 'in_progress', 'done', 'rejected'];
    const priorities = ['low', 'medium', 'high', 'critical'];
    const requests = [];

    for (let i = 0; i < 20; i++) {
      requests.push({
        id: randomUUID(),
        equipment_id: equipment[i % equipment.length].id,
        title: `Заявка №${i + 1}`,
        description: `Описание заявки №${i + 1}`,
        priority: priorities[i % priorities.length],
        status: statuses[i % statuses.length],
        planned_at: new Date(Date.now() + i * 86400000),
        author: 'Диспетчер',
        created_at: new Date(Date.now() - (20 - i) * 86400000),
        updated_at: now,
      });
    }

    await queryInterface.bulkInsert('maintenance_requests', requests);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('maintenance_requests', null, {});
  },
};