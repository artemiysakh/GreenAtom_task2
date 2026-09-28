const { randomUUID } = require('node:crypto');

module.exports = (sequelize, DataTypes) => {
  const Equipment = sequelize.define('Equipment', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => randomUUID() },
    siteId: { type: DataTypes.UUID, allowNull: true, field: 'site_id' },
    name: { type: DataTypes.STRING(100), allowNull: false },
    type: {
      type: DataTypes.STRING(32),
      allowNull: false,
      validate: { isIn: [['turbine', 'inverter', 'sensor', 'substation']] },
    },
    serialNumber: { type: DataTypes.STRING(64), allowNull: false, unique: true, field: 'serial_number' },
    status: {
      type: DataTypes.STRING(32),
      allowNull: false,
      validate: { isIn: [['operational', 'maintenance', 'fault', 'decommissioned']] },
    },
    installedAt: { type: DataTypes.DATE, allowNull: false, field: 'installed_at' },
  }, {
    tableName: 'equipment',
    underscored: true,
    timestamps: true,
  });

  return Equipment;
};