const { env } = require("../config/env");

let RetellClient;
try {
  const sdk = require("retell-sdk");
  RetellClient = sdk.RetellClient;
} catch (error) {
  RetellClient = null;
}

function verifyRetellSignature(req, res, next) {
  console.log("signature check");
  if (!env.retellWebhookSecret) {
    return res.status(500).json({ success: false, message: "RETELL_WEBHOOK_SECRET_KEY is not set" });
  }

  const signature = req.get("X-Retell-Signature");
  const payload = req.rawBody ? req.rawBody.toString("utf8") : JSON.stringify(req.body || {});

  if (!signature) {
    return res.status(401).json({ success: false, message: "Missing Retell signature" });
  }

  if (!RetellClient) {
    return res.status(500).json({ success: false, message: "retell-sdk verify function not available" });
  }

  const client = new RetellClient();
  const isValid = client.verify(payload, env.retellWebhookSecret, signature);
  if (!isValid) {
    return res.status(401).json({ success: false, message: "Invalid Retell signature" });
  }

  return next();
}

module.exports = { verifyRetellSignature };
