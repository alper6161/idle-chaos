import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "../assets/styles/MainLayout.module.scss";
import { INITIAL_SKILLS } from "../utils/constants";
import { getSkillIcon } from "../utils/common.js";
import { useTranslate } from "../hooks/useTranslate";
import { getSkillData } from "../utils/skillExperience.js";

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
                            {/* Equipment Section */}
                <div className={styles.group}>
                    <div className={styles.groupTitle}>{t('common.equipment').toUpperCase()}</div>
                    <NavLink
                        to="/equipment"
                        className={styles.equipmentItem}
                    >
                        <span className={styles.equipmentIcon}>🛡️</span>
                        <span className={styles.equipmentLabel}>{t('common.equipment')}</span>
                    </NavLink>
                </div>

                            {/* Store Section */}
                <div className={styles.group}>
                    <div className={styles.groupTitle}>{t('common.store').toUpperCase()}</div>
                    <NavLink
                        to="/store"
                        className={styles.storeItem}
                    >
                        <span className={styles.storeIcon}>💰</span>
                        <span className={styles.storeLabel}>{t('common.store')}</span>
                    </NavLink>
                </div>

                            {/* Skills Section */}
                <div className={styles.group}>
                    <div className={styles.groupTitle}>{t('skills.title')}</div>
                    <NavLink
                        to="/skills"
                        className={styles.skillsItem}
                    >
                        <span className={styles.skillsIcon}>🎯</span>
                        <span className={styles.skillsLabel}>{t('skills.title')}</span>
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

            {/* Skills Sections */}
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