import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import styles from "../assets/styles/MainLayout.module.scss";
import { Settings, AccountCircle } from "@mui/icons-material";
import SettingsDialog from "./Settings.jsx";
import { getGold, formatGold } from "../utils/gold.js";
import { getActiveBuffsInfo } from "../utils/buffUtils.js";
import { useTranslate } from "../hooks/useTranslate";
import MainMenu from "../components/MainMenu";

function MainLayout() {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [playerGold, setPlayerGold] = useState(getGold());
    const [activeBuffs, setActiveBuffs] = useState(getActiveBuffsInfo());
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
                        <Settings 
                            className={styles.icon} 
                            onClick={handleSettingsClick}
                            style={{ cursor: 'pointer' }}
                        />
                        <AccountCircle className={styles.icon} />
                    </div>
                </div>
                <Outlet />
            </main>

            {/* Settings Dialog */}
            <SettingsDialog 
                open={settingsOpen} 
                onClose={handleSettingsClose} 
            />
        </div>
    );
}

export default MainLayout;
