const notificationService = require('../services/notificationService');

const getNotifications = async (req, res, next) => {
  try {
    const { unreadOnly, limit } = req.query;
    const result = await notificationService.getUserNotifications(req.user.id, {
      unreadOnly: unreadOnly === 'true',
      limit: parseInt(limit) || 30,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);
    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
