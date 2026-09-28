const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');

class ReportService {
  async getEquipmentLoad({ from, to, minRequests = 0 } = {}) {
    const sql = `
      SELECT
        e.id,
        e.name,
        e.serial_number AS "serialNumber",
        COUNT(r.id) AS "totalRequests",
        SUM(CASE WHEN r.status = 'done' THEN 1 ELSE 0 END) AS "closedRequests",
        COALESCE(SUM(ra.hours), 0) AS "totalHours",
        MAX(CASE WHEN r.status = 'done' THEN r.updated_at ELSE NULL END) AS "lastMaintenance"
      FROM equipment e
      LEFT JOIN maintenance_requests r ON r.equipment_id = e.id
      LEFT JOIN request_assignees ra ON ra.request_id = r.id
      WHERE (:from IS NULL OR r.created_at >= :from)
        AND (:to IS NULL OR r.created_at <= :to)
      GROUP BY e.id, e.name, e.serial_number
      HAVING COUNT(r.id) >= :minRequests
      ORDER BY "totalRequests" DESC
    `;

    return sequelize.query(sql, {
      replacements: {
        from: from || null,
        to: to || null,
        minRequests: Number(minRequests) || 0,
      },
      type: QueryTypes.SELECT,
    });
  }
}

module.exports = new ReportService();