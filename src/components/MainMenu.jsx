import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "../assets/styles/MainLayout.module.scss";
import { INITIAL_SKILLS } from "../utils/constants";
import { getSkillIcon } from "../utils/common.js";
import { useTranslate } from "../hooks/useTranslate";
import { getSkillData } from "../utils/skillExperience.js";
import { Tooltip } from "@mui/material";
import { useBattleContext } from '../contexts/BattleContext';

// Helper to chunk an array into groups of n
function chunkArray(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

function MainMenu() {
    const { t } = useTranslate();
    const [skills, setSkills] = useState(INITIAL_SKILLS);
    const { selectedAttackType, setSelectedAttackType } = useBattleContext();

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
                            <NavLink to="/battle-selection" className={styles.compactMenuItem}>
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

            {/* Skills Sections - Redesigned */}
            <div className={styles.skillCategoriesMenu}>
                {Object.entries(skills).map(([category, subskills], idx) => {
                    const categoryColors = [
                        '#ff8c00', // melee - orange
                        '#4caf50', // ranged - green
                        '#3b82f6', // magic - blue
                        '#b45af2', // defense - purple
                        '#10b981', // holy - teal
                        '#ffd700', // advanced - gold
                    ];
                    const borderColor = categoryColors[idx % categoryColors.length];
                    const skillEntries = Object.entries(subskills);
                    const skillRows = chunkArray(skillEntries, 3);
                    return (
                        <div
                            key={category}
                            className={styles.skillCategoryCard}
                            style={{ border: `2px solid ${borderColor}`, background: 'rgba(0,0,0,0.15)', borderRadius: 10, marginBottom: 10, padding: 8 }}
                        >
                            <div className={styles.skillCategoryTitle} style={{ color: borderColor, fontWeight: 'bold', fontSize: '0.75rem', marginBottom: 6, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 }}>
                                {t(`skills.${category}`)}
                            </div>
                            {skillRows.map((row, rowIdx) => (
                                <div key={rowIdx} style={{ display: 'flex', justifyContent: 'center', gap: 0, marginBottom: rowIdx !== skillRows.length - 1 ? 8 : 2, width: '100%' }}>
                                    {Array.from({ length: 3 }).map((_, i) => {
                                        const skillPair = row[i];
                                        if (!skillPair) {
                                            // Empty slot for alignment
                                            return <div key={i} style={{ flex: 1, minWidth: 0 }} />;
                                        }
                                        const [skill, skillObj] = skillPair;
                                        const isSelected = selectedAttackType === skill;
                                        return (
                                            <Tooltip key={skill} title={t(`skills.${skill}`)} arrow placement="right">
                                                <div
                                                    className={styles.skillCategorySkill}
                                                    style={{
                                                        display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0, cursor: 'pointer',
                                                        border: isSelected ? `2px solid #fff` : '2px solid transparent',
                                                        background: isSelected ? '#4a4a6a' : 'transparent',
                                                        borderRadius: 6,
                                                        boxShadow: isSelected ? '0 0 0 2px #fff' : 'none',
                                                        padding: 2,
                                                        transition: 'all 0.15s',
                                                    }}
                                                    onClick={() => setSelectedAttackType(skill)}
                                                >
                                                    <img src={getSkillIcon(skill)} alt={skill} style={{ width: 28, height: 28, marginBottom: 8, filter: 'drop-shadow(1px 1px 0px #000)' }} />
                                                    <span className={styles.skillLevel} style={{ fontSize: '0.55rem', color: borderColor, fontWeight: 'bold', textShadow: '1px 1px 0px #000' }}>{skillObj.level}/99</span>
                                                </div>
                                            </Tooltip>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}

export default MainMenu; 