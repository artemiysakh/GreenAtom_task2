const { Op } = require('sequelize');
const { MaintenanceRequest, Equipment, Technician } = require('../models');
const ALLOWED_SORT = ['createdAt', 'updatedAt', 'plannedAt', 'priority', 'status'];
const ALLOWED_ORDER = ['ASC', 'DESC'];

function normalizeSort(sort = {}) {
  const field = ALLOWED_SORT.includes(sort.field) ? sort.field : 'createdAt';
  const dir = ALLOWED_ORDER.includes(String(sort.order).toUpperCase())
    ? String(sort.order).toUpperCase()
    : 'DESC';
  return [field, dir];
}

async function findAll({ filter = {}, sort = { field: 'createdAt', order: 'desc' }, page = 1, limit = 20 } = {}) {
  const where = {};
  if (filter.equipmentId) where.equipmentId = filter.equipmentId;
  if (filter.status) where.status = filter.status;
  if (filter.priority) where.priority = filter.priority;

  if (filter.plannedFrom || filter.plannedTo) {
    where.plannedAt = {};
    if (filter.plannedFrom) where.plannedAt[Op.gte] = new Date(filter.plannedFrom);
    if (filter.plannedTo) where.plannedAt[Op.lte] = new Date(filter.plannedTo);
  }

  const { count, rows } = await MaintenanceRequest.findAndCountAll({
    where,
    include: [
      { model: Equipment, as: 'equipment', attributes: ['id', 'name', 'serialNumber'] },
      {
        model: Technician,
        as: 'technicians',
        attributes: ['id', 'fullName', 'specialization'],
        through: { attributes: ['role', 'hours'] },
      },
    ],
    order: [normalizeSort(sort)],
    limit,
    offset: (page - 1) * limit,
    distinct: true,
  });

  return { items: rows, total: count, page, limit };
}


async function findById(id) {
  return MaintenanceRequest.findByPk(id, {
    include: [
      { model: Equipment, as: 'equipment' },
      {
        model: Technician,
        as: 'technicians',
        through: { attributes: ['role', 'hours'] },
      },
    ],
  });
}

async function findByEquipmentId(equipmentId) {
  return MaintenanceRequest.findAll({ where: { equipmentId } });
}

async function findOpenByEquipmentId(equipmentId) {
  return MaintenanceRequest.findAll({
    where: {
      equipmentId,
      status: { [Op.notIn]: ['done', 'rejected'] },
    },
  });
}

async function create(data) {
  return MaintenanceRequest.create(data);
}

async function update(id, patch) {
  const req = await MaintenanceRequest.findByPk(id);
  if (!req) return null;
  return req.update(patch);
}

async function updateStatus(id, status, options = {}) {
  const req = await MaintenanceRequest.findByPk(id, options);
  if (!req) return null;
  return req.update({ status }, options);
}

async function remove(id) {
  const req = await MaintenanceRequest.findByPk(id);
  if (!req) return false;
  await req.destroy();
  return true;
}

module.exports = { findAll, findById, findByEquipmentId, findOpenByEquipmentId, create, update, updateStatus, remove };