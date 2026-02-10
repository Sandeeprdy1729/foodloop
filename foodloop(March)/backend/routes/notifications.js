const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllRead } = require('../controllers/notificationController');

router.get('/:userId', getNotifications);
router.put('/:notificationId/read', markAsRead);
router.put('/read-all/:userId', markAllRead);

module.exports = router;
