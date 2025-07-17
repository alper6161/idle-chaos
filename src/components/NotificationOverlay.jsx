import React from 'react';
import { Box, Typography, Slide, Zoom } from '@mui/material';
import { formatGold } from '../utils/gold.js';
import { useTranslate } from '../hooks/useTranslate';

const NotificationOverlay = ({ notifications, settings }) => {
    const { t } = useTranslate();

    if (!notifications.length || !settings.enabled) return null;

    // Get position styles based on settings
    const getPositionStyles = (position) => {
        const positions = {
            'top-left': { top: 20, left: 20 },
            'top-center': { top: 20, left: '50%', transform: 'translateX(-50%)' },
            'top-right': { top: 20, right: 20 },
            'bottom-left': { bottom: 80, left: 20 },
            'bottom-center': { bottom: 80, left: '50%', transform: 'translateX(-50%)' },
            'bottom-right': { bottom: 80, right: 20 }
        };
        return positions[position] || positions['bottom-center'];
    };

    // Get notification color based on type
    const getNotificationColor = (type) => {
        const colors = {
            'item-drop': '#4ade80', // Green
            'item-sale': '#ffd700', // Gold
            'gold-gain': '#ffd700', // Gold
            'bulk-sale': '#f59e0b', // Orange
            'achievement': '#a855f7', // Purple
            'chest-drop': '#ffd700', // Gold
            'info': '#ffffff' // White
        };
        return colors[type] || colors['info'];
    };

    // Get notification background based on type
    const getNotificationBackground = (type) => {
        const backgrounds = {
            'item-drop': 'linear-gradient(145deg, rgba(74, 222, 128, 0.9) 0%, rgba(34, 197, 94, 0.9) 100%)',
            'item-sale': 'linear-gradient(145deg, rgba(255, 215, 0, 0.9) 0%, rgba(245, 158, 11, 0.9) 100%)',
            'gold-gain': 'linear-gradient(145deg, rgba(255, 215, 0, 0.9) 0%, rgba(245, 158, 11, 0.9) 100%)',
            'bulk-sale': 'linear-gradient(145deg, rgba(245, 158, 11, 0.9) 0%, rgba(217, 119, 6, 0.9) 100%)',
            'achievement': 'linear-gradient(145deg, rgba(168, 85, 247, 0.9) 0%, rgba(147, 51, 234, 0.9) 100%)',
            'chest-drop': 'linear-gradient(145deg, rgba(255, 215, 0, 0.9) 0%, rgba(245, 158, 11, 0.9) 100%)',
            'info': 'linear-gradient(145deg, rgba(58, 58, 90, 0.9) 0%, rgba(42, 42, 74, 0.9) 100%)'
        };
        return backgrounds[type] || backgrounds['info'];
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                ...getPositionStyles(settings.position),
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                maxWidth: '350px',
                pointerEvents: 'none'
            }}
        >
            {notifications.map((notification, index) => (
                <Zoom 
                    key={notification.id} 
                    in={true} 
                    timeout={300}
                    style={{ transitionDelay: `${index * 100}ms` }}
                >
                    <Box
                        sx={{
                            background: getNotificationBackground(notification.type),
                            border: '3px solid #000000',
                            borderRadius: 0,
                            padding: '12px 16px',
                            minWidth: '200px',
                            boxShadow: `
                                0 0 0 2px ${getNotificationColor(notification.type)},
                                0 4px 0 0 rgba(0, 0, 0, 0.3),
                                0 8px 16px rgba(0, 0, 0, 0.5)
                            `,
                            fontFamily: 'Press Start 2P',
                            color: '#000000',
                            animation: 'notificationPulse 0.6s ease-out',
                            '@keyframes notificationPulse': {
                                '0%': { transform: 'scale(0.8)', opacity: 0 },
                                '50%': { transform: 'scale(1.05)', opacity: 1 },
                                '100%': { transform: 'scale(1)', opacity: 1 }
                            }
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {/* Icon */}
                            {settings.showIcons && (
                                <Box
                                    sx={{
                                        fontSize: '1.5rem',
                                        lineHeight: 1,
                                        filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.8))'
                                    }}
                                >
                                    {notification.icon}
                                </Box>
                            )}
                            
                            {/* Content */}
                            <Box sx={{ flex: 1 }}>
                                {/* Title */}
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontFamily: 'Press Start 2P',
                                        fontSize: '0.6rem',
                                        fontWeight: 'bold',
                                        marginBottom: '4px',
                                        textShadow: '2px 2px 0px rgba(0,0,0,0.8)'
                                    }}
                                >
                                    {notification.title}
                                </Typography>
                                
                                {/* Message */}
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontFamily: 'Press Start 2P',
                                        fontSize: '0.5rem',
                                        textShadow: '1px 1px 0px rgba(0,0,0,0.8)',
                                        lineHeight: 1.2
                                    }}
                                >
                                    {notification.message}
                                </Typography>
                                
                                {/* Value (for gold amounts) */}
                                {notification.value && (
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontFamily: 'Press Start 2P',
                                            fontSize: '0.5rem',
                                            fontWeight: 'bold',
                                            marginTop: '4px',
                                            textShadow: '2px 2px 0px rgba(0,0,0,0.8)',
                                            color: notification.type.includes('sale') || notification.type === 'gold-gain' ? '#000000' : 'inherit'
                                        }}
                                    >
                                        💰 +{formatGold(notification.value)}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Zoom>
            ))}
        </Box>
    );
};

export default NotificationOverlay; 