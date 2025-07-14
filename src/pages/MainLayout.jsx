import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import styles from "../assets/styles/MainLayout.module.scss";

import SettingsDialog from "./Settings.jsx";
import { getGold, formatGold } from "../utils/gold.js";
import { getActiveBuffsInfo } from "../utils/buffUtils.js";
import { useTranslate } from "../hooks/useTranslate";
import MainMenu from "../components/MainMenu";
import { saveCurrentGame } from "../utils/saveManager.js";
import { Alert } from "@mui/material";

function MainLayout() {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [playerGold, setPlayerGold] = useState(getGold());
    const [activeBuffs, setActiveBuffs] = useState(getActiveBuffsInfo());
    const [showAutoSaveSuccess, setShowAutoSaveSuccess] = useState(false);
    const { t } = useTranslate();

    const handleSettingsClick = () => {
        setSettingsOpen(true);
    };

    const handleSettingsClose = () => {
        setSettingsOpen(false);
    };

    // Update gold and buffs display when localStorage changes
    useEffect(() => {
        const updateGoldAndBuffs = () => {
            setPlayerGold(getGold());
            setActiveBuffs(getActiveBuffsInfo());
        };

        // Update gold and buffs every second (in case they change in other components)
        const interval = setInterval(updateGoldAndBuffs, 1000);

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
        </div>
    );
}

export default MainLayout;
