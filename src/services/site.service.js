const { Sequelize } = require('sequelize');
const { sequelize, Site, Equipment, MaintenanceRequest } = require('../models');
const { NotFoundError } = require('../errors/errors');

class SiteService {
  async findOrCreateByLocation(location, options = {}) {
  const [site] = await Site.findOrCreate({
    where: {
      latitude: location.lat,
      longitude: location.lon,
    },
    defaults: {
      name: `Site ${location.lat},${location.lon}`,
      code: `SITE-${location.lat}-${location.lon}`.slice(0, 32),
      region: 'unknown',
      latitude: location.lat,
      longitude: location.lon,
    },
    transaction: options.transaction,
  });
  return site;
}
  async getSummary(id) {
    const site = await Site.findByPk(id);
    if (!site) throw new NotFoundError('Площадка');

    const byStatus = await MaintenanceRequest.findAll({
      attributes: [
        'status',
        'priority',
        [Sequelize.fn('COUNT', Sequelize.col('MaintenanceRequest.id')), 'count'],
      ],
      include: [{
        model: Equipment,
        as: 'equipment',
        attributes: [],
        where: { siteId: id },
      }],
      group: ['MaintenanceRequest.status', 'MaintenanceRequest.priority'],
      raw: true,
    });

    const [avgResult] = await sequelize.query(`
      SELECT AVG(
        (julianday(r.updated_at) - julianday(r.created_at)) * 24
      ) AS avg_hours
      FROM maintenance_requests r
      JOIN equipment e ON e.id = r.equipment_id
      WHERE e.site_id = :siteId AND r.status = 'done'
    `, {
      replacements: { siteId: id },
      type: Sequelize.QueryTypes.SELECT,
    });

    return {
      site: { id: site.id, name: site.name, code: site.code },
      byStatus,
      avgClosureHours: avgResult?.avg_hours ?? null,
    };
  }
}

module.exports = new SiteService();