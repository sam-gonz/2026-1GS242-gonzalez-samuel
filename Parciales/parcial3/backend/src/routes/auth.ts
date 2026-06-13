import { Hono } from "hono";
import User from "../models/user.model";

const router = new Hono();

router.post("/sync", async (c) => {
  try {
    const { clerkId, name, email } = await c.req.json();
    if (!clerkId || !email) return c.json({ error: "clerkId and email required" }, 400);
    const user = await User.findOneAndUpdate(
      { clerkId },
      { $set: { name: name || email, email } },
      { upsert: true, new: true }
    );
    return c.json(user);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

router.get("/me", async (c) => {
  try {
    const clerkId = c.req.query("clerkId");
    if (!clerkId) return c.json({ error: "clerkId required" }, 400);
    const user = await User.findOne({ clerkId });
    if (!user) return c.json({ error: "User not found" }, 404);
    return c.json(user);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export default router;
