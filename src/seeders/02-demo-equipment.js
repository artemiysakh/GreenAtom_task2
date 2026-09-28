'use strict';
const { randomUUID } = require('node:crypto');

module.exports = {
  async up(queryInterface) {
    const [sites] = await queryInterface.sequelize.query('SELECT id FROM sites ORDER BY code');
    const siteN = sites[0].id;
    const siteS = sites[1].id;
    const now = new Date();

    const equipment = [
      { name: 'Turbine A1', type: 'turbine', serial: 'WT-A1', status: 'operational', site: siteN },
      { name: 'Turbine A2', type: 'turbine', serial: 'WT-A2', status: 'operational', site: siteN },
      { name: 'Inverter B1', type: 'inverter', serial: 'IN-B1', status: 'maintenance', site: siteN },
      { name: 'Sensor C1', type: 'sensor', serial: 'SN-C1', status: 'operational', site: siteS },
      { name: 'Substation D1', type: 'substation', serial: 'SB-D1', status: 'fault', site: siteS },
      { name: 'Turbine A3', type: 'turbine', serial: 'WT-A3', status: 'operational', site: siteS },
    ];

    await queryInterface.bulkInsert('equipment', equipment.map((e) => ({
      id: randomUUID(),
      site_id: e.site,
      name: e.name,
      type: e.type,
      serial_number: e.serial,
      status: e.status,
      installed_at: new Date('2023-05-12T10:00:00Z'),
      created_at: now,
      updated_at: now,
    })));
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('equipment', null, {});
  },
};