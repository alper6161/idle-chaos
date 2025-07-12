import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import styles from "../assets/styles/MainLayout.module.scss";
import { INITIAL_SKILLS } from "../utils/constants";
import { Settings, AccountCircle } from "@mui/icons-material";
import {getSkillIcon} from "../utils/common.js";
import SettingsDialog from "./Settings.jsx";
import { getGold, formatGold } from "../utils/gold.js";

function MainLayout() {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [playerGold, setPlayerGold] = useState(getGold());

    const handleSettingsClick = () => {
        setSettingsOpen(true);
    };

    const handleSettingsClose = () => {
        setSettingsOpen(false);
    };

    // Update gold display when localStorage changes
    useEffect(() => {
        const updateGold = () => {
            setPlayerGold(getGold());
        };

        // Update gold every second (in case it changes in other components)
        const interval = setInterval(updateGold, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                {/* Equipment Section */}
                <div className={styles.group}>
                    <div className={styles.groupTitle}>EQUIPMENT</div>
                    <NavLink
                        to="/equipment"
                        className={styles.equipmentItem}
                    >
                        <span className={styles.equipmentIcon}>⚔️</span>
                        <span className={styles.equipmentLabel}>Equipment</span>
                    </NavLink>
                </div>

                {/* Battle Section */}
                <div className={styles.group}>
                    <div className={styles.groupTitle}>BATTLE</div>
                    <NavLink
                        to="/battle"
                        className={styles.battleItem}
                    >
                        <span className={styles.battleIcon}>⚔️</span>
                        <span className={styles.battleLabel}>Battle</span>
                    </NavLink>
                </div>

                {/* Skills Sections */}
                {Object.entries(INITIAL_SKILLS).map(([category, subskills]) => (
                    <div key={category} className={styles.group}>
                        <div className={styles.groupTitle}>{category.toUpperCase()}</div>
                        {typeof subskills === "object" &&
                            Object.entries(subskills).map(([skill, level]) => (
                                <NavLink
                                    key={skill}
                                    to={`/skills/${skill}`}
                                    className={styles.skillItem}
                                >
                                    <img src={getSkillIcon(skill)} alt={skill} />
                                    <span className={styles.skillLabel}>{skill}</span>
                                    <span className={styles.skillLevel}>Lv.{level}</span>
                                </NavLink>
                            ))}
                    </div>
                ))}
            </aside>

            {/* Main Content */}
            <main className={styles.content}>
                <div className={styles.topbar}>
                    <div className={styles.goldDisplay}>
                        <span className={styles.goldIcon}>💰</span>
                        <span className={styles.goldAmount}>{formatGold(playerGold)}</span>
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
