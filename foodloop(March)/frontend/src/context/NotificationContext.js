import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);

    const farmerId = localStorage.getItem('farmerId');
    const buyerInfo = localStorage.getItem('buyerInfo');
    const buyerId = buyerInfo ? JSON.parse(buyerInfo)._id : null;

    const fetchNotifications = useCallback(async (userId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/notifications/${userId}`);
            if (response.data.success) {
                setNotifications(response.data.data);
                setUnreadCount(response.data.data.filter(n => !n.read).length);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, []);

    useEffect(() => {
        const userId = farmerId || buyerId;
        const role = farmerId ? 'Farmer' : buyerId ? 'Buyer' : null;

        if (userId && role) {
            fetchNotifications(userId);

            const newSocket = io(process.env.REACT_APP_API_URL.replace('/api', ''), {
                transports: ['websocket']
            });

            newSocket.emit('join', { userId, role });

            newSocket.on('NEW_ORDER', (notification) => {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
                // Optional: show a toast or play a sound
            });

            newSocket.on('ORDER_STATUS_UPDATE', (notification) => {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
            });

            newSocket.on('PAYMENT_UPDATE', (notification) => {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
            });

            setSocket(newSocket);

            return () => newSocket.close();
        }
    }, [farmerId, buyerId, fetchNotifications]);

    const markAsRead = async (notificationId) => {
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/notifications/${notificationId}/read`);
            setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllRead = async () => {
        const userId = farmerId || buyerId;
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/notifications/read-all/${userId}`);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all read:', error);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllRead }}>
            {children}
        </NotificationContext.Provider>
    );
};
