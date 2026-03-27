const OpenAI = require("openai");
const { env } = require("../config/env");

const client = new OpenAI({
  apiKey: env.openaiApiKey
});

const systemPrompt = `You are an order support voice assistant for a retail company.

Your scope is strictly limited to:
1. order status
2. delivery ETA
3. return eligibility
4. return status
5. transferring the caller to a human agent

Rules:
- Never invent order information.
- Only answer using tool results returned by the backend.
- If order identity is unclear, ask one concise clarifying question.
- If a request is out of scope, policy-heavy, payment-related, complaint-heavy, or confidence is low, escalate.
- Keep responses short and suitable for speech.
- Do not expose internal field names or technical details.
- If a tool returns no result or ambiguity, say you are unable to verify and offer transfer to support.`;

const toolDefinitions = [
  {
    type: "function",
    name: "lookup_customer_orders",
    description: "Find recent orders for a customer using phone number"
  },
  {
    type: "function",
    name: "lookup_customer_or_order",
    description: "Find customer orders by phone number or get order status by order ID"
  },
  {
    type: "function",
    name: "lookup_order_status",
    description: "Get order and shipment status for a specific order"
  },
  {
    type: "function",
    name: "lookup_delivery_eta",
    description: "Get estimated delivery date and current shipment state"
  },
  {
    type: "function",
    name: "lookup_return_eligibility",
    description: "Check whether an order is eligible for return"
  },
  {
    type: "function",
    name: "lookup_return_status",
    description: "Get current return and refund state"
  },
  {
    type: "function",
    name: "create_escalation",
    description: "Create escalation record and return transfer guidance"
  }
];

async function runResponse({ input, tools, toolChoice }) {
  return client.responses.create({
    model: env.openaiModel,
    input,
    tools: tools || toolDefinitions,
    tool_choice: toolChoice
  });
}

module.exports = { systemPrompt, toolDefinitions, runResponse };
