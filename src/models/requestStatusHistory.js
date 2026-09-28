const { randomUUID } = require('node:crypto');

module.exports = (sequelize, DataTypes) => {
  const RequestStatusHistory = sequelize.define('RequestStatusHistory', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => randomUUID() },
    requestId: { type: DataTypes.UUID, allowNull: false, field: 'request_id' },
    oldStatus: { type: DataTypes.STRING(16), allowNull: false, field: 'old_status' },
    newStatus: { type: DataTypes.STRING(16), allowNull: false, field: 'new_status' },
    changedBy: { type: DataTypes.STRING(100), allowNull: true, field: 'changed_by' },
    comment: { type: DataTypes.TEXT, allowNull: true },
    changedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'changed_at' },
  }, {
    tableName: 'request_status_history',
    underscored: true,
    timestamps: false,
  });

  return RequestStatusHistory;
};