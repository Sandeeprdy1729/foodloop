import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { FaBell } from 'react-icons/fa';
import './NotificationBell.css';

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="notification-container">
            <button className="bell-btn" onClick={() => setIsOpen(!isOpen)}>
                <FaBell />
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="dropdown-header">
                        <h3>Notifications</h3>
                        <button onClick={markAllRead}>Mark all as read</button>
                    </div>
                    <div className="notifications-list">
                        {notifications.length === 0 ? (
                            <p className="no-notif">No notifications yet</p>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif._id}
                                    className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                                    onClick={() => markAsRead(notif._id)}
                                >
                                    <div className="notif-title">{notif.title}</div>
                                    <div className="notif-message">{notif.message}</div>
                                    <div className="notif-time">
                                        {new Date(notif.createdAt).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
