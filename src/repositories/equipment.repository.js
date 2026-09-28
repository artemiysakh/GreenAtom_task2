const { Equipment, Site, EquipmentPassport, MaintenanceRequest } = require('../models/index');

const ALLOWED_SORT = ['name', 'type', 'status', 'installedAt', 'createdAt'];
const ALLOWED_ORDER = ['ASC', 'DESC'];

async function findAll({ filter = {}, sort = { field: 'name', order: 'asc' }, page = 1, limit = 20 } = {}) {
  const where = {};
  if (filter.type) where.type = filter.type;
  if (filter.status) where.status = filter.status;

  const field = ALLOWED_SORT.includes(sort.field) ? sort.field : 'name';
  const dir = ALLOWED_ORDER.includes(String(sort.order).toUpperCase())
    ? String(sort.order).toUpperCase()
    : 'ASC';

  const { count, rows } = await Equipment.findAndCountAll({
    where,
    include: [
      { model: Site, as: 'site', attributes: ['id', 'name', 'code', 'region'] },
      { model: EquipmentPassport, as: 'passport' },
    ],
    order: [[field, dir]],
    limit,
    offset: (page - 1) * limit,
  });

  return { items: rows, total: count, page, limit };
}

async function findById(id) {
  return Equipment.findByPk(id, {
    include: [
      { model: Site, as: 'site' },
      { model: EquipmentPassport, as: 'passport' },
    ],
  });
}

async function findBySerialNumber(serialNumber) {
  return Equipment.findOne({ where: { serialNumber } });
}

async function create(data) {
  return Equipment.create(data);
}

async function update(id, patch) {
  const eq = await Equipment.findByPk(id);
  if (!eq) return null;
  return eq.update(patch);
}

async function remove(id) {
  const eq = await Equipment.findByPk(id);
  if (!eq) return false;
  await eq.destroy();
  return true;
}

module.exports = { findAll, findById, findBySerialNumber, create, update, remove };