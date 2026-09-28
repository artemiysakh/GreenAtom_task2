const requestRepository = require('../repositories/request.repository.js');
const { NotFoundError, ConflictError, ValidationError } = require('../errors/errors.js');
const weatherService = require('./weather.service.js');
const { Site } = require('../models');

class EquipmentService {
  constructor({ equipmentRepository, siteService, requestRepository }) {
    this.repo = equipmentRepository;
    this.siteService = siteService;
    this.requestRepo = requestRepository;
  }

  async list({ type, status, sortBy = 'name', order = 'asc', page = 1, limit = 10 }) {
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    return this.repo.findAll({
      filter,
      sort: { field: sortBy, order },
      page: Number(page),
      limit: Number(limit),
    });
  }

  async getById(id) {
    const equipment = await this.repo.findById(id);
    if (!equipment) throw new NotFoundError('Оборудование не найдено');
    return equipment;
  }

  async create(data, options = {}) {
    const existing = await this.repo.findBySerialNumber(data.serialNumber);
    if (existing) throw new ConflictError('serialNumber уже используется');

    let siteId = data.siteId;
    if (!siteId && data.location) {
      const site = await this.siteService.findOrCreateByLocation(data.location, options);
      siteId = site.id;
    }
    if (!siteId) throw new ValidationError('location или siteId обязательны');

    return this.repo.create({
      siteId,
      name: data.name,
      type: data.type,
      serialNumber: data.serialNumber,
      status: data.status,
      installedAt: data.installedAt,
    }, options);
  }

  async update(id, patch) {
    const current = await this.repo.findById(id);
    if (!current) throw new NotFoundError('Оборудование не найдено');
    const allowed = {};
    if (patch.name !== undefined) allowed.name = patch.name;
    if (patch.type !== undefined) allowed.type = patch.type;
    if (patch.status !== undefined) allowed.status = patch.status;
    if (patch.installedAt !== undefined) allowed.installedAt = patch.installedAt;
    return this.repo.update(id, allowed);
  }

  async remove(id) {
    const equipment = await this.repo.findById(id);
    if (!equipment) throw new NotFoundError('Оборудование не найдено');
    const openRequests = await this.requestRepo.findOpenByEquipmentId(id);
    if (openRequests.length > 0) {
      throw new ConflictError('Нельзя удалить оборудование с открытыми заявками');
    }
    await this.repo.remove(id);
  }

  async listRequests(id, query) {
    const equipment = await this.repo.findById(id);
    if (!equipment) throw new NotFoundError('Оборудование не найдено');
    const { status, priority, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10 } = query;
    const filter = { equipmentId: id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    return this.requestRepo.findAll({
      filter,
      sort: { field: sortBy, order },
      page: Number(page),
      limit: Number(limit),
    });
  }

  async getWeather(id) {
    const equipment = await this.repo.findById(id);
    if (!equipment) throw new NotFoundError('Оборудование не найдено');
    if (!equipment.site) throw new ConflictError('У оборудования нет площадки');
    return weatherService.getForecast({
      lat: equipment.site.latitude,
      lon: equipment.site.longitude,
    });
  }
}

module.exports = new EquipmentService({
  equipmentRepository: require('../repositories/equipment.repository.js'),
  siteService: require('./site.service.js'),
  requestRepository: require('../repositories/request.repository.js'),
});