import { createClerkClient } from '@clerk/backend';
const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});
export const clerkAuth = async (c, next) => {
    const authHeader = c.req.header('authorization') || c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    const token = authHeader.replace('Bearer ', '');
    try {
        const claims = await clerkClient.verifyToken(token);
        const userId = claims.sub;
        const role = claims.publicMetadata?.role || 'user';
        c.set('userId', userId);
        c.set('userRole', role);
        await next();
    }
    catch (error) {
        return c.json({ success: false, error: 'Invalid token' }, 401);
    }
};
export const requireRole = (...allowedRoles) => async (c, next) => {
    const role = c.get('userRole');
    if (!allowedRoles.includes(role)) {
        return c.json({ success: false, error: 'Forbidden' }, 403);
    }
    await next();
};
