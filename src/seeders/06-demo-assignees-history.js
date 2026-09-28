'use strict';
const { randomUUID } = require('node:crypto');

module.exports = {
  async up(queryInterface) {
    const [requests] = await queryInterface.sequelize.query('SELECT id, status FROM maintenance_requests LIMIT 10');
    const [technicians] = await queryInterface.sequelize.query('SELECT id FROM technicians');

    const now = new Date();
    const assignees = [];
    const history = [];

    requests.forEach((req, i) => {
      assignees.push({
        id: randomUUID(),
        request_id: req.id,
        technician_id: technicians[i % technicians.length].id,
        role: 'lead',
        hours: 4,
        created_at: now,
        updated_at: now,
      });
      assignees.push({
        id: randomUUID(),
        request_id: req.id,
        technician_id: technicians[(i + 1) % technicians.length].id,
        role: 'member',
        hours: 6,
        created_at: now,
        updated_at: now,
      });

      history.push({
        id: randomUUID(),
        request_id: req.id,
        old_status: 'new',
        new_status: req.status,
        changed_by: 'Диспетчер',
        comment: 'Начальное назначение',
        changed_at: now,
      });
    });

    await queryInterface.bulkInsert('request_assignees', assignees);
    await queryInterface.bulkInsert('request_status_history', history);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('request_status_history', null, {});
    await queryInterface.bulkDelete('request_assignees', null, {});
  },
};