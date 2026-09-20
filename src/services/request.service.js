const requestRepository =require( '../repositories/request.repository.js')
const equipmentRepository =require( '../repositories/equipment.repository.js')
const { NotFoundError, ConflictError }=require( '../errors/errors.js')

const ALLOWED_TRANSITIONS = {
  new: ['in_progress', 'rejected'],
  in_progress: ['done', 'rejected'],
  done: [],
  rejected: [],
};

class RequestService {
  constructor() {
    this.repo = requestRepository;
    this.equipmentRepo = equipmentRepository;
  }

  async list({ equipmentId, status, priority, plannedFrom, plannedTo, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10 }) {
    const filter = {};
    if (equipmentId) filter.equipmentId = equipmentId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (plannedFrom) filter.plannedFrom = plannedFrom;
    if (plannedTo) filter.plannedTo = plannedTo;

    return this.repo.findAll({
      filter,
      sort: { field: sortBy, order },
      page: Number(page),
      limit: Number(limit),
    });
  }

  async getById(id) {
    const request = this.repo.findById(id);
    if (!request) throw new NotFoundError('Заявка не найдена');
    return request;
  }

  async create(data) {
    const equipment = this.equipmentRepo.findById(data.equipmentId);
    if (!equipment) throw new NotFoundError('Оборудование не найдено');

    return this.repo.create({
      equipmentId: data.equipmentId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      plannedAt: data.plannedAt,
    });
  }

  async update(id, patch) {
    const current = this.repo.findById(id);
    if (!current) throw new NotFoundError('Заявка не найдена');

    const allowed = {};
    if (patch.title !== undefined) allowed.title = patch.title;
    if (patch.description !== undefined) allowed.description = patch.description;
    if (patch.priority !== undefined) allowed.priority = patch.priority;
    if (patch.plannedAt !== undefined) allowed.plannedAt = patch.plannedAt;

    return this.repo.update(id, allowed);
  }

  async changeStatus(id, nextStatus) {
    const current = this.repo.findById(id);
    if (!current) throw new NotFoundError('Заявка не найдена');

    const allowed = ALLOWED_TRANSITIONS[current.status] ?? [];
    if (!allowed.includes(nextStatus)) {
      throw new ConflictError(
        `Переход ${current.status} → ${nextStatus} недопустим`
      );
    }

    return this.repo.updateStatus(id, nextStatus);
  }

  async remove(id) {
    const current = this.repo.findById(id);
    if (!current) throw new NotFoundError('Заявка не найдена');

    this.repo.remove(id);
  }
}

module.exports= new RequestService();