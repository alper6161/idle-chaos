import { NavLink } from "react-router-dom";
import styles from "../assets/styles/MainLayout.module.scss";
import { INITIAL_SKILLS } from "../utils/constants";
import { getSkillIcon } from "../utils/common.js";
import { useTranslate } from "../hooks/useTranslate";

function MainMenu() {
    const { t } = useTranslate();

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
    );
}

export default MainMenu; 