class HealthController {
  async check(req, res) {
    return res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new HealthController();