require('dotenv').config();

const common = {
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'task2',
  username: process.env.DB_USER || 'task2',
  password: process.env.DB_PASSWORD || 'task2pass',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: { underscored: true, timestamps: true },
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
};

module.exports = {
  development: common,
  test: { ...common, database: `${common.database}_test` },
  production: common,
};