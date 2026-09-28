const z = require('zod');
const { ValidationError,NotFoundError, ConflictError } = require('../errors/errors');
const requestRepository =require( '../repositories/request.repository.js')
const equipmentRepository =require( '../repositories/equipment.repository.js')

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
    const request = await this.repo.findById(id);
    if (!request) throw new NotFoundError('Заявка не найдена');
    return request;
  }

  async create(data) {
    const equipment = await this.equipmentRepo.findById(data.equipmentId);
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
    const current = await this.repo.findById(id);
    if (!current) throw new NotFoundError('Заявка не найдена');

    const allowed = {};
    if (patch.title !== undefined) allowed.title = patch.title;
    if (patch.description !== undefined) allowed.description = patch.description;
    if (patch.priority !== undefined) allowed.priority = patch.priority;
    if (patch.plannedAt !== undefined) allowed.plannedAt = patch.plannedAt;

    return this.repo.update(id, allowed);
  }

 async changeStatus(id, nextStatus) {
  const {
    sequelize, MaintenanceRequest, RequestAssignee, RequestStatusHistory,
  } = require('../models/index.js');

  return sequelize.transaction(async (t) => {
    const current = await MaintenanceRequest.findByPk(id, {
      transaction: t, lock: t.LOCK.UPDATE,
    });
    if (!current) throw new NotFoundError('Заявка не найдена');

    const allowed = ALLOWED_TRANSITIONS[current.status] ?? [];
    if (!allowed.includes(nextStatus)) {
      throw new ConflictError(
        `Переход ${current.status} → ${nextStatus} недопустим`
      );
    }

    if (nextStatus === 'in_progress') {
      const count = await RequestAssignee.count({
        where: { requestId: id },
        transaction: t,
      });
      if (count === 0) {
        throw new ConflictError('Нельзя начать работу без назначенных исполнителей');
      }
    }

    const oldStatus = current.status;
    await current.update({ status: nextStatus }, { transaction: t });

    await RequestStatusHistory.create({
      requestId: id,
      oldStatus,
      newStatus: nextStatus,
      changedBy: 'system',
      comment: null,
    }, { transaction: t });

    return current;
  });
}

  async remove(id) {
    const current = await this.repo.findById(id);
    if (!current) throw new NotFoundError('Заявка не найдена');

    this.repo.remove(id);
  }
  async assignTeam(id, assignees) {
    const { sequelize, MaintenanceRequest, RequestAssignee, Technician } = require('../models');
    const leads = assignees.filter((a) => a.role === 'lead');
    if (leads.length !== 1) {
      throw new ValidationError(
        new z.ZodError([
          { code: 'custom', path: ['assignees'], message: 'Ровно один lead обязателен' },
        ])
      );
    }

    return sequelize.transaction(async (t) => {
    const request = await MaintenanceRequest.findByPk(id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!request) throw new NotFoundError('Заявка');
    const technicianIds = assignees.map((a) => a.technicianId);
    const technicians = await Technician.findAll({
      where: { id: technicianIds },
      transaction: t,
    });
    if (technicians.length !== technicianIds.length) {
      throw new NotFoundError('Специалист');
    }
    await RequestAssignee.destroy({
      where: { requestId: id },
      transaction: t,
    });

    await RequestAssignee.bulkCreate(
      assignees.map((a) => ({
        requestId: id,
        technicianId: a.technicianId,
        role: a.role,
        hours: a.hours,
      })),
      { transaction: t }
    );

    return RequestAssignee.findAll({
      where: { requestId: id },
      include: [{ model: Technician, as: 'technician' }],
      transaction: t,
    });
  });
}
  async unassignTechnician(id, userId) {
    const { RequestAssignee } = require('../models');

    const deleted = await RequestAssignee.destroy({
      where: { requestId: id, technicianId: userId },
    });
    if (!deleted) throw new NotFoundError('Назначение');
  }

  async getHistory(id) {
    const { MaintenanceRequest, RequestStatusHistory } = require('../models');
    const request = await MaintenanceRequest.findByPk(id);
    if (!request) throw new NotFoundError('Заявка');

    return RequestStatusHistory.findAll({
      where: { requestId: id },
      order: [['changed_at', 'ASC']],
    });
  }
}

module.exports= new RequestService();