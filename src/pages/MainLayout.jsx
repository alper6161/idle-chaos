import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import styles from "../assets/styles/MainLayout.module.scss";

import SettingsDialog from "./Settings.jsx";
import { formatGold } from "../utils/gold.js";
import { getActiveBuffsInfo } from "../utils/buffUtils.js";
import { useTranslate } from "../hooks/useTranslate";
import MainMenu from "../components/MainMenu";
import { saveCurrentGame } from "../utils/saveManager.js";
import { Alert, Dialog, DialogTitle, DialogContent, Typography, Box } from "@mui/material";
import { useRef } from "react";
import { useNotificationContext } from "../contexts/NotificationContext";
import NotificationOverlay from "../components/NotificationOverlay";
import { useBattleContext } from "../contexts/BattleContext";

function MainLayout() {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [activeBuffs, setActiveBuffs] = useState(getActiveBuffsInfo());
    const [showAutoSaveSuccess, setShowAutoSaveSuccess] = useState(false);
    const { t } = useTranslate();
    const { notifications, settings: notificationSettings } = useNotificationContext();
    const { playerGold, deathDialog, respawnPlayer } = useBattleContext();
    const [musicVolume, setMusicVolume] = useState(() => {
        const saved = localStorage.getItem('musicVolume');
        return saved !== null ? parseFloat(saved) : 0.5;
    });
    const [musicMuted, setMusicMuted] = useState(() => {
        const saved = localStorage.getItem('musicMuted');
        return saved === 'true';
    });

    const handleSettingsClick = () => {
        setSettingsOpen(true);
    };

    const handleSettingsClose = () => {
        setSettingsOpen(false);
    };

    // Update buffs display when localStorage changes
    useEffect(() => {
        const updateBuffs = () => {
            setActiveBuffs(getActiveBuffsInfo());
        };

        // Update buffs every second (in case they change in other components)
        const interval = setInterval(updateBuffs, 1000);

        return () => clearInterval(interval);
    }, []);

    // Auto-save interval
    useEffect(() => {
        const getInterval = () => {
            const saved = localStorage.getItem('autoSaveInterval');
            return saved ? parseInt(saved) : 60;
        };
        let intervalId;
        function startAutoSave() {
            if (intervalId) clearInterval(intervalId);
            const intervalSec = getInterval();
            intervalId = setInterval(() => {
                const success = saveCurrentGame();
                if (success) {
                    setShowAutoSaveSuccess(true);
                }
            }, intervalSec * 1000);
        }
        startAutoSave();
        // Ayar değişirse tekrar başlat
        const onStorage = (e) => {
            if (e.key === 'autoSaveInterval') {
                startAutoSave();
            }
        };
        window.addEventListener('storage', onStorage);
        return () => {
            clearInterval(intervalId);
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    useEffect(() => {
        if (showAutoSaveSuccess) {
            const timer = setTimeout(() => setShowAutoSaveSuccess(false), 2500);
            return () => clearTimeout(timer);
        }
    }, [showAutoSaveSuccess]);

    useEffect(() => {
        // This useEffect is no longer needed as music is handled globally
    }, []);

    return (
        <div className={styles.layout}>
            {/* Sidebar */}
            <MainMenu />

            {/* Main Content */}
            <main className={styles.content}>
                <div className={styles.topbar}>
                    <div className={styles.leftSection}>
                        <div className={styles.goldDisplay}>
                            <span className={styles.goldIcon}>💰</span>
                            <span className={styles.goldAmount}>{formatGold(playerGold)}</span>
                        </div>
                        {activeBuffs.length > 0 && (
                            <div className={styles.buffsDisplay}>
                                {activeBuffs.map((buff) => (
                                    <div key={buff.id} className={styles.buffIndicator} style={{ borderColor: buff.color }}>
                                        <span className={styles.buffIcon} style={{ color: buff.color }}>⚡</span>
                                        <span className={styles.buffTime}>{buff.timeRemaining}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className={styles.topbarIcons}>
                        <span 
                            className={styles.icon} 
                            onClick={handleSettingsClick}
                            style={{ cursor: 'pointer', fontSize: '24px' }}
                        >
                            ⚙️
                        </span>
                    </div>
                </div>
                <Outlet />
            </main>

            {/* Settings Dialog */}
            <SettingsDialog 
                open={settingsOpen} 
                onClose={handleSettingsClose} 
            />
            {/* Auto-save başarı popup */}
            {showAutoSaveSuccess && (
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
                    onClose={() => setShowAutoSaveSuccess(false)}
                >
                    {t('settings.saveSuccess')}
                </Alert>
            )}
            
            {/* Notification Overlay */}
            <NotificationOverlay 
                notifications={notifications} 
                settings={notificationSettings} 
            />
            
            {/* Global Death Dialog */}
            <Dialog open={deathDialog.open} disableEscapeKeyDown>
                <DialogTitle sx={{ 
                    color: '#ff6b6b !important',
                    textShadow: '2px 2px 0px #000',
                    fontSize: '1.5rem !important',
                    letterSpacing: '1px',
                    background: 'linear-gradient(145deg, #2a2a4a 0%, #1a1a3a 100%) !important',
                    borderBottom: '2px solid #ff6b6b !important',
                    textAlign: 'center !important'
                }}>
                    ☠️ {t('battle.youDied')}
                </DialogTitle>
                <DialogContent sx={{ 
                    background: 'linear-gradient(145deg, #2a2a4a 0%, #1a1a3a 100%) !important',
                    padding: '2rem !important',
                    color: '#ffffff'
                }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1.5rem',
                        textAlign: 'center'
                    }}>
                        <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
                            {t('battle.deathMessage')}
                        </Typography>
                        
                        {/* Death Information */}
                        {deathDialog.deathInfo && (
                            <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: 1, border: '1px solid #ff6b6b' }}>
                                <Typography variant="h6" sx={{ mb: 1, color: '#ff6b6b', textAlign: 'center' }}>
                                    ⚔️ {t('battle.deathDetails')}
                                </Typography>
                                
                                <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
                                    💀 {t('battle.killedBy', { enemy: deathDialog.deathInfo.killer })}
                                </Typography>
                                
                                {deathDialog.deathInfo.damage > 0 && (
                                    <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
                                        ⚡ {t('battle.finalDamage', { damage: deathDialog.deathInfo.damage })}
                                    </Typography>
                                )}
                                
                                <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
                                    ❤️ {t('battle.healthAtDeath', { health: deathDialog.deathInfo.playerHealth })}
                                </Typography>
                                
                                {deathDialog.deathInfo.lastAttackType !== 'Unknown' && (
                                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                        🎯 {t('battle.lastAttackType', { type: deathDialog.deathInfo.lastAttackType })}
                                    </Typography>
                                )}
                            </Box>
                        )}
                        
                        {/* Death Penalties */}
                        {(deathDialog.goldLost > 0 || deathDialog.equipmentLost.length > 0) && (
                            <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: 1 }}>
                                <Typography variant="h6" sx={{ mb: 1, color: '#ff6b6b', textAlign: 'center' }}>
                                    💀 {t('battle.deathPenalties')}
                                </Typography>
                                
                                {deathDialog.goldLost > 0 && (
                                    <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
                                        💰 {t('battle.goldLost', { amount: formatGold(deathDialog.goldLost) })}
                                    </Typography>
                                )}
                                
                                {deathDialog.equipmentLost.length > 0 && (
                                    <Box>
                                        <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
                                            ⚔️ {t('battle.equipmentLost')}:
                                        </Typography>
                                        {deathDialog.equipmentLost.map((lost, index) => (
                                            <Typography key={index} variant="body2" sx={{ ml: 2, color: '#ff6b6b', textAlign: 'center' }}>
                                                • {lost.item} ({lost.slot})
                                            </Typography>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        )}
                        
                        <Typography variant="body2" sx={{ 
                            textAlign: 'center', 
                            fontWeight: 'bold',
                            color: '#ffd700',
                            fontSize: '1.2rem'
                        }}>
                            {t('battle.respawnIn', { seconds: deathDialog.countdown })}
                        </Typography>
                    </Box>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default MainLayout;
