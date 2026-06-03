import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { serveStatic } from "@hono/node-server/serve-static";
import { readFileSync } from "fs";
import { connectDB } from "./db";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

import roomsRouter from "./routes/rooms";
import gameRouter from "./routes/game";

app.route("/api/rooms", roomsRouter);
app.route("/api/game", gameRouter);

app.use("/*", serveStatic({ root: "./dist/client" }));

app.get("/*", (c) => {
  const html = readFileSync("./dist/client/index.html", "utf-8");
  return c.html(html);
});

connectDB().then(() => {
  const port = Number(process.env.PORT) || 3000;
  console.log(`Server running on port ${port}`);
  serve({ fetch: app.fetch, port });
});
