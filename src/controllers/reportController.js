const reportService = require('../services/report.service');

class ReportController {
  async getEquipmentLoad(req, res) {
    const result = await reportService.getEquipmentLoad(req.valid.query);
    return res.json({ data: result });
  }
}

module.exports = new ReportController();