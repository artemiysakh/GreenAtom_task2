const { randomUUID } = require('node:crypto');

module.exports = (sequelize, DataTypes) => {
  const EquipmentPassport = sequelize.define('EquipmentPassport', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => randomUUID() },
    equipmentId: { type: DataTypes.UUID, allowNull: false, unique: true, field: 'equipment_id' },
    manufacturer: { type: DataTypes.STRING(100), allowNull: false },
    model: { type: DataTypes.STRING(100), allowNull: false },
    ratedPower: { type: DataTypes.FLOAT, allowNull: false, field: 'rated_power' },
    lastVerifiedAt: { type: DataTypes.DATE, allowNull: true, field: 'last_verified_at' },
  }, {
    tableName: 'equipment_passports',
    underscored: true,
    timestamps: true,
  });

  return EquipmentPassport;
};