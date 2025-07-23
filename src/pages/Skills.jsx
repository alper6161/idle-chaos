import { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Collapse,
    Chip,
    LinearProgress,
    Tooltip,
    Typography
} from "@mui/material";
import { 
    Visibility,
    ExpandMore,
    ExpandLess,
    TrendingUp,
    Shield,
    LocalFireDepartment,
    AutoAwesome
} from "@mui/icons-material";
import { INITIAL_SKILLS, SKILL_LEVEL_BONUSES } from "../utils/constants.js";
import { getSkillIcon } from "../utils/common.js";
import { useTranslate } from "../hooks/useTranslate";
import { getSkillInfo, getSkillData } from "../utils/skillExperience.js";
import { SKILL_BUFFS } from "../utils/skillBuffs.js";
import styles from "../assets/styles/Skills.module.scss";

function Skills() {
    const { t } = useTranslate();
    const [skills, setSkills] = useState(() => getSkillData());

    // Update skills when localStorage changes
    useEffect(() => {
        const loadSkills = () => {
            setSkills(getSkillData());
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
    const [expandedCategories, setExpandedCategories] = useState(() => {
        // Tüm kategorileri başlangıçta açık yap
        const initialExpanded = {};
        Object.keys(skills).forEach(category => {
            initialExpanded[category] = true;
        });
        return initialExpanded;
    });
    const [skillDetailsOpen, setSkillDetailsOpen] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState(null);

    // Calculate passive buffs from completed skills and active skill buffs
    const calculatePassiveBuffs = () => {
        const buffs = [];
        let totalCompletedSkills = 0;
        let totalSkillLevels = 0;

        // Helper function to get skill buff description
        const getSkillBuffDescription = (skillName, level) => {
            if (!SKILL_BUFFS[skillName]) return null;
            
            // Find the highest level buff that applies
            const levels = Object.keys(SKILL_BUFFS[skillName])
                .map(Number)
                .sort((a, b) => b - a);
            
            for (const reqLevel of levels) {
                if (level >= reqLevel) {
                    return SKILL_BUFFS[skillName][reqLevel];
                }
            }
            return null;
        };

        // Helper function to get all active skill buffs for a skill
        const getActiveSkillBuffs = (skillName, level) => {
            if (level === 0 || !SKILL_BUFFS[skillName]) return [];
            
            const activeBuffs = [];
            Object.entries(SKILL_BUFFS[skillName]).forEach(([reqLevel, description]) => {
                if (level >= parseInt(reqLevel)) {
                    activeBuffs.push({
                        level: reqLevel,
                        description: description
                    });
                }
            });
            
            return activeBuffs.sort((a, b) => parseInt(a.level) - parseInt(b.level));
        };

        // Track processed skills to avoid duplicates
        const processedSkills = new Set();
        
        Object.entries(skills).forEach(([category, subskills]) => {
            Object.entries(subskills).forEach(([skillName, skillObj]) => {
                // Skip if already processed
                if (processedSkills.has(skillName)) return;
                processedSkills.add(skillName);
                
                if (skillObj.level >= 99) {
                    totalCompletedSkills++;
                    totalSkillLevels += skillObj.level;
                    // Add max level skill buffs
                    if (SKILL_BUFFS[skillName] && SKILL_BUFFS[skillName][99]) {
                        buffs.push({
                            name: t(`skills.${skillName}`),
                            description: SKILL_BUFFS[skillName][99],
                            icon: getSkillIcon(skillName),
                            type: 'maxed'
                        });
                    }
                } else if (skillObj.level > 0) {
                    // Add all active skill buffs for non-maxed skills
                    const activeBuffs = getActiveSkillBuffs(skillName, skillObj.level);
                    if (activeBuffs.length > 0) {
                        // Combine all active buffs into one description
                        const buffDescriptions = activeBuffs.map(buff => 
                            `Level ${buff.level}: ${buff.description}`
                        ).join('\n');
                        
                        buffs.push({
                            name: t(`skills.${skillName}`),
                            description: buffDescriptions,
                            icon: getSkillIcon(skillName),
                            type: 'active',
                            level: skillObj.level
                        });
                    }
                }
            });
        });

        // Add general buffs based on completion
        if (totalCompletedSkills >= 5) {
            buffs.push({
                name: "Master of All",
                description: "All stats +10% when 5+ skills are maxed",
                icon: "/images/skills/autoAwesome.png",
                type: 'special'
            });
        }
        if (totalSkillLevels >= 1000) {
            buffs.push({
                name: "Legendary Status",
                description: "All damage +25%, All defense +25%",
                icon: "/images/skills/trendingUp.png",
                type: 'special'
            });
        }
        return {
            buffs,
            totalCompletedSkills,
            totalSkillLevels
        };
    };

    const handleCategoryToggle = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const handleSkillDetails = (skillName) => {
        setSelectedSkill(skillName);
        setSkillDetailsOpen(true);
    };

    const handleCloseSkillDetails = () => {
        setSkillDetailsOpen(false);
        setSelectedSkill(null);
    };

    const getSkillProgress = (currentLevel) => {
        return (currentLevel / 99) * 100;
    };

    const getSkillBuffs = (skillName, level) => {
        if (!SKILL_BUFFS[skillName]) return [];
        
        const buffs = [];
        Object.entries(SKILL_BUFFS[skillName]).forEach(([reqLevel, description]) => {
            if (level >= parseInt(reqLevel)) {
                buffs.push({ level: reqLevel, description });
            }
        });
        return buffs;
    };

    const passiveBuffs = calculatePassiveBuffs();

    return (
        <div className={styles.skillsContainer}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.titleSection}>
                        <div className={styles.pixelTitle}>
                            {t('skills.title')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.mainContent}>
                {/* Passive Buffs Widget */}
                <Paper className={styles.widget} sx={{ mb: 3 }}>
                    <Box className={styles.widgetHeader}>
                        <div className={styles.widgetTitle}>
                            {t('skills.passiveBuffs')}
                        </div>
                        <Chip 
                            label={`${passiveBuffs.totalCompletedSkills} ${t('skills.maxedSkills')}`}
                            className={styles.completionChip}
                        />
                    </Box>
                    <Box className={styles.widgetContent}>
                        {passiveBuffs.buffs.length > 0 ? (
                            <>
                                {/* Maxed Skills Section */}
                                {passiveBuffs.buffs.filter(buff => buff.type === 'maxed').length > 0 && (
                                    <>
                                        <Typography variant="h6" className={styles.buffSectionTitle}>
                                            🏆 {t('skills.maxedSkills')}
                                        </Typography>
                                        {passiveBuffs.buffs.filter(buff => buff.type === 'maxed').map((buff, index) => (
                                            <Box key={`maxed-${index}`} className={`${styles.buffItem} ${styles.maxedBuff}`}>
                                                <img 
                                                    src={buff.icon} 
                                                    alt={buff.name}
                                                    className={styles.buffIcon}
                                                />
                                                <Box className={styles.buffInfo}>
                                                    <div className={styles.buffName}>
                                                        {buff.name}
                                                    </div>
                                                    <div className={styles.buffDescription}>
                                                        {buff.description}
                                                    </div>
                                                </Box>
                                            </Box>
                                        ))}
                                    </>
                                )}

                                {/* Active Skills Section */}
                                {passiveBuffs.buffs.filter(buff => buff.type === 'active').length > 0 && (
                                    <>
                                        <Typography variant="h6" className={styles.buffSectionTitle}>
                                            ⚡ {t('skills.activeBuffs')}
                                        </Typography>
                                        {passiveBuffs.buffs.filter(buff => buff.type === 'active').map((buff, index) => (
                                            <Box key={`active-${index}`} className={`${styles.buffItem} ${styles.activeBuff}`}>
                                                <img 
                                                    src={buff.icon} 
                                                    alt={buff.name}
                                                    className={styles.buffIcon}
                                                />
                                                <Box className={styles.buffInfo}>
                                                    <div className={styles.buffName}>
                                                        {buff.name} (Level {buff.level})
                                                    </div>
                                                    <div className={styles.buffDescription}>
                                                        {buff.description.split('\n').map((line, lineIndex) => (
                                                            <div key={lineIndex} className={styles.buffLine}>
                                                                {line}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Box>
                                            </Box>
                                        ))}
                                    </>
                                )}

                                {/* Special Buffs Section */}
                                {passiveBuffs.buffs.filter(buff => buff.type === 'special').length > 0 && (
                                    <>
                                        <Typography variant="h6" className={styles.buffSectionTitle}>
                                            🌟 {t('skills.specialBuffs')}
                                        </Typography>
                                        {passiveBuffs.buffs.filter(buff => buff.type === 'special').map((buff, index) => (
                                            <Box key={`special-${index}`} className={`${styles.buffItem} ${styles.specialBuff}`}>
                                                <img 
                                                    src={buff.icon} 
                                                    alt={buff.name}
                                                    className={styles.buffIcon}
                                                />
                                                <Box className={styles.buffInfo}>
                                                    <div className={styles.buffName}>
                                                        {buff.name}
                                                    </div>
                                                    <div className={styles.buffDescription}>
                                                        {buff.description}
                                                    </div>
                                                </Box>
                                            </Box>
                                        ))}
                                    </>
                                )}
                            </>
                        ) : (
                            <div className={styles.noBuffsText}>
                                {t('skills.completeSkillsToUnlock')}
                            </div>
                        )}
                    </Box>
                </Paper>

                {/* Skill Categories */}
                {Object.entries(skills).map(([category, subskills]) => (
                    <Paper key={category} className={styles.widget} sx={{ mb: 3 }}>
                        <Box className={styles.widgetHeader}>
                            <div className={styles.widgetTitle}>
                                {t(`skills.${category}`)}
                            </div>
                            <IconButton
                                onClick={() => handleCategoryToggle(category)}
                                className={styles.expandButton}
                            >
                                {expandedCategories[category] ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                        </Box>
                        
                        <Collapse in={expandedCategories[category]}>
                            <Box className={styles.widgetContent}>
                                {Object.entries(subskills).map(([skillName, skillObj]) => (
                                    <Box key={skillName} className={styles.skillItem}>
                                        <Box className={styles.skillHeader}>
                                            <img 
                                                src={getSkillIcon(skillName)} 
                                                alt={skillName}
                                                className={styles.skillIcon}
                                            />
                                            <Box className={styles.skillInfo}>
                                                <div className={styles.skillName}>
                                                    {t(`skills.${skillName}`)}
                                                </div>
                                                <div className={styles.skillLevel}>
                                                    {t('skills.level')} {skillObj.level}/99
                                                </div>
                                            </Box>
                                            <IconButton
                                                onClick={() => handleSkillDetails(skillName)}
                                                className={styles.detailsButton}
                                            >
                                                <Visibility />
                                            </IconButton>
                                        </Box>
                                        
                                        <Box className={styles.skillProgress}>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={getSkillProgress(skillObj.level)}
                                                className={styles.progressBar}
                                            />
                                            <div className={styles.progressText}>
                                                {Math.round(getSkillProgress(skillObj.level))}%
                                            </div>
                                        </Box>
                                        
                                        <Box className={styles.skillStats}>
                                            {(() => {
                                                const skillInfo = getSkillInfo(skillName);
                                                return (
                                                    <>
                                                        <div className={styles.statLabel}>
                                                            {t('skills.currentXp')}: {skillInfo.xp}
                                                        </div>
                                                        <div className={styles.statLabel}>
                                                            {t('skills.xpToNext')}: {skillInfo.xpToNext}
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Collapse>
                    </Paper>
                ))}
            </div>

            {/* Skill Details Dialog */}
            <Dialog 
                open={skillDetailsOpen} 
                onClose={handleCloseSkillDetails}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: '#2a2a4a',
                        border: '2px solid #4a4a6a',
                        borderRadius: 0,
                        color: '#e0e0e0'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    fontFamily: 'Press Start 2P, monospace',
                    fontSize: '1rem',
                    color: '#e0e0e0'
                }}>
                    {selectedSkill && t(`skills.${selectedSkill}`)} - {t('skills.skillDetails')}
                </DialogTitle>
                
                <DialogContent>
                    {selectedSkill && (
                        <Box>
                            <Box className={styles.skillDetailsHeader}>
                                <img 
                                    src={getSkillIcon(selectedSkill)} 
                                    alt={selectedSkill}
                                    className={styles.detailsSkillIcon}
                                />
                                <Box>
                                    <div className={styles.detailsSkillName}>
                                        {t(`skills.${selectedSkill}`)}
                                    </div>
                                    <div className={styles.detailsSkillLevel}>
                                        {t('skills.level')} {skills[Object.keys(skills).find(cat => skills[cat][selectedSkill])][selectedSkill].level}/99
                                    </div>
                                </Box>
                            </Box>
                            
                            {/* Skill Level Bonuses */}
                            {SKILL_LEVEL_BONUSES[selectedSkill] && (
                                <>
                                    <div className={styles.buffsTitle}>
                                        {t('skills.levelBonuses')}
                                    </div>
                                    <Box className={styles.buffDetailItem}>
                                        <div className={styles.buffDetailDescription}>
                                            <div>⚔️ {t('skills.attack')}: +{SKILL_LEVEL_BONUSES[selectedSkill].ATK} per level</div>
                                            <div>🗡️ {t('skills.minDamage')}: +{SKILL_LEVEL_BONUSES[selectedSkill].MIN_DAMAGE} per level</div>
                                            <div>⚔️ {t('skills.maxDamage')}: +{SKILL_LEVEL_BONUSES[selectedSkill].MAX_DAMAGE} per level</div>
                                        </div>
                                    </Box>
                                </>
                            )}
                            
                            <div className={styles.buffsTitle}>
                                {t('skills.availableBuffs')}
                            </div>
                            
                            {Object.entries(SKILL_BUFFS[selectedSkill] || {}).map(([level, description]) => (
                                <Box key={level} className={styles.buffDetailItem}>
                                    <Chip 
                                        label={`Level ${level}`}
                                        className={styles.levelChip}
                                    />
                                    <div className={styles.buffDetailDescription}>
                                        {description}
                                    </div>
                                </Box>
                            ))}
                        </Box>
                    )}
                </DialogContent>
                
                <DialogActions>
                    <Button 
                        onClick={handleCloseSkillDetails}
                        sx={{
                            color: '#e0e0e0',
                            fontFamily: 'Press Start 2P, monospace',
                            fontSize: '0.7rem'
                        }}
                    >
                        {t('skills.close')}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Skills; 