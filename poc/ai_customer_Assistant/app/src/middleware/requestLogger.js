const pino = require("pino");
const pinoHttp = require("pino-http");
const { env } = require("../config/env");
const { maybeMask } = require("../utils/pii");

const logger = pino({
  level: env.logLevel
});

function extractCallId(req) {
  if (req.headers["x-retell-call-id"]) return req.headers["x-retell-call-id"];
  if (req.body && req.body.call && req.body.call.call_id) return req.body.call.call_id;
  return undefined;
}

const httpLogger = pinoHttp({
  logger,
  customProps: (req) => ({
    retell_call_id: extractCallId(req)
  }),
  serializers: {
    req(req) {
      const body = req.body || {};
      const phone = body.args && body.args.phone_number;
      return {
        method: req.method,
        url: req.url,
        retell_call_id: extractCallId(req),
        phone_number: maybeMask(phone, env.piiMaskingEnabled)
      };
    }
  }
});

module.exports = { httpLogger, logger, extractCallId };
