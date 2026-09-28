const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database.js').development;

const sequelize = new Sequelize(config);

const Site = require('./site')(sequelize, DataTypes);
const Equipment = require('./equipment')(sequelize, DataTypes);
const EquipmentPassport = require('./equipmentPassport')(sequelize, DataTypes);
const Technician = require('./technician')(sequelize, DataTypes);
const MaintenanceRequest = require('./maintenanceRequest')(sequelize, DataTypes);
const RequestStatusHistory = require('./requestStatusHistory')(sequelize, DataTypes);
const RequestAssignee = require('./requestAssignee')(sequelize, DataTypes);

Site.hasMany(Equipment, { foreignKey: 'siteId', as: 'equipment' });
Equipment.belongsTo(Site, { foreignKey: 'siteId', as: 'site' });

Equipment.hasOne(EquipmentPassport, { foreignKey: 'equipmentId', as: 'passport' });
EquipmentPassport.belongsTo(Equipment, { foreignKey: 'equipmentId', as: 'equipment' });

Equipment.hasMany(MaintenanceRequest, { foreignKey: 'equipmentId', as: 'requests' });
MaintenanceRequest.belongsTo(Equipment, { foreignKey: 'equipmentId', as: 'equipment' });

MaintenanceRequest.hasMany(RequestStatusHistory, { foreignKey: 'requestId', as: 'history' });
RequestStatusHistory.belongsTo(MaintenanceRequest, { foreignKey: 'requestId', as: 'request' });

MaintenanceRequest.belongsToMany(Technician, {
  through: RequestAssignee,
  foreignKey: 'requestId',
  otherKey: 'technicianId',
  as: 'technicians',
});
Technician.belongsToMany(MaintenanceRequest, {
  through: RequestAssignee,
  foreignKey: 'technicianId',
  otherKey: 'requestId',
  as: 'requests',
});

RequestAssignee.belongsTo(MaintenanceRequest, { foreignKey: 'requestId', as: 'request' });
RequestAssignee.belongsTo(Technician, { foreignKey: 'technicianId', as: 'technician' });

module.exports = {
  sequelize,
  Site,
  Equipment,
  EquipmentPassport,
  Technician,
  MaintenanceRequest,
  RequestStatusHistory,
  RequestAssignee,
};