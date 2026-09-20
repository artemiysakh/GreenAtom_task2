const { randomUUID } = require('node:crypto')

const items = new Map();

function findAll({ filter = {}, sort = { field: 'createdAt', order: 'desc' }, page = 1, limit = 20 } = {}) {
  let data = [...items.values()].filter((item) => {
    if (filter.equipmentId && item.equipmentId !== filter.equipmentId) return false;
    if (filter.status && item.status !== filter.status) return false;
    if (filter.priority && item.priority !== filter.priority) return false;
    return true;
  });

  const dir = sort.order === 'desc' ? -1 : 1;
  data.sort((a, b) => (a[sort.field] > b[sort.field] ? dir : -dir));

  const total = data.length;
  const offset = (page - 1) * limit;

  return { items: data.slice(offset, offset + limit), total, page, limit };
}

function findById(id) {
  return items.get(id) ?? null;
}

function findByEquipmentId(equipmentId) {
  return [...items.values()].filter((r) => r.equipmentId === equipmentId);
}

function findOpenByEquipmentId(equipmentId) {
  return [...items.values()].filter(
    (r) => r.equipmentId === equipmentId && r.status !== 'done' && r.status !== 'rejected'
  );
}

function create(data) {
  const id = randomUUID();
  const now = new Date().toISOString();

  const record = {
    id,
    equipmentId: data.equipmentId,
    title: data.title,
    description: data.description ?? '',
    priority: data.priority,
    status: data.status ?? 'new',
    plannedAt: data.plannedAt ?? null,
    createdAt: now,
    updatedAt: now,
  };

  items.set(id, record);
  return record;
}

function update(id, patch) {
  const current = items.get(id);
  if (!current) return null;

  const updated = { ...current, ...patch, id, createdAt: current.createdAt, status: current.status, updatedAt: new Date().toISOString() };
  items.set(id, updated);
  return updated;
}

function updateStatus(id, status) {
  const current = items.get(id);
  if (!current) return null;

  const updated = { ...current, status, updatedAt: new Date().toISOString() };
  items.set(id, updated);
  return updated;
}

function remove(id) {
  return items.delete(id);
}
module.exports = {
  remove, updateStatus, update, create, findOpenByEquipmentId,
  findByEquipmentId, findAll,findById
}