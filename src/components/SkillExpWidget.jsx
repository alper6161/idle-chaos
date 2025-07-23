import React from 'react';
import { Typography, LinearProgress, Box } from '@mui/material';
import { useTranslate } from '../hooks/useTranslate';
import { getSkillInfo } from '../utils/skillExperience.js';
import { calculateSkillBuffsForAttackType } from '../utils/playerStats.js';
import styles from '../assets/styles/Battle.module.scss';

const SkillExpWidget = ({ selectedAttackType }) => {
    const { t } = useTranslate();
    
    if (!selectedAttackType) {
        return null;
    }

    const skillInfo = getSkillInfo(selectedAttackType);
    const { level, xp, xpToNext } = skillInfo;
    
    // Get total accumulated bonuses using existing system
    const totalAccumulatedBonuses = calculateSkillBuffsForAttackType(selectedAttackType);
    
    // Calculate progress percentage
    const currentLevelXP = level > 1 ? (level - 1) * 50 + ((level - 1) * (level - 2) * 25) / 2 : 0;
    const nextLevelXP = level * 50 + (level * (level - 1) * 25) / 2;
    const progressPercentage = nextLevelXP > currentLevelXP ? 
        ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100 : 0;

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

    return (
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
                    
                    <LinearProgress
                        variant="determinate"
                        value={Math.min(100, progressPercentage)}
                        sx={{
                            height: '12px',
                            borderRadius: 0,
                            backgroundColor: '#1a1a2e',
                            border: '2px solid #4a4a6a',
                            '& .MuiLinearProgress-bar': {
                                background: 'linear-gradient(90deg, #4ecdc4 0%, #44a08d 100%)',
                                borderRadius: 0,
                                boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.3)'
                            }
                        }}
                    />
                </Box>

                {/* Total Accumulated Bonuses */}
                {Object.keys(totalAccumulatedBonuses).length > 0 && (
                    <Box sx={{ 
                        border: '1px solid #4ecdc4', 
                        borderRadius: 0, 
                        padding: '6px',
                        background: 'rgba(78, 205, 196, 0.1)',
                        marginBottom: '6px'
                    }}>
                        <Typography variant="body2" sx={{ 
                            color: '#4ecdc4', 
                            fontSize: '0.5rem', 
                            textAlign: 'center',
                            marginBottom: '4px',
                            textShadow: '1px 1px 0px #000',
                            fontWeight: 'bold'
                        }}>
                            Total Bonuses (Lv.{level}):
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
                )}

                {/* Next Level Info */}
                <Box sx={{ 
                    border: '1px solid #ff6b6b', 
                    borderRadius: 0, 
                    padding: '6px',
                    background: 'rgba(255, 107, 107, 0.1)'
                }}>
                    <Typography variant="body2" sx={{ 
                        color: '#ff6b6b', 
                        fontSize: '0.5rem', 
                        textAlign: 'center',
                        marginBottom: '4px',
                        textShadow: '1px 1px 0px #000',
                        fontWeight: 'bold'
                    }}>
                        Next Level (Lv.{level + 1}):
                    </Typography>
                    <Typography variant="body2" sx={{ 
                        color: '#e0e0e0', 
                        fontSize: '0.45rem', 
                        textAlign: 'center',
                        textShadow: '1px 1px 0px #000'
                    }}>
                        XP Needed: {xpToNext}
                    </Typography>
                </Box>
            </Box>
        </div>
    );
};

export default SkillExpWidget; 