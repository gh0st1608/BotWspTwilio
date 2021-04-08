const express = require('express');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('../api/routes/');
const { converter, notFound, handler } = require('../api/middlewares/error');
const morganMiddleware = require('../api/middlewares/morgan-middleware');
const { PORT, ENV } = require('./vars');
const logger = require('./logger');

const app = express();

app.use(morganMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(compress());

app.use(helmet());

app.use(cors());

app.use(routes);

app.use(converter);

app.use(notFound);

app.use(handler);

app.initServer = () => {
  app.listen(PORT, () => {
    logger.info(`server started on port ${PORT} (${ENV})`);
  });
};

module.exports = app;
