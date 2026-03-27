const express = require("express");
const { verifyRetellSignature } = require("../middleware/retellSignature");
const { sendSuccess, sendError } = require("../utils/response");
const customerService = require("../services/customerService");
const orderService = require("../services/orderService");
const returnService = require("../services/returnService");
const { getOrCreateSession } = require("../services/callSessionService");
const { createEscalation } = require("../services/escalationService");
const { env } = require("../config/env");
const { logger } = require("../middleware/requestLogger");

const router = express.Router();

router.use(verifyRetellSignature);

function getArgs(req) {
  return (req.body && req.body.args) || {};
}

function logFunctionCall(req, extra) {
  const callId = req.body && req.body.call && req.body.call.call_id;
  const name = req.body && req.body.name;
  logger.info({
    route: req.path,
    retell_call_id: callId,
    function_name: name,
    ...extra
  });
}

router.post("/functions/lookup-customer-orders", async (req, res) => {
  try {
     console.log('lookup-order-status HIT');
    const { phone_number: phoneNumber } = getArgs(req);
    if (!phoneNumber) return sendError(res, 400, "phone_number is required");

    logFunctionCall(req, { phone_number: "masked" });
    const customer = await customerService.findCustomerByPhone(phoneNumber);
    if (!customer) {
      return sendSuccess(res, null, "No customer found for that phone number");
    }

    const orders = await customerService.getOrdersByCustomerId(customer.id);

    return sendSuccess(
      res,
      {
        customer: {
          customer_id: customer.external_customer_id,
          name: customer.full_name,
          phone_number: customer.phone_number
        },
        orders: orders.map((order) => ({
          order_id: order.order_id,
          order_status: order.order_status,
          order_date: order.order_date
        }))
      },
      "Customer orders retrieved"
    );
  } catch (error) {
    return sendError(res, 500, "Failed to lookup customer orders");
  }
});

router.post("/functions/lookup-order-status", async (req, res) => {
  try {
    const { order_id: orderId } = getArgs(req);
    if (!orderId) return sendError(res, 400, "order_id is required");

    logFunctionCall(req, { order_id: orderId });
    const order = await orderService.getOrderWithShipment(orderId);
    if (!order) {
      return sendSuccess(
        res,
        { found: false, order_id: orderId },
        "No order found for that order ID",
        { flatten: true }
      );
    }

    const latestEvent = order.tracking_payload && order.tracking_payload.latest_event;
    console.log(" susess")
    return sendSuccess(
      res,
      {
        found: true,
        order_id: order.order_id,
        order_status: order.order_status,
        shipment_status: order.shipment_status,
        tracking_number: order.tracking_number,
        last_tracking_update_at: order.last_tracking_update_at,
        latest_event: latestEvent
      },
      `Order ${order.order_id} is ${order.order_status}.`,
      { flatten: true }
    );
  } catch (error) {
    return sendError(res, 500, "Failed to lookup order status");
  }
});

router.post("/functions/lookup-customer-or-order", async (req, res) => {
  try {
    const { phone_number: phoneNumber, order_id: orderId } = getArgs(req);

    if (!phoneNumber && !orderId) {
      return sendError(res, 400, "phone_number or order_id is required");
    }

    const logExtra = {};
    if (phoneNumber) logExtra.phone_number = "masked";
    if (orderId) logExtra.order_id = orderId;
    logFunctionCall(req, logExtra);

    if (orderId && !phoneNumber) {
      const order = await orderService.getOrderWithShipment(orderId);
      if (!order) {
        return sendSuccess(
          res,
          { result_type: "order_status", found: false, order_id: orderId },
          "No order found for that order ID"
        );
      }

      const latestEvent = order.tracking_payload && order.tracking_payload.latest_event;
      return sendSuccess(
        res,
        {
          result_type: "order_status",
          found: true,
          order_id: order.order_id,
          order_status: order.order_status,
          shipment_status: order.shipment_status,
          tracking_number: order.tracking_number,
          last_tracking_update_at: order.last_tracking_update_at,
          latest_event: latestEvent
        },
        `Order ${order.order_id} is ${order.order_status}.`
      );
    }

    if (phoneNumber && !orderId) {
      const customer = await customerService.findCustomerByPhone(phoneNumber);
      if (!customer) {
        return sendSuccess(res, null, "No customer found for that phone number");
      }

      const orders = await customerService.getOrdersByCustomerId(customer.id);

      return sendSuccess(
        res,
        {
          result_type: "customer_orders",
          customer: {
            customer_id: customer.external_customer_id,
            name: customer.full_name,
            phone_number: customer.phone_number
          },
          orders: orders.map((order) => ({
            order_id: order.order_id,
            order_status: order.order_status,
            order_date: order.order_date
          }))
        },
        "Customer orders retrieved"
      );
    }

    const customer = await customerService.findCustomerByPhone(phoneNumber);
    if (!customer) {
      return sendSuccess(res, null, "No customer found for that phone number");
    }

    const orders = await customerService.getOrdersByCustomerId(customer.id);
    const matchingOrder = orders.find((order) => order.order_id === orderId);
    if (!matchingOrder) {
      return sendSuccess(
        res,
        {
          result_type: "order_status",
          found: false,
          order_id: orderId,
          customer: {
            customer_id: customer.external_customer_id,
            name: customer.full_name,
            phone_number: customer.phone_number
          }
        },
        "No order found for that phone number and order ID"
      );
    }

    const order = await orderService.getOrderWithShipment(orderId);
    if (!order) {
      return sendSuccess(
        res,
        {
          result_type: "order_status",
          found: false,
          order_id: orderId,
          customer: {
            customer_id: customer.external_customer_id,
            name: customer.full_name,
            phone_number: customer.phone_number
          }
        },
        "No order found for that phone number and order ID"
      );
    }

    const latestEvent = order.tracking_payload && order.tracking_payload.latest_event;
    return sendSuccess(
      res,
      {
        result_type: "order_status",
        found: true,
        order_id: order.order_id,
        order_status: order.order_status,
        shipment_status: order.shipment_status,
        tracking_number: order.tracking_number,
        last_tracking_update_at: order.last_tracking_update_at,
        latest_event: latestEvent,
        customer: {
          customer_id: customer.external_customer_id,
          name: customer.full_name,
          phone_number: customer.phone_number
        }
      },
      `Order ${order.order_id} is ${order.order_status}.`
    );
  } catch (error) {
    return sendError(res, 500, "Failed to lookup customer or order");
  }
});

