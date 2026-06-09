import { createApp } from "./app.js";

import "dotenv/config";

const port = process.env.PORT || 4000;
const app = createApp();

app.listen(port, () => {
  console.log(`Hostel & Mess API listening on port ${port}`);
});