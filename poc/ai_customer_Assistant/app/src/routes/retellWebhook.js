const express = require("express");
const { verifyRetellSignature } = require("../middleware/retellSignature");
const { sendSuccess, sendError } = require("../utils/response");
const { logger } = require("../middleware/requestLogger");
const { getOrCreateSession, addCallEvent } = require("../services/callSessionService");

const router = express.Router();

router.post("/webhooks/retell", verifyRetellSignature, async (req, res) => {
  try {
    const payload = req.body || {};
    const callId = payload.call && payload.call.call_id;
    const callerPhone = payload.call && payload.call.caller_phone_number;
    const eventType = payload.event_type || "retell_webhook";

    if (!callId) {
      return sendError(res, 400, "call_id is required");
    }

    logger.info({
      route: "/webhooks/retell",
      retell_call_id: callId,
      event_type: eventType
    });

    const session = await getOrCreateSession(callId, callerPhone);
    await addCallEvent(session.id, eventType, payload);

    return sendSuccess(res, { received: true }, "Webhook received");
  } catch (error) {
    return sendError(res, 500, "Failed to process webhook");
  }
});

module.exports = { retellWebhookRouter: router };
