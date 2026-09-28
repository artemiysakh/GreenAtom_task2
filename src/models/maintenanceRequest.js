const { randomUUID } = require('node:crypto');

module.exports = (sequelize, DataTypes) => {
  const MaintenanceRequest = sequelize.define('MaintenanceRequest', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => randomUUID() },
    equipmentId: { type: DataTypes.UUID, allowNull: false, field: 'equipment_id' },
    title: { type: DataTypes.STRING(120), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    priority: {
      type: DataTypes.STRING(16),
      allowNull: false,
      validate: { isIn: [['low', 'medium', 'high', 'critical']] },
    },
    status: {
      type: DataTypes.STRING(16),
      allowNull: false,
      defaultValue: 'new',
      validate: { isIn: [['new', 'in_progress', 'done', 'rejected']] },
    },
    plannedAt: { type: DataTypes.DATE, allowNull: true, field: 'planned_at' },
    author: { type: DataTypes.STRING(100), allowNull: true },
  }, {
    tableName: 'maintenance_requests',
    underscored: true,
    timestamps: true,
  });

  return MaintenanceRequest;
};