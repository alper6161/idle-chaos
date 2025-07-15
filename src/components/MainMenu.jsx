import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "../assets/styles/MainLayout.module.scss";
import { INITIAL_SKILLS } from "../utils/constants";
import { getSkillIcon } from "../utils/common.js";
import { useTranslate } from "../hooks/useTranslate";
import { getSkillData } from "../utils/skillExperience.js";
import { Tooltip } from "@mui/material";

function MainMenu() {
    const { t } = useTranslate();
    const [skills, setSkills] = useState(INITIAL_SKILLS);

    useEffect(() => {
        const loadSkills = () => {
            const skillData = getSkillData();
            setSkills(skillData);
        };

        loadSkills();
        
        // Listen for skill updates
        const handleStorageChange = () => {
            loadSkills();
        };

        window.addEventListener('storage', handleStorageChange);
        
        // Also check for local updates (when same tab updates localStorage)
        const interval = setInterval(loadSkills, 1000);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoRow}>
                <img
                    src="/IdleChaosLogo.png"
                    alt="Idle Chaos Logo"
                    className={styles.logoImage + ' ' + styles.menuLogoImage}
                    style={{ width: '100%', height: 'auto', objectFit: 'contain', maxWidth: '100%', maxHeight: 80 }}
                />
            </div>
            
            {/* Compact Main Menu Items */}
            <div className={styles.compactMenu}>
                <Tooltip title={t('common.equipment')} arrow placement="right">
                    <NavLink to="/equipment" className={styles.compactMenuItem}>
                        <span className={styles.compactMenuIcon}>🛡️</span>
                    </NavLink>
                </Tooltip>
                
                <Tooltip title={t('common.store')} arrow placement="right">
                    <NavLink to="/store" className={styles.compactMenuItem}>
                        <span className={styles.compactMenuIcon}>💰</span>
                    </NavLink>
                </Tooltip>
                
                <Tooltip title={t('skills.title')} arrow placement="right">
                    <NavLink to="/skills" className={styles.compactMenuItem}>
                        <span className={styles.compactMenuIcon}>🎯</span>
                    </NavLink>
                </Tooltip>
                
                <Tooltip title={t('common.battle')} arrow placement="right">
                    <NavLink to="/battle" className={styles.compactMenuItem}>
                        <span className={styles.compactMenuIcon}>⚔️</span>
                    </NavLink>
                </Tooltip>
                
                <Tooltip title="Achievements" arrow placement="right">
                    <NavLink to="/achievement" className={styles.compactMenuItem}>
                        <span className={styles.compactMenuIcon}>🏆</span>
                    </NavLink>
                </Tooltip>
                
                <Tooltip title="Pets" arrow placement="right">
                    <NavLink to="/pets" className={styles.compactMenuItem}>
                        <span className={styles.compactMenuIcon}>🐾</span>
                    </NavLink>
                </Tooltip>
            </div>

            {/* Skills Sections - Keep as is for skill levels */}
            {Object.entries(skills).map(([category, subskills]) => (
                <div key={category} className={styles.group}>
                    <div className={styles.groupTitle}>{t(`skills.${category}`)}</div>
                    {typeof subskills === "object" &&
                        Object.entries(subskills).map(([skill, skillObj]) => (
                            <NavLink
                                key={skill}
                                to="/skills"
                                className={styles.skillItem}
                            >
                                <img src={getSkillIcon(skill)} alt={skill} />
                                <span className={styles.skillLabel}>{t(`skills.${skill}`)}</span>
                                <span className={styles.skillLevel}>{t('common.level')}{skillObj.level}</span>
                            </NavLink>
                        ))}
                </div>
            ))}
        </aside>
    );
}

export default MainMenu; 