const Notification = require('../models/Notification');

class NotificationService {
  /**
   * Get user notifications with unread counts
   */
  async getUserNotifications(userId, { unreadOnly = false, limit = 30 } = {}) {
    const filter = { userId };
    if (unreadOnly) filter.readAt = null;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit)),
      Notification.countDocuments({ userId, readAt: null }),
    ]);

    return { notifications, unreadCount };
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { readAt: new Date() },
      { new: true }
    );
    return notification;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    await Notification.updateMany(
      { userId, readAt: null },
      { readAt: new Date() }
    );
    return { success: true };
  }
}

module.exports = new NotificationService();
