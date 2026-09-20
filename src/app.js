const express = require('express') 
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const notFound = require('./middlewares/notFound')
const requestId = require('./middlewares/requestId')
const logger = require( './middlewares/logger')
const errorHandler = require('./middlewares/errorHandler')
const routes = require('./routes/routes')

class App {
    constructor(){
        this.server = express();
        this.middlewares();
        this.routes();
        this.errorHandlers()
    }
    middlewares(){
        this.server.use(helmet())
        this.server.use(cors({
  origin: (process.env.CORS_ORIGINS || '').split(',').filter(Boolean),
}));
        this.server.use(rateLimit({
            windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60000,
            max: Number(process.env.RATE_LIMIT_MAX) || 100,
            standardHeaders: true,
            legacyHeaders: false,
        }))
        this.server.use(express.json({ limit: '100kb' }));
        this.server.use(requestId);
        this.server.use(logger);
  }

  routes() {
    this.server.use('/api', routes);
  }

  errorHandlers() {
    this.server.use(notFound);
    this.server.use(errorHandler);
  }
}
module.exports = new App().server
