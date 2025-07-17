import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Switch,
    FormControl,
    FormControlLabel,
    Select,
    MenuItem,
    Slider,
    Chip
} from "@mui/material";
import { Close, Warning, Refresh, Language, Home, Save, VolumeUp, VolumeOff } from "@mui/icons-material";
import { useTranslate } from "../hooks/useTranslate";
import { saveCurrentGame, getCurrentSlot, deleteSlot } from "../utils/saveManager.js";
import { useEffect } from "react";
import { SYSTEM_COLORS } from "../utils/common";
import { useNotificationContext } from "../contexts/NotificationContext";

const GAME_STATE_KEYS = [
    'playerHealth', 'playerGold', 'playerLevel', 'playerXP',
    'inventory', 'equippedItems', 'lootBag', 'potions',
    'autoPotionSettings', 'skillLevels', 'skillXP',
    'achievements', 'unlockedEnemies', 'gameData',
    'idle-chaos-pets', 'idle-chaos-inventory'
];

// Add achievement keys for all slots
for (let i = 1; i <= 3; i++) {
    GAME_STATE_KEYS.push(`idle-chaos-achievements-slot-${i}`);
}

function Settings({ open, onClose }) {
    const navigate = useNavigate();
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showHomeConfirm, setShowHomeConfirm] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [autoSaveInterval, setAutoSaveInterval] = useState(() => {
        const saved = localStorage.getItem('autoSaveInterval');
        return saved ? parseInt(saved) : 60;
    });
    const [musicVolume, setMusicVolume] = useState(() => {
        const saved = localStorage.getItem('musicVolume');
        return saved !== null ? parseFloat(saved) : 0.5;
    });
    const [musicMuted, setMusicMuted] = useState(() => {
        const saved = localStorage.getItem('musicMuted');
        return saved === 'true';
    });
    const { t, changeLanguage, getCurrentLanguage, getAvailableLanguages } = useTranslate();
    const { settings: notificationSettings, updateSettings: updateNotificationSettings, notifyItemDrop } = useNotificationContext();

    const handleHardReset = () => {
        const currentSlot = getCurrentSlot();
        deleteSlot(currentSlot);
        GAME_STATE_KEYS.forEach(key => localStorage.removeItem(key));
        onClose();
        navigate("/");
    };

    const handleResetClick = () => {
        setShowResetConfirm(true);
    };

    const handleResetCancel = () => {
        setShowResetConfirm(false);
    };

    const handleResetConfirm = () => {
        setShowResetConfirm(false);
        handleHardReset();
    };

    const handleHomeClick = () => {
        setShowHomeConfirm(true);
    };

    const handleHomeCancel = () => {
        setShowHomeConfirm(false);
    };

    const handleHomeConfirm = () => {
        setShowHomeConfirm(false);
        onClose();
        navigate("/");
    };

    const handleManualSave = () => {
        const success = saveCurrentGame();
        if (success) {
            setShowSaveSuccess(true);
        } else {
            // You can add an error message here if needed
        }
    };

    const handleVolumeChange = (e) => {
        const value = parseInt(e.target.value) / 100;
        setMusicVolume(value);
        localStorage.setItem('musicVolume', value);
        window.dispatchEvent(new Event('music-settings-changed'));
    };
    const handleMuteToggle = () => {
        const newMuted = !musicMuted;
        setMusicMuted(newMuted);
        localStorage.setItem('musicMuted', newMuted);
        window.dispatchEvent(new Event('music-settings-changed'));
    };

    // Notification settings handlers
    const handleNotificationEnabledChange = (event) => {
        updateNotificationSettings({ enabled: event.target.checked });
    };

    const handleNotificationPositionChange = (event) => {
        updateNotificationSettings({ position: event.target.value });
    };

    const handleNotificationDurationChange = (event, value) => {
        updateNotificationSettings({ duration: value });
    };

    const handleNotificationIconsChange = (event) => {
        updateNotificationSettings({ showIcons: event.target.checked });
    };

    const handleTestNotification = () => {
        notifyItemDrop('Test Sword', '⚔️');
    };

    useEffect(() => {
        if (showSaveSuccess) {
            const timer = setTimeout(() => setShowSaveSuccess(false), 2500);
            return () => clearTimeout(timer);
        }
    }, [showSaveSuccess]);

    useEffect(() => {
        localStorage.setItem('autoSaveInterval', autoSaveInterval.toString());
    }, [autoSaveInterval]);

    return (
        <>
            {/* Main Settings Dialog */}
            <Dialog 
                open={open} 
                onClose={onClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: '#2a2a4a',
                        border: '2px solid #4a4a6a',
                        borderRadius: 0,
                        boxShadow: '0 0 0 1px #000, 0 4px 0 0 #2a2a4a',
                        zIndex: 1300
                    }
                }}
                sx={{
                    zIndex: 1300
                }}
            >
                <DialogTitle sx={{ 
                    color: '#e0e0e0',
                    fontFamily: 'Press Start 2P, monospace',
                    fontSize: '1rem',
                    textShadow: '2px 2px 0px #000',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '1rem'
                }}>
                    <img src="/IdleChaosLogo.png" alt="Idle Chaos Logo" style={{ width: 80, height: 'auto', marginBottom: 8, imageRendering: 'pixelated', filter: 'drop-shadow(2px 2px 0px #000)' }} />
                    {t('common.settings')}
                    <IconButton 
                        onClick={onClose}
                        sx={{ 
                            color: '#e0e0e0',
                            position: 'absolute',
                            right: 16,
                            top: 16,
                            '&:hover': { color: '#ff6b6b' }
                        }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                
                <DialogContent sx={{ 
                    color: '#e0e0e0',
                    fontFamily: 'Press Start 2P, monospace',
                    fontSize: '0.8rem',
                    textShadow: '1px 1px 0px #000',
                    padding: '1rem'
                }}>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ 
                            color: '#96ceb4',
                            fontSize: '0.9rem',
                            textShadow: '1px 1px 0px #000',
                            mb: 2
                        }}>
                            {t('common.language')}
                        </Typography>
                        
                        <List sx={{ mt: 2, p: 0 }}>
                            {getAvailableLanguages().map((lang) => (
                                <ListItem 
                                    key={lang.code}
                                    button
                                    onClick={() => changeLanguage(lang.code)}
                                    sx={{
                                        backgroundColor: getCurrentLanguage() === lang.code ? 'rgba(150, 206, 180, 0.2)' : 'transparent',
                                        border: getCurrentLanguage() === lang.code ? '2px solid #96ceb4' : '2px solid transparent',
                                        borderRadius: 1,
                                        mb: 1,
                                        padding: '0.75rem',
                                        '&:hover': {
                                            backgroundColor: 'rgba(150, 206, 180, 0.1)',
                                            borderColor: '#96ceb4'
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <img 
                                            src={lang.flag} 
                                            alt={lang.name}
                                            style={{ 
                                                width: '24px', 
                                                height: '16px',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={lang.name}
                                        sx={{
                                            '& .MuiListItemText-primary': {
                                                fontFamily: 'Press Start 2P, monospace',
                                                fontSize: '0.7rem',
                                                color: '#e0e0e0',
                                                textShadow: '1px 1px 0px #000'
                                            }
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                        
                        <Divider sx={{ my: 3, borderColor: '#4a4a6a' }} />

                        <Typography variant="h6" gutterBottom sx={{ 
                            color: '#ffd700',
                            fontSize: '0.9rem',
                            textShadow: '1px 1px 0px #000',
                            mb: 2
                        }}>
                            {t('common.soundSettings')}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <IconButton onClick={handleMuteToggle} sx={{ color: '#ffd700' }}>
                                {musicMuted ? <VolumeOff /> : <VolumeUp />}
                            </IconButton>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={musicMuted ? 0 : Math.round(musicVolume * 100)}
                                onChange={handleVolumeChange}
                                style={{ width: 180 }}
                                disabled={musicMuted}
                            />
                            <span style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '0.7rem', color: '#ffd700', marginLeft: 8 }}>
                                {musicMuted ? '0' : Math.round(musicVolume * 100)}%
                            </span>
                        </Box>
                        
                        <Typography variant="h6" gutterBottom sx={{ 
                            color: '#ffd700',
                            fontSize: '0.9rem',
                            textShadow: '1px 1px 0px #000',
                            mb: 2
                        }}>
                            {t('common.autoSaveSettings')}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Typography sx={{ fontSize: '0.8rem', minWidth: 120 }}>
                                {t('common.autoSaveInterval')}
                            </Typography>
                            <select
                                value={autoSaveInterval}
                                onChange={e => setAutoSaveInterval(Number(e.target.value))}
                                style={{
                                    fontFamily: 'Press Start 2P, monospace',
                                    fontSize: '0.8rem',
                                    padding: '0.3rem 1rem',
                                    borderRadius: 0,
                                    border: '2px solid #4a4a6a',
                                    background: '#222',
                                    color: '#ffd700',
                                    outline: 'none',
                                }}
                            >
                                <option value={30}>30 sn</option>
                                <option value={60}>1 dk</option>
                                <option value={120}>2 dk</option>
                                <option value={300}>5 dk</option>
                            </select>
                        </Box>
                        
                        <Divider sx={{ my: 3, borderColor: '#4a4a6a' }} />

                        <Typography variant="h6" gutterBottom sx={{ 
                            color: '#a855f7',
                            fontSize: '0.9rem',
                            textShadow: '1px 1px 0px #000',
                            mb: 2
                        }}>
                            📢 {t('common.notificationSettings')}
                        </Typography>
                        
                        {/* Enable/Disable Notifications */}
                        <Box sx={{ mb: 2 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notificationSettings.enabled}
                                        onChange={handleNotificationEnabledChange}
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: '#a855f7'
                                            },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                backgroundColor: '#a855f7'
                                            }
                                        }}
                                    />
                                }
                                label={t('common.enableNotifications')}
                                sx={{
                                    '& .MuiFormControlLabel-label': {
                                        fontFamily: 'Press Start 2P',
                                        fontSize: '0.7rem',
                                        color: '#e0e0e0'
                                    }
                                }}
                            />
                        </Box>

                        {/* Notification Position */}
                        <Box sx={{ mb: 2 }}>
                            <Typography sx={{ fontSize: '0.7rem', mb: 1, color: '#e0e0e0' }}>
                                📍 {t('common.notificationPosition')}
                            </Typography>
                            <FormControl fullWidth disabled={!notificationSettings.enabled}>
                                <Select
                                    value={notificationSettings.position}
                                    onChange={handleNotificationPositionChange}
                                    sx={{
                                        fontFamily: 'Press Start 2P',
                                        fontSize: '0.6rem',
                                        color: '#e0e0e0',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#4a4a6a'
                                        },
                                        '& .MuiSelect-icon': {
                                            color: '#a855f7'
                                        }
                                    }}
                                >
                                    <MenuItem value="top-left" sx={{ fontFamily: 'Press Start 2P', fontSize: '0.6rem' }}>
                                        ↖️ {t('common.topLeft')}
                                    </MenuItem>
                                    <MenuItem value="top-center" sx={{ fontFamily: 'Press Start 2P', fontSize: '0.6rem' }}>
                                        ⬆️ {t('common.topCenter')}
                                    </MenuItem>
                                    <MenuItem value="top-right" sx={{ fontFamily: 'Press Start 2P', fontSize: '0.6rem' }}>
                                        ↗️ {t('common.topRight')}
                                    </MenuItem>
                                    <MenuItem value="bottom-left" sx={{ fontFamily: 'Press Start 2P', fontSize: '0.6rem' }}>
                                        ↙️ {t('common.bottomLeft')}
                                    </MenuItem>
                                    <MenuItem value="bottom-center" sx={{ fontFamily: 'Press Start 2P', fontSize: '0.6rem' }}>
                                        ⬇️ {t('common.bottomCenter')}
                                    </MenuItem>
                                    <MenuItem value="bottom-right" sx={{ fontFamily: 'Press Start 2P', fontSize: '0.6rem' }}>
                                        ↘️ {t('common.bottomRight')}
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Notification Duration */}
                        <Box sx={{ mb: 2 }}>
                            <Typography sx={{ fontSize: '0.7rem', mb: 1, color: '#e0e0e0' }}>
                                ⏱️ {t('common.notificationDuration')}: {notificationSettings.duration}ms
                            </Typography>
                            <Slider
                                value={notificationSettings.duration}
                                onChange={handleNotificationDurationChange}
                                min={500}
                                max={5000}
                                step={100}
                                disabled={!notificationSettings.enabled}
                                sx={{
                                    color: '#a855f7',
                                    '& .MuiSlider-thumb': {
                                        backgroundColor: '#a855f7'
                                    },
                                    '& .MuiSlider-track': {
                                        backgroundColor: '#a855f7'
                                    }
                                }}
                            />
                        </Box>

                        {/* Show Icons */}
                        <Box sx={{ mb: 2 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notificationSettings.showIcons}
                                        onChange={handleNotificationIconsChange}
                                        disabled={!notificationSettings.enabled}
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: '#a855f7'
                                            },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                backgroundColor: '#a855f7'
                                            }
                                        }}
                                    />
                                }
                                label={t('common.showNotificationIcons')}
                                sx={{
                                    '& .MuiFormControlLabel-label': {
                                        fontFamily: 'Press Start 2P',
                                        fontSize: '0.7rem',
                                        color: '#e0e0e0'
                                    }
                                }}
                            />
                        </Box>

                        {/* Test Notification Button */}
                        <Box sx={{ mb: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={handleTestNotification}
                                disabled={!notificationSettings.enabled}
                                sx={{
                                    fontFamily: 'Press Start 2P',
                                    fontSize: '0.6rem',
                                    borderColor: '#a855f7',
                                    color: '#a855f7',
                                    '&:hover': {
                                        borderColor: '#9333ea',
                                        backgroundColor: 'rgba(168, 85, 247, 0.1)'
                                    }
                                }}
                            >
                                🧪 {t('common.testNotification')}
                            </Button>
                        </Box>
                        
                        <Divider sx={{ my: 3, borderColor: '#4a4a6a' }} />

                        <Typography variant="h6" gutterBottom sx={{ 
                            color: '#ff6b6b',
                            fontSize: '0.9rem',
                            textShadow: '1px 1px 0px #000',
                            mb: 2
                        }}>
                            {t('common.gameOptions')}
                        </Typography>
                        
                        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<Save />}
                                onClick={handleManualSave}
                                sx={{
                                    backgroundColor: '#2196f3',
                                    border: '2px solid #1976d2',
                                    borderRadius: 0,
                                    fontFamily: 'Press Start 2P, monospace',
                                    fontSize: '0.7rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    textShadow: '1px 1px 0px #000',
                                    boxShadow: '0 0 0 1px #000, 0 2px 0 0 #1976d2',
                                    padding: '0.75rem 1rem',
                                    '&:hover': {
                                        backgroundColor: '#1976d2',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 0 0 1px #000, 0 4px 0 0 #1976d2'
                                    }
                                }}
                            >
                                Oyunu Kaydet
                            </Button>
                            
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<Home />}
                                onClick={handleHomeClick}
                                sx={{
                                    backgroundColor: '#96ceb4',
                                    border: '2px solid #88c196',
                                    borderRadius: 0,
                                    fontFamily: 'Press Start 2P, monospace',
                                    fontSize: '0.7rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    textShadow: '1px 1px 0px #000',
                                    boxShadow: '0 0 0 1px #000, 0 2px 0 0 #88c196',
                                    padding: '0.75rem 1rem',
                                    '&:hover': {
                                        backgroundColor: '#88c196',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 0 0 1px #000, 0 4px 0 0 #88c196'
                                    }
                                }}
                            >
                                {t('common.homeScreen')}
                            </Button>
                            
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<Refresh />}
                                onClick={handleResetClick}
                                sx={{
                                    backgroundColor: '#ff6b6b',
                                    border: '2px solid #ff4444',
                                    borderRadius: 0,
                                    fontFamily: 'Press Start 2P, monospace',
                                    fontSize: '0.7rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    textShadow: '1px 1px 0px #000',
                                    boxShadow: '0 0 0 1px #000, 0 2px 0 0 #ff4444',
                                    padding: '0.75rem 1rem',
                                    '&:hover': {
                                        backgroundColor: '#ff4444',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 0 0 1px #000, 0 4px 0 0 #ff4444'
                                    }
                                }}
                            >
                                {t('common.clearData')}
                            </Button>
                            
                            <Typography variant="body2" sx={{ 
                                mt: 1,
                                color: '#888',
                                fontSize: '0.6rem',
                                textAlign: 'center'
                            }}>
                                {t('common.clearDataDescription')}
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                
                <DialogActions sx={{ 
                    padding: '1rem',
                    borderTop: '2px solid #4a4a6a'
                }}>
                </DialogActions>
            </Dialog>

            {/* Reset Confirmation Dialog */}
            <Dialog 
                open={showResetConfirm} 
                onClose={handleResetCancel}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: '#2a2a4a',
                        border: '2px solid #ff6b6b',
                        borderRadius: 0,
                        boxShadow: '0 0 0 1px #000, 0 4px 0 0 #ff6b6b',
                        zIndex: 1400
                    }
                }}
                sx={{
                    zIndex: 1400
                }}
            >
                <DialogTitle sx={{ 
                    color: '#ff6b6b',
                    fontFamily: 'Press Start 2P, monospace',
                    fontSize: '1rem',
                    textShadow: '2px 2px 0px #000',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    padding: '1rem'
                }}>
                    <Warning sx={{ color: '#ff6b6b' }} />
                    {t('common.clearData')}
                </DialogTitle>
                
                <DialogContent sx={{ 
                    color: '#e0e0e0',
                    fontFamily: 'Press Start 2P, monospace',
                    fontSize: '0.8rem',
                    textShadow: '1px 1px 0px #000',
                    padding: '1rem'
                }}>
                    <Alert severity="warning" sx={{ 
                        mt: 2,
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        border: '1px solid #ff6b6b',
                        '& .MuiAlert-message': {
                            fontFamily: 'Press Start 2P, monospace',
                            fontSize: '0.7rem',
                            textShadow: '1px 1px 0px #000'
                        }
                    }}>
                        {t('common.clearDataConfirm')}
                    </Alert>
                </DialogContent>
                
                <DialogActions sx={{ 
                    padding: '1rem',
                    borderTop: '2px solid #ff6b6b',
                    display: 'flex',
                    justifyContent: 'space-between'
                }}>
                    <Button 
                        onClick={handleResetCancel}
                        sx={{
                            color: '#e0e0e0',
                            fontFamily: 'Press Start 2P, monospace',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            textShadow: '1px 1px 0px #000',
                            '&:hover': {
                                color: '#96ceb4'
                            }
                        }}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button 
                        onClick={handleResetConfirm}
                        variant="contained"
                        color="error"
                        sx={{
                            backgroundColor: '#ff6b6b',
                            border: '2px solid #ff4444',
                            borderRadius: 0,
                            fontFamily: 'Press Start 2P, monospace',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            textShadow: '1px 1px 0px #000',
                            boxShadow: '0 0 0 1px #000, 0 2px 0 0 #ff4444',
                            '&:hover': {
                                backgroundColor: '#ff4444',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 0 0 1px #000, 0 4px 0 0 #ff4444'
                            }
                        }}
                    >
                        {t('common.confirm')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Home Confirmation Dialog */}
            <Dialog 
                open={showHomeConfirm} 
                onClose={handleHomeCancel}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: '#2a2a4a',
                        border: '2px solid #96ceb4',
                        borderRadius: 0,
                        boxShadow: '0 0 0 1px #000, 0 4px 0 0 #96ceb4',
                        zIndex: 1400
                    }
                }}
                sx={{
                    zIndex: 1400
                }}
            >
                <DialogTitle sx={{ 
                    color: '#96ceb4',
                    fontFamily: 'Press Start 2P, monospace',
                    fontSize: '1rem',
                    textShadow: '2px 2px 0px #000',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    padding: '1rem'
                }}>
                    <Home sx={{ color: '#96ceb4' }} />
                    {t('common.homeScreen')}
                </DialogTitle>
                
                <DialogContent sx={{ 
                    color: '#e0e0e0',
                    fontFamily: 'Press Start 2P, monospace',
                    fontSize: '0.8rem',
                    textShadow: '1px 1px 0px #000',
                    padding: '1rem'
                }}>
                    <Alert severity="info" sx={{ 
                        mt: 2,
                        backgroundColor: 'rgba(150, 206, 180, 0.1)',
                        border: '1px solid #96ceb4',
                        '& .MuiAlert-message': {
                            fontFamily: 'Press Start 2P, monospace',
                            fontSize: '0.7rem',
                            textShadow: '1px 1px 0px #000',
                            color: SYSTEM_COLORS.TEXT.PRIMARY // Use system color
                        }
                    }}>
                        {t('common.homeScreenConfirm')}
                    </Alert>
                </DialogContent>
                
                <DialogActions sx={{ 
                    padding: '1rem',
                    borderTop: '2px solid #96ceb4',
                    display: 'flex',
                    justifyContent: 'space-between'
                }}>
                    <Button 
                        onClick={handleHomeCancel}
                        sx={{
                            color: '#e0e0e0',
                            fontFamily: 'Press Start 2P, monospace',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            textShadow: '1px 1px 0px #000',
                            '&:hover': {
                                color: '#ff6b6b'
                            }
                        }}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button 
                        onClick={handleHomeConfirm}
                        variant="contained"
                        color="success"
                        sx={{
                            backgroundColor: '#96ceb4',
                            border: '2px solid #88c196',
                            borderRadius: 0,
                            fontFamily: 'Press Start 2P, monospace',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            textShadow: '1px 1px 0px #000',
                            boxShadow: '0 0 0 1px #000, 0 2px 0 0 #88c196',
                            '&:hover': {
                                backgroundColor: '#88c196',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 0 0 1px #000, 0 4px 0 0 #88c196'
                            }
                        }}
                    >
                        {t('common.confirm')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Kayıt başarılı popup */}
            {showSaveSuccess && (
                <Alert 
                    severity="success" 
                    sx={{ 
                        position: 'fixed', 
                        top: 24, 
                        left: '50%', 
                        transform: 'translateX(-50%)', 
                        zIndex: 2000,
                        minWidth: 300,
                        fontFamily: 'Press Start 2P, monospace',
                        fontSize: '0.8rem',
                        textAlign: 'center',
                        boxShadow: '0 0 8px #000',
                    }}
                    onClose={() => setShowSaveSuccess(false)}
                >
                    {t('settings.saveSuccess')}
                </Alert>
            )}
        </>
    );
}

export default Settings; 