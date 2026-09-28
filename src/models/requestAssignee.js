const { randomUUID } = require('node:crypto');

module.exports = (sequelize, DataTypes) => {
  const RequestAssignee = sequelize.define('RequestAssignee', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => randomUUID() },
    requestId: { type: DataTypes.UUID, allowNull: false, field: 'request_id' },
    technicianId: { type: DataTypes.UUID, allowNull: false, field: 'technician_id' },
    role: {
      type: DataTypes.STRING(16),
      allowNull: false,
      validate: { isIn: [['lead', 'member']] },
    },
    hours: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  }, {
    tableName: 'request_assignees',
    underscored: true,
    timestamps: true,
    indexes: [
      { unique: true, fields: ['request_id', 'technician_id'] },
    ],
  });

  return RequestAssignee;
};