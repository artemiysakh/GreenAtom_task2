const { randomUUID } = require('node:crypto');

module.exports = (sequelize, DataTypes) => {
  const Site = sequelize.define('Site', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: () => randomUUID() },
    name: { type: DataTypes.STRING(100), allowNull: false },
    code: { type: DataTypes.STRING(32), allowNull: false, unique: true },
    region: { type: DataTypes.STRING(100), allowNull: false },
    latitude: { type: DataTypes.FLOAT, allowNull: false },
    longitude: { type: DataTypes.FLOAT, allowNull: false },
  }, {
    tableName: 'sites',
    underscored: true,
    timestamps: true,
  });

  return Site;
};