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
    Tooltip
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
import { INITIAL_SKILLS } from "../utils/constants.js";
import { getSkillIcon } from "../utils/common.js";
import { useTranslate } from "../hooks/useTranslate";
import styles from "../assets/styles/Skills.module.scss";

// Skill buffs data - what buffs each skill provides at different levels
const SKILL_BUFFS = {
    // Melee skills
    stab: {
        10: "Critical hit chance +5%",
        25: "Critical hit chance +10%, Critical damage +15%",
        50: "Critical hit chance +15%, Critical damage +25%, Attack speed +10%",
        75: "Critical hit chance +20%, Critical damage +35%, Attack speed +15%, Bleed chance +25%",
        99: "⚡ ASSASSIN'S MASTERY: Critical hit chance +25%, Critical damage +50%, Attack speed +20%, Bleed chance +35%, Life steal +10%, INSTANT KILL chance +5%"
    },
    slash: {
        10: "Attack damage +10%",
        25: "Attack damage +20%, Armor penetration +15%",
        50: "Attack damage +30%, Armor penetration +25%, Bleed chance +20%",
        75: "Attack damage +40%, Armor penetration +35%, Bleed chance +30%, Attack speed +10%",
        99: "🗡️ BLADE MASTER: Attack damage +50%, Armor penetration +50%, Bleed chance +40%, Attack speed +15%, Life steal +15%, CLEAVE ATTACK (hits 3 enemies)"
    },
    crush: {
        10: "Stun chance +5%",
        25: "Stun chance +10%, Attack damage +15%",
        50: "Stun chance +15%, Attack damage +25%, Armor penetration +20%",
        75: "Stun chance +20%, Attack damage +35%, Armor penetration +30%, Critical chance +10%",
        99: "🔨 WARHAMMER LORD: Stun chance +25%, Attack damage +45%, Armor penetration +40%, Critical chance +15%, Life steal +20%, EARTHQUAKE AOE (stuns all enemies)"
    },
    // Ranged skills
    throwing: {
        10: "Attack range +1",
        25: "Attack range +2, Attack speed +10%",
        50: "Attack range +3, Attack speed +15%, Critical chance +10%",
        75: "Attack range +4, Attack speed +20%, Critical chance +15%, Dodge +10%",
        99: "🎯 MASTER THROWER: Attack range +5, Attack speed +25%, Critical chance +20%, Dodge +15%, Life steal +5%, BOOMERANG EFFECT (returns for double damage)"
    },
    archery: {
        10: "Critical chance +8%",
        25: "Critical chance +15%, Attack speed +10%",
        50: "Critical chance +20%, Attack speed +15%, Attack range +2",
        75: "Critical chance +25%, Attack speed +20%, Attack range +3, Dodge +15%",
        99: "🏹 ARCHER LEGEND: Critical chance +30%, Attack speed +25%, Attack range +4, Dodge +20%, Life steal +10%, RAIN OF ARROWS (hits all enemies)"
    },
    // Magic skills
    lightning: {
        10: "Lightning damage +15%",
        25: "Lightning damage +25%, Stun chance +10%",
        50: "Lightning damage +35%, Stun chance +15%, Attack speed +10%",
        75: "Lightning damage +45%, Stun chance +20%, Attack speed +15%, Critical chance +10%",
        99: "⚡ THUNDER GOD: Lightning damage +60%, Stun chance +25%, Attack speed +20%, Critical chance +15%, Life steal +5%, CHAIN LIGHTNING (bounces to 5 enemies)"
    },
    fire: {
        10: "Fire damage +15%",
        25: "Fire damage +25%, Burn chance +20%",
        50: "Fire damage +35%, Burn chance +30%, Attack speed +10%",
        75: "Fire damage +45%, Burn chance +40%, Attack speed +15%, Critical chance +10%",
        99: "🔥 PHOENIX LORD: Fire damage +60%, Burn chance +50%, Attack speed +20%, Critical chance +15%, Life steal +10%, INFERNO BLAST (burns all enemies for 10 seconds)"
    },
    ice: {
        10: "Ice damage +15%",
        25: "Ice damage +25%, Freeze chance +10%",
        50: "Ice damage +35%, Freeze chance +15%, Attack speed +10%",
        75: "Ice damage +45%, Freeze chance +20%, Attack speed +15%, Critical chance +10%",
        99: "❄️ FROST KING: Ice damage +60%, Freeze chance +25%, Attack speed +20%, Critical chance +15%, Life steal +5%, BLIZZARD (freezes all enemies for 5 seconds)"
    },
    // Prayer skills
    heal: {
        10: "Healing +20%",
        25: "Healing +35%, Mana regeneration +10%",
        50: "Healing +50%, Mana regeneration +20%, Auto-heal chance +15%",
        75: "Healing +65%, Mana regeneration +30%, Auto-heal chance +25%, Critical heal chance +20%",
        99: "✨ DIVINE HEALER: Healing +80%, Mana regeneration +40%, Auto-heal chance +35%, Critical heal chance +30%, Life regeneration +10%, RESURRECTION (revives once per battle)"
    },
    buff: {
        10: "Buff duration +20%",
        25: "Buff duration +35%, Buff strength +15%",
        50: "Buff duration +50%, Buff strength +25%, Auto-buff chance +20%",
        75: "Buff duration +65%, Buff strength +35%, Auto-buff chance +30%, Multiple buffs +2",
        99: "🌟 BUFF MASTER: Buff duration +80%, Buff strength +50%, Auto-buff chance +40%, Multiple buffs +3, Permanent buffs +1, DIVINE BLESSING (all stats +100% for 30 seconds)"
    },
    // Defense skills
    dodge: {
        10: "Dodge chance +5%",
        25: "Dodge chance +10%, Attack speed +5%",
        50: "Dodge chance +15%, Attack speed +10%, Critical chance +5%",
        75: "Dodge chance +20%, Attack speed +15%, Critical chance +10%, Counter attack +15%",
        99: "👻 GHOST WARRIOR: Dodge chance +25%, Attack speed +20%, Critical chance +15%, Counter attack +25%, Life steal +10%, PHASE SHIFT (dodges all attacks for 3 seconds)"
    },
    block: {
        10: "Block chance +8%",
        25: "Block chance +15%, Damage reduction +10%",
        50: "Block chance +20%, Damage reduction +20%, Counter attack +10%",
        75: "Block chance +25%, Damage reduction +30%, Counter attack +20%, Stun chance +10%",
        99: "🛡️ IMMORTAL GUARDIAN: Block chance +30%, Damage reduction +40%, Counter attack +30%, Stun chance +15%, Life steal +15%, INVINCIBILITY SHIELD (blocks all damage for 5 seconds)"
    },
    armor: {
        10: "Defense +15%",
        25: "Defense +25%, Health +10%",
        50: "Defense +35%, Health +20%, Damage reduction +10%",
        75: "Defense +45%, Health +30%, Damage reduction +20%, Block chance +10%",
        99: "⚔️ TITAN ARMOR: Defense +60%, Health +40%, Damage reduction +30%, Block chance +15%, Life regeneration +10%, ADAMANTINE SKIN (reflects 50% damage back)"
    },
    // Utility skills
    hp: {
        10: "Maximum health +20%",
        25: "Maximum health +35%, Health regeneration +10%",
        50: "Maximum health +50%, Health regeneration +20%, Auto-heal +15%",
        75: "Maximum health +65%, Health regeneration +30%, Auto-heal +25%, Damage reduction +10%",
        99: "💎 DIAMOND BODY: Maximum health +80%, Health regeneration +40%, Auto-heal +35%, Damage reduction +20%, Life steal +10%, IMMORTALITY (cannot die below 1 HP)"
    },
    energy: {
        10: "Maximum energy +20%",
        25: "Maximum energy +35%, Energy regeneration +15%",
        50: "Maximum energy +50%, Energy regeneration +25%, Auto-energy +20%",
        75: "Maximum energy +65%, Energy regeneration +35%, Auto-energy +30%, Skill cooldown -10%",
        99: "⚡ INFINITE POWER: Maximum energy +80%, Energy regeneration +50%, Auto-energy +40%, Skill cooldown -20%, Infinite energy +5%, TIME STOP (freezes enemy for 3 seconds)"
    },
    // Advanced skills
    lifeSteal: {
        10: "Life steal +5%",
        25: "Life steal +10%, Critical chance +5%",
        50: "Life steal +15%, Critical chance +10%, Attack speed +5%",
        75: "Life steal +20%, Critical chance +15%, Attack speed +10%, Health regeneration +10%",
        99: "🩸 VAMPIRE LORD: Life steal +25%, Critical chance +20%, Attack speed +15%, Health regeneration +20%, Infinite life steal +5%, BLOOD RITUAL (steals 50% of enemy max HP)"
    },
    counterAttack: {
        10: "Counter attack chance +10%",
        25: "Counter attack chance +20%, Counter damage +15%",
        50: "Counter attack chance +30%, Counter damage +25%, Stun chance +10%",
        75: "Counter attack chance +40%, Counter damage +35%, Stun chance +15%, Critical chance +10%",
        99: "⚔️ COUNTER MASTER: Counter attack chance +50%, Counter damage +50%, Stun chance +20%, Critical chance +15%, Life steal +10%, REVERSE TIME (reverses last enemy attack)"
    },
    doubleAttack: {
        10: "Double attack chance +5%",
        25: "Double attack chance +10%, Attack speed +10%",
        50: "Double attack chance +15%, Attack speed +15%, Critical chance +10%",
        75: "Double attack chance +20%, Attack speed +20%, Critical chance +15%, Life steal +10%",
        99: "⚡ SPEED DEMON: Double attack chance +25%, Attack speed +25%, Critical chance +20%, Life steal +15%, Triple attack +5%, LIGHTNING STRIKE (attacks 10 times instantly)"
    },
    critChance: {
        10: "Critical chance +8%",
        25: "Critical chance +15%, Critical damage +10%",
        50: "Critical chance +20%, Critical damage +20%, Attack speed +5%",
        75: "Critical chance +25%, Critical damage +30%, Attack speed +10%, Life steal +10%",
        99: "🎯 CRITICAL GOD: Critical chance +30%, Critical damage +40%, Attack speed +15%, Life steal +15%, Guaranteed crit +5%, DEATH MARK (next attack is 1000% damage)"
    },
    critDamage: {
        10: "Critical damage +15%",
        25: "Critical damage +25%, Critical chance +5%",
        50: "Critical damage +35%, Critical chance +10%, Attack speed +5%",
        75: "Critical damage +45%, Critical chance +15%, Attack speed +10%, Life steal +10%",
        99: "💥 DAMAGE OVERLORD: Critical damage +60%, Critical chance +20%, Attack speed +15%, Life steal +15%, Infinite crit +5%, NUCLEAR STRIKE (deals 9999 damage to all enemies)"
    }
};