router.post("/functions/lookup-delivery-eta", async (req, res) => {
  try {
    const { order_id: orderId } = getArgs(req);
    if (!orderId) return sendError(res, 400, "order_id is required");

    logFunctionCall(req, { order_id: orderId });
    const order = await orderService.getOrderWithShipment(orderId);
    if (!order) {
      return sendSuccess(res, null, "No order found for that order ID");
    }

    return sendSuccess(
      res,
      {
        order_id: order.order_id,
        shipment_status: order.shipment_status,
        estimated_delivery_date: order.expected_delivery_date
      },
      `Order ${order.order_id} delivery information retrieved.`
    );
  } catch (error) {
    return sendError(res, 500, "Failed to lookup delivery ETA");
  }
});

router.post("/functions/lookup-return-eligibility", async (req, res) => {
  try {
    const { order_id: orderId } = getArgs(req);
    if (!orderId) return sendError(res, 400, "order_id is required");

    logFunctionCall(req, { order_id: orderId });
    const order = await orderService.getOrderWithShipment(orderId);
    if (!order) {
      return sendSuccess(res, null, "No order found for that order ID");
    }

    return sendSuccess(
      res,
      {
        order_id: order.order_id,
        return_eligible: order.return_eligible,
        reason: order.return_eligible ? "Within return window" : "Not eligible"
      },
      `Return eligibility checked for ${order.order_id}.`
    );
  } catch (error) {
    return sendError(res, 500, "Failed to lookup return eligibility");
  }
});

router.post("/functions/lookup-return-status", async (req, res) => {
  try {
    const { order_id: orderId } = getArgs(req);
    if (!orderId) return sendError(res, 400, "order_id is required");

    logFunctionCall(req, { order_id: orderId });
    const returnInfo = await returnService.getReturnByOrderId(orderId);
    if (!returnInfo) {
      return sendSuccess(res, null, "No return record found for that order ID");
    }

    const pickupDate = returnInfo.metadata && returnInfo.metadata.pickup_date;

    return sendSuccess(
      res,
      {
        order_id: returnInfo.order_id,
        return_status: returnInfo.return_status,
        refund_amount: returnInfo.refund_amount,
        pickup_date: pickupDate
      },
      `Return status retrieved for ${returnInfo.order_id}.`
    );
  } catch (error) {
    return sendError(res, 500, "Failed to lookup return status");
  }
});

router.post("/functions/create-escalation", async (req, res) => {
  try {
    const { reason } = getArgs(req);
    const callId = req.body && req.body.call && req.body.call.call_id;
    const callerPhone = req.body && req.body.call && req.body.call.caller_phone_number;

    if (!callId) return sendError(res, 400, "call_id is required");

    logFunctionCall(req, { reason: reason || "Low confidence or out of scope" });
    const session = await getOrCreateSession(callId, callerPhone);
    const escalation = await createEscalation(session.id, reason || "Low confidence or out of scope");

    return sendSuccess(
      res,
      escalation,
      "Escalation has been created. Transfer the caller to support."
    );
  } catch (error) {
    return sendError(res, 500, "Failed to create escalation");
  }
});

router.post("/functions/get-human-transfer-target", async (req, res) => {
  return sendSuccess(
    res,
    {
      transfer_target: env.humanSupportNumber,
      transfer_type: env.defaultTransferType
    },
    "Transfer target ready"
  );
});

module.exports = { functionsRouter: router };
