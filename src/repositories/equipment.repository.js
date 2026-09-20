const {randomUUID} = require('node:crypto');

const items = new Map();
const serialIndex = new Map();

function findAll({filter = {}, sort = { field: 'name', order: 'asc'}, page = 1, limit = 20 } = {}) {
  let data = [...items.values()].filter((item) =>
    Object.entries(filter).every(([k, v]) => v == null || item[k] === v)
  );

  const dir = sort.order === 'desc' ? -1 : 1;
  data.sort((a, b) => (a[sort.field] > b[sort.field] ? dir : -dir));

  const total = data.length;
  const offset = (page - 1) * limit;

  return { items: data.slice(offset, offset + limit), total, page, limit };
}

function findById(id) {
  return items.get(id) ?? null;
}

function findBySerialNumber(serialNumber) {
  const id = serialIndex.get(serialNumber);
  return id ? items.get(id) ?? null : null;
}

function create(data) {
  const id = randomUUID();
  const now = new Date().toISOString();

  const record = {
    id,
    name: data.name,
    type: data.type,
    serialNumber: data.serialNumber,
    location: data.location,
    status: data.status,
    installedAt: data.installedAt,
    createdAt: now,
    updatedAt: now,
  };

  items.set(id, record);
  serialIndex.set(record.serialNumber, id);
  return record;
}

function update(id, patch) {
  const current = items.get(id);
  if (!current) return null;

  const updated = { ...current, ...patch, id, createdAt: current.createdAt, updatedAt: new Date().toISOString() };
  items.set(id, updated);
  return updated;
}

function remove(id) {
  const current = items.get(id);
  if (!current) return false;
  items.delete(id);
  serialIndex.delete(current.serialNumber);
  return true;
}
module.exports = {
  findAll, remove, update, create, findBySerialNumber,findById,  
}