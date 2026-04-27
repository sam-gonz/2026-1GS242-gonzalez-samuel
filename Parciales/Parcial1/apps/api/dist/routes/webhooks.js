import { Hono } from 'hono';
import { User } from '../models/user.js';
const webhooks = new Hono();
webhooks.post('/clerk', async (c) => {
    const bodyText = await c.req.text();
    const headers = c.req.header();
    const svix_id = headers['svix-id'];
    const svix_timestamp = headers['svix-timestamp'];
    const svix_signature = headers['svix-signature'];
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return c.json({ success: false, error: 'Missing Svix headers' }, 400);
    }
    const evt = JSON.parse(bodyText);
    const { type, data } = evt;
    if (type === 'user.created' || type === 'user.updated') {
        const clerkId = data.id;
        const email = data.email_addresses?.[0]?.email_address;
        const username = data.username || data.first_name || email?.split('@')[0];
        const avatar = data.image_url;
        await User.findOneAndUpdate({ clerkId }, {
            clerkId,
            username,
            email,
            avatar,
            email,
        }, { upsert: true, new: true });
        const userCount = await User.countDocuments();
        if (userCount === 1) {
            await User.findOneAndUpdate({ clerkId }, { role: 'admin', isVerified: true }, { new: true });
        }
    }
    if (type === 'user.deleted') {
        await User.deleteOne({ clerkId: data.id });
    }
    return c.json({ success: true });
});
export default webhooks;
