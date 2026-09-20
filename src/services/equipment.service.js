const equipmentRepository = require('../repositories/equipment.repository.js') 
const requestRepository =require( '../repositories/request.repository.js')
const  { NotFoundError, ConflictError } = require( '../errors/errors.js')
const weatherService =require( './weather.service.js')

class EquipmentService {
  constructor() {
    this.repo = equipmentRepository;
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
    const equipment = this.repo.findById(id);
    if (!equipment) throw new NotFoundError('Оборудование не найдено');
    return equipment;
  }

  async create(data) {
    const existing = this.repo.findBySerialNumber(data.serialNumber);
    if (existing) throw new ConflictError('serialNumber уже используется');

    return this.repo.create({
      name: data.name,
      type: data.type,
      serialNumber: data.serialNumber,
      location: data.location,
      status: data.status,
      installedAt: data.installedAt,
    });
  }

  async update(id, patch) {
    const current = this.repo.findById(id);
    if (!current) throw new NotFoundError('Оборудование не найдено');

    const allowed = {};
    if (patch.name !== undefined) allowed.name = patch.name;
    if (patch.type !== undefined) allowed.type = patch.type;
    if (patch.location !== undefined) allowed.location = patch.location;
    if (patch.status !== undefined) allowed.status = patch.status;
    if (patch.installedAt !== undefined) allowed.installedAt = patch.installedAt;

    return this.repo.update(id, allowed);
  }

  async remove(id) {
    const equipment = this.repo.findById(id);
    if (!equipment) throw new NotFoundError('Оборудование не найдено');

    const openRequests = this.requestRepo.findOpenByEquipmentId(id);
    if (openRequests.length > 0) {
      throw new ConflictError('Нельзя удалить оборудование с открытыми заявками');
    }

    this.repo.remove(id);
  }

  async listRequests(id, query) {
    const equipment = this.repo.findById(id);
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
    const equipment = this.repo.findById(id);
    if (!equipment) throw new NotFoundError('Оборудование не найдено');

    return weatherService.getForecast(equipment.location);
  }
}
module.exports= new EquipmentService();