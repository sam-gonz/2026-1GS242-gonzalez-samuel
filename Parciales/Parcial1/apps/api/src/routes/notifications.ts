import { Hono } from 'hono';
import { Notification } from '../models/notification.js';
import { User } from '../models/user.js';

const notifications = new Hono();

notifications.get('/', async (c) => {
  const userId = c.get('userId');
  const user = await User.findOne({ clerkId: userId });
  
  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }
  
  const notificationsList = await Notification.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  
  return c.json({ success: true, data: notificationsList });
});

notifications.patch('/read-all', async (c) => {
  const userId = c.get('userId');
  const user = await User.findOne({ clerkId: userId });
  
  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }
  
  await Notification.updateMany(
    { userId: user._id, isRead: false },
    { isRead: true }
  );
  
  return c.json({ success: true, message: 'All notifications marked as read' });
});

export default notifications;