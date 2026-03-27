# Customer Voice Agent POC

Node.js + Express backend for a Retell-based order support voice agent. Uses Postgres for seeded test data and OpenAI Responses API for controlled reasoning.

## Folder Structure
- `app/` Node.js app (Express routes, services, middleware)
- `db/` Postgres schema and seed data
- `docker-compose.yml` App + Postgres

## Local Setup
1. Create environment file:
   - Copy `app/.env.example` to `app/.env` and fill in values.
2. Start services:
   - `docker-compose up --build`
3. Health check:
   - `GET http://localhost:3000/health`

## Retell Configuration
- Set Retell webhook URL to: `POST /webhooks/retell`
- Set Retell custom function URLs to:
  - `POST /functions/lookup-customer-orders`
  - `POST /functions/lookup-customer-or-order`
  - `POST /functions/lookup-order-status`
  - `POST /functions/lookup-delivery-eta`
  - `POST /functions/lookup-return-eligibility`
  - `POST /functions/lookup-return-status`
  - `POST /functions/create-escalation`
  - `POST /functions/get-human-transfer-target`
- Ensure `RETELL_WEBHOOK_SECRET_KEY` matches the Retell webhook signing secret.

## Seed Data
Postgres initializes with `db/schema.sql` and `db/seed.sql` via Docker. You can also run:
- `npm --prefix app run seed`

## OpenAI Responses API
- System prompt and tool definitions live in `app/src/services/openaiService.js`.
- The current code provides the wrapper; orchestration can be added in Phase 4.

## Notes
- All factual responses in custom function handlers are grounded in Postgres query results.
- Signature verification uses `retell-sdk` and the `X-Retell-Signature` header.

## Ngrok (optional)
If you want ngrok to run inside Docker and forward to the app via `host.docker.internal:3000`:
1. Copy `.env.ngrok.example` to `.env.ngrok` and set `NGROK_AUTHTOKEN`.
2. Start services with:
   - `NGROK_AUTHTOKEN=your_token docker-compose up --build -d`
3. Get the public URL:
   - `docker-compose logs -f ngrok`

