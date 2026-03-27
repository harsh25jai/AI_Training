# AGENTS.md

## Project
Customer Voice Agent POC for order support.

## Source of truth
Read `<prd doc>` before making architecture, schema, API, prompt, or deployment decisions.

## Mandatory rules
- Use Node.js + Express
- Use Postgres
- Use Retell for voice, custom functions, and transfer
- Use OpenAI Responses API with function calling
- Do not add vector DB in phase 1
- Keep all factual answers grounded in backend tool outputs
- Follow the PRD schema, endpoints, and escalation rules exactly
- keep javascript or anycoding you use simpler so that beginners can understand, do not use competitive programing or any complex codes