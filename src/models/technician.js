const { randomUUID } = require('node:crypto');

module.exports = (sequelize, DataTypes) => {
  const Technician = sequelize.define('Technician', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => randomUUID() },
    fullName: { type: DataTypes.STRING(150), allowNull: false, field: 'full_name' },
    specialization: { type: DataTypes.STRING(100), allowNull: false },
    employeeNumber: { type: DataTypes.STRING(32), allowNull: false, unique: true, field: 'employee_number' },
  }, {
    tableName: 'technicians',
    underscored: true,
    timestamps: true,
  });

  return Technician;
};