function Skills() {
    const { t } = useTranslate();
    const [skills, setSkills] = useState(() => {
        const saved = localStorage.getItem("gameData");
        return saved ? JSON.parse(saved) : INITIAL_SKILLS;
    });
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

    // Calculate passive buffs from completed skills
    const calculatePassiveBuffs = () => {
        const buffs = [];
        let totalCompletedSkills = 0;
        let totalSkillLevels = 0;

        Object.entries(skills).forEach(([category, subskills]) => {
            Object.entries(subskills).forEach(([skillName, level]) => {
                if (level >= 99) {
                    totalCompletedSkills++;
                    totalSkillLevels += level;
                    
                    // Add skill-specific buffs
                    if (SKILL_BUFFS[skillName] && SKILL_BUFFS[skillName][99]) {
                        buffs.push({
                            name: t(`skills.${skillName}`),
                            description: SKILL_BUFFS[skillName][99],
                            icon: getSkillIcon(skillName)
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
                icon: "/images/skills/autoAwesome.png"
            });
        }

        if (totalSkillLevels >= 1000) {
            buffs.push({
                name: "Legendary Status",
                description: "All damage +25%, All defense +25%",
                icon: "/images/skills/trendingUp.png"
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
                            passiveBuffs.buffs.map((buff, index) => (
                                <Box key={index} className={styles.buffItem}>
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
                            ))
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
                                {Object.entries(subskills).map(([skillName, level]) => (
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
                                                    {t('skills.level')} {level}/99
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
                                                value={getSkillProgress(level)}
                                                className={styles.progressBar}
                                            />
                                            <div className={styles.progressText}>
                                                {Math.round(getSkillProgress(level))}%
                                            </div>
                                        </Box>
                                        
                                        <Box className={styles.skillStats}>
                                            <div className={styles.statLabel}>
                                                {t('skills.currentXp')}: 0
                                            </div>
                                            <div className={styles.statLabel}>
                                                {t('skills.xpToNext')}: {(level + 1) * 1000}
                                            </div>
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
                                        {t('skills.level')} {skills[Object.keys(skills).find(cat => skills[cat][selectedSkill])][selectedSkill]}/99
                                    </div>
                                </Box>
                            </Box>
                            
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