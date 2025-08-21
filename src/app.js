import { Hono } from "hono";
import { serve } from "@hono/node-server";

import NodeCache from "node-cache";

import "dotenv/config";

import { getShifts } from "./form.js";

export const app = new Hono();
export const cache = new NodeCache({ stdTTL: 60 });

app.get("/api/shifts", async (c) => {
  const shifts = await getShifts();
  return c.json(shifts);
});

serve(app);
