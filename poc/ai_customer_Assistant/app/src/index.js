const { app } = require("./app");
const { env } = require("./config/env");

app.listen(env.port, () => {
  console.log(`Customer Voice Agent listening on port ${env.port}`);
});
