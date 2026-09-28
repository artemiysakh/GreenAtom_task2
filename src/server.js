require('dotenv/config');
const { sequelize } = require('./models');
const app = require('./app');

const PORT = Number(process.env.PORT) || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connection established');

    const server = app.listen(PORT, () => {
      console.log(`Listening on ${PORT}`);
    });

    const shutdown = async () => {
      await sequelize.close();
      server.close(() => process.exit(0));
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  }
})();