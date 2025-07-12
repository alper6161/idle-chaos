import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import styles from "../assets/styles/MainLayout.module.scss";
import { INITIAL_SKILLS } from "../utils/constants";
import { Settings, AccountCircle } from "@mui/icons-material";
import {getSkillIcon} from "../utils/common.js";
import SettingsDialog from "./Settings.jsx";
import { getGold, formatGold } from "../utils/gold.js";
import { getActiveBuffsInfo } from "../utils/buffUtils.js";
import { useTranslate } from "../hooks/useTranslate";

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
            <aside className={styles.sidebar}>
                {/* Equipment Section */}
                <div className={styles.group}>
                    <div className={styles.groupTitle}>{t('common.equipment').toUpperCase()}</div>
                    <NavLink
                        to="/equipment"
                        className={styles.equipmentItem}
                    >
                        <span className={styles.equipmentIcon}>⚔️</span>
                        <span className={styles.equipmentLabel}>{t('common.equipment')}</span>
                    </NavLink>
                </div>

                {/* Battle Section */}
                <div className={styles.group}>
                    <div className={styles.groupTitle}>{t('common.battle').toUpperCase()}</div>
                    <NavLink
                        to="/battle"
                        className={styles.battleItem}
                    >
                        <span className={styles.battleIcon}>⚔️</span>
                        <span className={styles.battleLabel}>{t('common.battle')}</span>
                    </NavLink>
                </div>

                {/* Store Section */}
                <div className={styles.group}>
                    <div className={styles.groupTitle}>{t('common.store').toUpperCase()}</div>
                    <NavLink
                        to="/store"
                        className={styles.storeItem}
                    >
                        <span className={styles.storeIcon}>🏪</span>
                        <span className={styles.storeLabel}>{t('common.store')}</span>
                    </NavLink>
                </div>

                {/* Skills Sections */}
                {Object.entries(INITIAL_SKILLS).map(([category, subskills]) => (
                    <div key={category} className={styles.group}>
                        <div className={styles.groupTitle}>{t(`skills.${category}`)}</div>
                        {typeof subskills === "object" &&
                            Object.entries(subskills).map(([skill, level]) => (
                                <NavLink
                                    key={skill}
                                    to={`/skills/${skill}`}
                                    className={styles.skillItem}
                                >
                                    <img src={getSkillIcon(skill)} alt={skill} />
                                    <span className={styles.skillLabel}>{t(`skills.${skill}`)}</span>
                                    <span className={styles.skillLevel}>{t('common.level')}{level}</span>
                                </NavLink>
                            ))}
                    </div>
                ))}
            </aside>

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
