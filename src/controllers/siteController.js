const siteService = require('../services/site.service');

class SiteController {
  async getSummary(req, res) {
    const result = await siteService.getSummary(req.valid.params.id);
    return res.json({ data: result });
  }
}

module.exports = new SiteController();