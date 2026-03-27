const express = require("express");
const { httpLogger } = require("./middleware/requestLogger");
const { logger } = require("./middleware/requestLogger");
const { healthRouter } = require("./routes/health");
const { retellWebhookRouter } = require("./routes/retellWebhook");
const { functionsRouter } = require("./routes/functions");

const app = express();

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);

app.use(httpLogger);

app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const statusCode = res.statusCode || 200;
    if ((body && body.success === false) || statusCode >= 400) {
      logger.info({
        route: req.path,
        statusCode,
        response_message: body && body.message ? body.message : "unknown_error"
      });
    }
    return originalJson(body);
  };
  next();
});

app.use(healthRouter);
app.use(retellWebhookRouter);
app.use(functionsRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

module.exports = { app };
