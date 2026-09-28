const equipmentService = require('../services/equipment.service.js');

class EquipmentController {
  async list(req, res) {
    const result = await equipmentService.list(req.valid.query);
    return res.json({
      data: result.items,
      meta: { total: result.total, page: result.page, limit: result.limit },
    });
  }

  async getById(req, res) {
    const result = await equipmentService.getById(req.valid.params.id);
    return res.json({ data: result });
  }

  async create(req, res) {
    const result = await equipmentService.create(req.valid.body);
    return res
      .status(201)
      .location(`/api/equipment/${result.id}`)
      .json({ data: result });
  }

  async update(req, res) {
    const result = await equipmentService.update(req.valid.params.id, req.valid.body);
    return res.json({ data: result });
  }

  async remove(req, res) {
    await equipmentService.remove(req.valid.params.id);
    return res.status(204).end();
  }

  async listRequests(req, res) {
    const result = await equipmentService.listRequests(req.valid.params.id, req.valid.query);
    return res.json({
      data: result.items,
      meta: { total: result.total, page: result.page, limit: result.limit },
    });
  }

  async getWeather(req, res) {
    const result = await equipmentService.getWeather(req.valid.params.id);
    return res.json({ data: result });
  }
}

module.exports = new EquipmentController();