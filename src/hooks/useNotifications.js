import { useState, useCallback } from 'react';

// Default notification settings
const DEFAULT_SETTINGS = {
    enabled: true,
    position: 'bottom-center', // top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
    duration: 1000, // milliseconds
    showIcons: true
};

// Get notification settings from localStorage
const getNotificationSettings = () => {
    try {
        const saved = localStorage.getItem('idle-chaos-notification-settings');
        return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch (error) {
        console.error('Error loading notification settings:', error);
        return DEFAULT_SETTINGS;
    }
};

// Save notification settings to localStorage
const saveNotificationSettings = (settings) => {
    try {
        localStorage.setItem('idle-chaos-notification-settings', JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving notification settings:', error);
    }
};

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [settings, setSettings] = useState(getNotificationSettings());

    // Update settings and save to localStorage
    const updateSettings = useCallback((newSettings) => {
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);
        saveNotificationSettings(updatedSettings);
    }, [settings]);

    // Add a new notification
    const addNotification = useCallback((notification) => {
        if (!settings.enabled) return;

        const id = Date.now() + Math.random();
        const newNotification = {
            id,
            type: notification.type || 'info', // 'item-drop', 'item-sale', 'gold-gain', 'achievement', 'info'
            title: notification.title || '',
            message: notification.message || '',
            icon: notification.icon || '📦',
            value: notification.value || null, // for gold amounts
            duration: notification.duration || settings.duration,
            timestamp: Date.now()
        };

        setNotifications(prev => [...prev, newNotification]);

        // Auto-remove after duration
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, newNotification.duration);
    }, [settings.enabled, settings.duration]);

    // Remove notification manually
    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Clear all notifications
    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // Notification helper functions
    const notifyItemDrop = useCallback((itemName, icon = '📦') => {
        addNotification({
            type: 'item-drop',
            title: 'Item Found!',
            message: itemName,
            icon: icon
        });
    }, [addNotification]);

    const notifyItemSale = useCallback((itemName, goldAmount, icon = '💰') => {
        addNotification({
            type: 'item-sale',
            title: 'Item Sold!',
            message: itemName,
            icon: icon,
            value: goldAmount
        });
    }, [addNotification]);

    const notifyGoldGain = useCallback((amount, source = '') => {
        addNotification({
            type: 'gold-gain',
            title: 'Gold Gained!',
            message: source,
            icon: '💰',
            value: amount
        });
    }, [addNotification]);

    const notifyBulkSale = useCallback((itemCount, totalGold) => {
        addNotification({
            type: 'bulk-sale',
            title: 'Bulk Sale!',
            message: `${itemCount} items sold`,
            icon: '💰',
            value: totalGold
        });
    }, [addNotification]);

    const notifyAchievement = useCallback((achievementName) => {
        addNotification({
            type: 'achievement',
            title: 'Achievement Unlocked!',
            message: achievementName,
            icon: '🏆',
            duration: 2000 // Achievements show longer
        });
    }, [addNotification]);

    const notifyChestOpened = useCallback((itemName, dungeonName) => {
        addNotification({
            type: 'chest-drop',
            title: 'Chest Opened!',
            message: `${itemName} from ${dungeonName}`,
            icon: '🎁'
        });
    }, [addNotification]);

    return {
        notifications,
        settings,
        updateSettings,
        addNotification,
        removeNotification,
        clearNotifications,
        // Helper functions
        notifyItemDrop,
        notifyItemSale,
        notifyGoldGain,
        notifyBulkSale,
        notifyAchievement,
        notifyChestOpened
    };
};

export default useNotifications; 