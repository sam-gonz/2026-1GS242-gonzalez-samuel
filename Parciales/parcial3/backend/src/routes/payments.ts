import { Hono } from "hono";
import Stripe from "stripe";
import User from "../models/user.model";
import Skin from "../models/skin.model";

const STRIPE_KEY = process.env.STRIPE_SECRET || process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_KEY ? new Stripe(STRIPE_KEY, { apiVersion: "2025-02-24.acacia" as any }) : null;

const router = new Hono();

router.get("/skins", async (c) => {
  try {
    const skins = await Skin.find();
    return c.json(skins);
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

router.post("/create-checkout", async (c) => {
  try {
    const { clerkId, skinId } = await c.req.json();
    if (!stripe) return c.json({ error: "Stripe not configured" }, 400);
    const skin = await Skin.findOne({ id: skinId });
    if (!skin) return c.json({ error: "Skin not found" }, 404);
    const user = await User.findOne({ clerkId });
    if (!user) return c.json({ error: "User not found" }, 404);
    if (user.ownedSkins.includes(skinId)) return c.json({ error: "Already owned" }, 400);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: skin.name },
          unit_amount: Math.round(skin.price * 100),
        },
        quantity: 1,
      }],
      success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/shop?success=1&skinId=${skin.id}`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/shop?canceled=1`,
      metadata: { clerkId, skinId },
    });
    return c.json({ url: session.url });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

router.post("/webhook", async (c) => {
  try {
    const sig = c.req.header("stripe-signature");
    if (!stripe || !sig) return c.json({ error: "Stripe not configured" }, 400);
    const body = await c.req.text();
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const { clerkId, skinId } = session.metadata;
      await User.findOneAndUpdate({ clerkId }, { $addToSet: { ownedSkins: skinId } });
    }
    return c.json({ received: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

router.post("/claim-skin", async (c) => {
  try {
    const { clerkId, skinId } = await c.req.json();
    if (!clerkId || !skinId) return c.json({ error: "clerkId and skinId required" }, 400);
    const skin = await Skin.findOne({ id: skinId });
    if (!skin) return c.json({ error: "Skin not found" }, 404);
    const prev = await User.findOne({ clerkId });
    if (!prev) return c.json({ error: "User not found" }, 404);
    const alreadyOwned = prev.ownedSkins.includes(skinId);
    if (!alreadyOwned) {
      await User.findOneAndUpdate({ clerkId }, { $addToSet: { ownedSkins: skinId } });
    }
    return c.json({ success: true, skin: skinId, alreadyOwned });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

router.post("/activate-skin", async (c) => {
  try {
    const { clerkId, skinId } = await c.req.json();
    const user = await User.findOne({ clerkId });
    if (!user) return c.json({ error: "User not found" }, 404);
    if (!user.ownedSkins.includes(skinId)) return c.json({ error: "Skin not owned" }, 400);
    const skin = await Skin.findOne({ id: skinId });
    if (!skin) return c.json({ error: "Skin not found" }, 404);
    user.activeSkin = { ...(user.activeSkin ?? {}), [skin.type]: skinId };
    await user.save();
    return c.json(user);
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

export default router;
