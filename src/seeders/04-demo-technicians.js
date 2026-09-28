'use strict';
const { randomUUID } = require('node:crypto');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('technicians', [
      { id: randomUUID(), full_name: 'Иванов Иван', specialization: 'Механик', employee_number: 'T-001', created_at: now, updated_at: now },
      { id: randomUUID(), full_name: 'Петров Пётр', specialization: 'Электрик', employee_number: 'T-002', created_at: now, updated_at: now },
      { id: randomUUID(), full_name: 'Сидоров Сидор', specialization: 'Электроник', employee_number: 'T-003', created_at: now, updated_at: now },
      { id: randomUUID(), full_name: 'Кузнецов Кузьма', specialization: 'Механик', employee_number: 'T-004', created_at: now, updated_at: now },
      { id: randomUUID(), full_name: 'Морозов Мороз', specialization: 'Электрик', employee_number: 'T-005', created_at: now, updated_at: now },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('technicians', null, {});
  },
};