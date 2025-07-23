import React, { useState } from 'react';
import { Typography, LinearProgress, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Tooltip } from '@mui/material';
import { Visibility, AutoAwesome } from '@mui/icons-material';
import { useTranslate } from '../hooks/useTranslate';
import { getSkillInfo } from '../utils/skillExperience.js';
import { calculateSkillBuffsForAttackType } from '../utils/playerStats.js';
import { SKILL_BUFFS } from '../utils/skillBuffs.js';
import styles from '../assets/styles/Battle.module.scss';

const SkillExpWidget = ({ selectedAttackType }) => {
    const { t } = useTranslate();
    const [masteryModalOpen, setMasteryModalOpen] = useState(false);
    
    if (!selectedAttackType) {
        return null;
    }

    const skillInfo = getSkillInfo(selectedAttackType);
    const { level, xp, xpToNext } = skillInfo;
    
    // Get total accumulated bonuses using existing system
    const totalAccumulatedBonuses = calculateSkillBuffsForAttackType(selectedAttackType);
    
    // Get mastery buffs for this skill
    const skillBuffs = SKILL_BUFFS[selectedAttackType] || {};
    const masteryLevels = Object.keys(skillBuffs).map(Number).sort((a, b) => a - b);
    
    // Calculate progress percentage
    console.log('Skill XP Debug:', { skillName: selectedAttackType, level, xp, xpToNext });
    
    // Simplest approach: treat xp as current level progress and xpToNext as remaining
    const totalXPForLevel = xp + xpToNext;
    const progressPercentage = totalXPForLevel > 0 ? 
        Math.min(100, Math.max(0, (xp / totalXPForLevel) * 100)) : 0;
    
    console.log('Progress Debug:', { totalXPForLevel, progressPercentage });

    // Helper function to format bonus display
    const formatBonus = (bonus) => {
        if (typeof bonus === 'number') {
            return bonus > 0 ? `+${bonus.toFixed(1)}` : `${bonus.toFixed(1)}`;
        }
        return bonus;
    };

    // Helper function to get bonus description
    const getBonusDescription = (stat) => {
        const descriptions = {
            ATK: 'Attack Power',
            MIN_DAMAGE: 'Min Damage',
            MAX_DAMAGE: 'Max Damage',
            ACCURACY_BONUS: 'Accuracy',
            ATTACK_SPEED: 'Attack Speed',
            CRIT_CHANCE: 'Crit Chance',
            CRIT_DAMAGE: 'Crit Damage',
            DEF: 'Defense',
            HEALTH: 'Health',
            DAMAGE_RANGE_BONUS: 'Damage Range'
        };
        return descriptions[stat] || stat;
    };

    // Get completed mastery bonuses
    const completedMasteries = masteryLevels.filter(masteryLevel => level >= masteryLevel);
    const completedMasteryBonuses = completedMasteries.map(masteryLevel => ({
        level: masteryLevel,
        description: skillBuffs[masteryLevel]
    }));

    return (
        <>
            <div className={styles.skillExpWidget}>
                <Box sx={{ 
                    background: 'linear-gradient(145deg, #3a3a5a 0%, #2a2a4a 100%)',
                    border: '2px solid #4a4a6a',
                    borderRadius: 0,
                    padding: '12px',
                    boxShadow: '0 0 0 2px #000, 0 4px 0 0 #3a3a5a',
                    fontFamily: 'Press Start 2P, monospace'
                }}>
                    {/* Skill Name and Level */}
                    <Typography variant="h6" sx={{ 
                        color: '#e0e0e0', 
                        fontSize: '0.8rem', 
                        textAlign: 'center', 
                        marginBottom: '8px',
                        textShadow: '2px 2px 0px #000',
                        letterSpacing: '1px'
                    }}>
                        🎯 {t(`skills.${selectedAttackType}`)} Lv.{level}
                    </Typography>

                    {/* XP Progress */}
                    <Box sx={{ marginBottom: '8px' }}>
                        <Typography variant="body2" sx={{ 
                            color: '#4ecdc4', 
                            fontSize: '0.6rem', 
                            textAlign: 'center',
                            marginBottom: '4px',
                            textShadow: '1px 1px 0px #000'
                        }}>
                            XP: {xp} / {xpToNext + xp}
                        </Typography>
                        
                        <Box sx={{ 
                            width: '100%', 
                            height: '12px', 
                            backgroundColor: '#1a1a2e',
                            border: '2px solid #4a4a6a',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{
                                width: `${progressPercentage}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #4ecdc4 0%, #44a08d 100%)',
                                transition: 'width 0.3s ease',
                                boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.3)'
                            }} />
                        </Box>
                    </Box>

                    {/* Total Accumulated Bonuses */}
                    {Object.keys(totalAccumulatedBonuses).length > 0 && (
                        <Box sx={{ 
                            display: 'flex',
                            gap: '8px',
                            marginBottom: '6px'
                        }}>
                            {/* Total Level Bonuses */}
                            <Box sx={{ 
                                border: '1px solid #4ecdc4', 
                                borderRadius: 0, 
                                padding: '6px',
                                background: 'rgba(78, 205, 196, 0.1)',
                                flex: 1
                            }}>
                                <Typography variant="body2" sx={{ 
                                    color: '#4ecdc4', 
                                    fontSize: '0.5rem', 
                                    textAlign: 'center',
                                    marginBottom: '4px',
                                    textShadow: '1px 1px 0px #000',
                                    fontWeight: 'bold'
                                }}>
                                    Total Level Bonuses (Lv.{level}):
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {Object.entries(totalAccumulatedBonuses).map(([stat, bonus]) => (
                                        bonus !== 0 && (
                                            <Typography key={stat} variant="body2" sx={{ 
                                                color: '#e0e0e0', 
                                                fontSize: '0.45rem', 
                                                textAlign: 'center',
                                                textShadow: '1px 1px 0px #000'
                                            }}>
                                                {getBonusDescription(stat)}: {formatBonus(bonus)}
                                            </Typography>
                                        )
                                    ))}
                                </Box>
                            </Box>

                            {/* Completed Mastery Bonuses */}
                            <Box sx={{ 
                                border: '1px solid #22c55e', 
                                borderRadius: 0, 
                                padding: '6px',
                                background: 'rgba(34, 197, 94, 0.1)',
                                flex: 1,
                                position: 'relative'
                            }}>
                                <Typography variant="body2" sx={{ 
                                    color: '#22c55e', 
                                    fontSize: '0.5rem', 
                                    textAlign: 'center',
                                    marginBottom: '4px',
                                    textShadow: '1px 1px 0px #000',
                                    fontWeight: 'bold'
                                }}>
                                    Mastery Bonuses:
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {completedMasteryBonuses.length > 0 ? (
                                        completedMasteryBonuses.map((mastery, index) => (
                                            <Box key={index} sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                gap: '4px',
                                                flexDirection: 'column'
                                            }}>
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <AutoAwesome sx={{ 
                                                        color: '#22c55e', 
                                                        fontSize: '0.6rem' 
                                                    }} />
                                                    <Typography variant="body2" sx={{ 
                                                        color: '#22c55e', 
                                                        fontSize: '0.4rem', 
                                                        textAlign: 'center',
                                                        textShadow: '1px 1px 0px #000',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        Lv.{mastery.level}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{ 
                                                    color: '#22c55e', 
                                                    fontSize: '0.35rem', 
                                                    textAlign: 'center',
                                                    textShadow: '1px 1px 0px #000',
                                                    lineHeight: '1.2'
                                                }}>
                                                    {mastery.description}
                                                </Typography>
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography variant="body2" sx={{ 
                                            color: '#22c55e', 
                                            fontSize: '0.4rem', 
                                            textAlign: 'center',
                                            textShadow: '1px 1px 0px #000',
                                            fontStyle: 'italic'
                                        }}>
                                            None yet
                                        </Typography>
                                    )}
                                </Box>

                                {/* Mastery Targets Button - Top Right Corner */}
                                <Tooltip title="View Mastery Targets" arrow placement="top">
                                    <IconButton
                                        onClick={() => setMasteryModalOpen(true)}
                                        sx={{
                                            color: '#ffd700',
                                            backgroundColor: 'rgba(255, 215, 0, 0.1)',
                                            border: '1px solid #ffd700',
                                            borderRadius: 0,
                                            padding: '2px',
                                            position: 'absolute',
                                            top: '4px',
                                            right: '4px',
                                            minWidth: '16px',
                                            height: '16px',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 215, 0, 0.2)',
                                            }
                                        }}
                                    >
                                        <Visibility sx={{ fontSize: '0.6rem' }} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    )}
                </Box>
            </div>

            {/* Mastery Targets Modal */}
            <Dialog 
                open={masteryModalOpen} 
                onClose={() => setMasteryModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        background: 'linear-gradient(145deg, #2a2a4a 0%, #1a1a2e 100%)',
                        border: '2px solid #4a4a6a',
                        borderRadius: 0,
                        boxShadow: '0 0 0 2px #000, 0 8px 0 0 #3a3a5a',
                        fontFamily: 'Press Start 2P, monospace'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    color: '#ffd700', 
                    textAlign: 'center',
                    textShadow: '2px 2px 0px #000',
                    borderBottom: '1px solid #4a4a6a',
                    padding: '16px'
                }}>
                    🎯 {t(`skills.${selectedAttackType}`)} Mastery Targets
                </DialogTitle>
                <DialogContent sx={{ padding: '16px' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {masteryLevels.map((masteryLevel) => {
                            const isCompleted = level >= masteryLevel;
                            const buffDescription = skillBuffs[masteryLevel];
                            
                            return (
                                <Box key={masteryLevel} sx={{ 
                                    border: `1px solid ${isCompleted ? '#22c55e' : '#6a6a8a'}`,
                                    borderRadius: 0,
                                    padding: '8px',
                                    background: isCompleted ? 'rgba(34, 197, 94, 0.1)' : 'rgba(106, 106, 138, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    {isCompleted && (
                                        <AutoAwesome sx={{ 
                                            color: '#22c55e', 
                                            fontSize: '1rem' 
                                        }} />
                                    )}
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" sx={{ 
                                            color: isCompleted ? '#22c55e' : '#e0e0e0',
                                            fontSize: '0.6rem',
                                            fontWeight: 'bold',
                                            textShadow: '1px 1px 0px #000',
                                            marginBottom: '2px'
                                        }}>
                                            Level {masteryLevel}
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                            color: isCompleted ? '#22c55e' : '#a0a0a0',
                                            fontSize: '0.5rem',
                                            textShadow: '1px 1px 0px #000'
                                        }}>
                                            {buffDescription}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ 
                    padding: '16px',
                    borderTop: '1px solid #4a4a6a'
                }}>
                    <Button 
                        onClick={() => setMasteryModalOpen(false)}
                        sx={{
                            color: '#e0e0e0',
                            backgroundColor: '#4a4a6a',
                            border: '1px solid #6a6a8a',
                            borderRadius: 0,
                            '&:hover': {
                                backgroundColor: '#5a5a7a',
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SkillExpWidget; 