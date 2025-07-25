import React, { useMemo } from 'react';
import { Typography, Divider, Box } from '@mui/material';
import { useTranslate } from '../hooks/useTranslate';
import { calculateDamageRange } from '../utils/battleUtils.jsx';
import { getDifficultyColor, getDifficultyText } from '../utils/battleUtils.jsx';
import { calculateAccuracy } from '../utils/battleUtils.jsx';
import styles from '../assets/styles/Battle.module.scss';

const EnemyStats = ({
    currentEnemy,
    currentBattle,
    playerStats,
    getStatDisplayWithAchievement,
    getEnemyHpDisplayWithAchievement
}) => {
    const { t } = useTranslate();

    // Calculate enemy stats for battle
    const enemyStats = useMemo(() => {
        if (!currentEnemy) return null;
        
        if (currentBattle) {
            return {
                ATK: currentBattle.enemy.ATK,
                DEF: currentBattle.enemy.DEF,
                HEALTH: currentBattle.enemy.HEALTH,
                ATTACK_SPEED: currentBattle.enemy.ATTACK_SPEED,
                CRIT_CHANCE: currentBattle.enemy.CRIT_CHANCE || 3,
                CRIT_DAMAGE: currentBattle.enemy.CRIT_DAMAGE || 120,
                currentHealth: currentBattle.enemy.currentHealth
            };
        } else {
            return {
                ATK: currentEnemy.ATK,
                DEF: currentEnemy.DEF,
                HEALTH: currentEnemy.HEALTH,
                ATTACK_SPEED: currentEnemy.ATTACK_SPEED,
                CRIT_CHANCE: currentEnemy.CRIT_CHANCE || 3,
                CRIT_DAMAGE: currentEnemy.CRIT_DAMAGE || 120,
                currentHealth: currentEnemy.HEALTH
            };
        }
    }, [currentEnemy, currentBattle]);

    // Calculate damage ranges against player
    const damageRanges = useMemo(() => {
        if (!enemyStats || !playerStats) return null;
        
        const damageRange = calculateDamageRange(enemyStats.ATK, playerStats.DEF);
        const critDamageRange = {
            min: Math.floor(damageRange.min * (enemyStats.CRIT_DAMAGE / 100)),
            max: Math.floor(damageRange.max * (enemyStats.CRIT_DAMAGE / 100))
        };
        
        return { damageRange, critDamageRange };
    }, [enemyStats, playerStats]);

    // Calculate hit chance against player
    const hitChance = useMemo(() => {
        if (!enemyStats || !playerStats) return null;
        // Yeni: calculateAccuracy fonksiyonu ile hesapla
        return calculateAccuracy(enemyStats.ATK, playerStats.DEF, null);
    }, [enemyStats, playerStats]);

    if (!currentEnemy || !enemyStats) {
        return (
            <div className={styles.section} style={{ flex: 1 }}>
                <Typography variant="h6">{t('battle.enemyStats')}</Typography>
                <Divider />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Typography variant="body2" color="textSecondary">
                        {t('battle.noEnemy')}
                    </Typography>
                </Box>
            </div>
        );
    }

    return (
        <div className={styles.section} style={{ flex: 1 }}>
            <Typography variant="h6">{t('battle.enemyStats')}</Typography>
            <Divider />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* Enemy Name and Difficulty */}
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: getDifficultyColor(currentEnemy) }}>
                    {currentEnemy.name} ({getDifficultyText(currentEnemy)})
                </Typography>

                {/* Attack */}
                <Typography>
                    ⚔️ {t('battle.attack')}: {getStatDisplayWithAchievement ? 
                        (getStatDisplayWithAchievement(currentEnemy.id, 'atk', enemyStats.ATK) || '???') : 
                        (enemyStats.ATK !== undefined && enemyStats.ATK !== null ? enemyStats.ATK.toFixed(1) : '-')}
                </Typography>

                {/* Defense */}
                <Typography>
                    🛡️ {t('battle.defense')}: {getStatDisplayWithAchievement ? 
                        (getStatDisplayWithAchievement(currentEnemy.id, 'def', enemyStats.DEF) || '???') : 
                        (enemyStats.DEF !== undefined && enemyStats.DEF !== null ? enemyStats.DEF.toFixed(1) : '-')}
                </Typography>

                {/* Health */}
                <Typography>
                    ❤️ {t('battle.health')}: {getEnemyHpDisplayWithAchievement ? 
                        getEnemyHpDisplayWithAchievement(currentEnemy.id, enemyStats.currentHealth, enemyStats.HEALTH) : 
                        `${enemyStats.currentHealth !== undefined && enemyStats.currentHealth !== null ? enemyStats.currentHealth : '-'}/${enemyStats.HEALTH !== undefined && enemyStats.HEALTH !== null ? enemyStats.HEALTH.toFixed(0) : '-'}`}
                </Typography>

                {/* Attack Speed */}
                <Typography>
                    ⚡ {t('battle.attackSpeed')}: {getStatDisplayWithAchievement ? 
                        (getStatDisplayWithAchievement(currentEnemy.id, 'attack_speed', enemyStats.ATTACK_SPEED) || '???') : 
                        (enemyStats.ATTACK_SPEED !== undefined && enemyStats.ATTACK_SPEED !== null ? enemyStats.ATTACK_SPEED.toFixed(1) : '-')}
                </Typography>

                {/* Critical Chance */}
                <Typography>
                    🎯 {t('battle.criticalChance')}: {getStatDisplayWithAchievement ? 
                        (getStatDisplayWithAchievement(currentEnemy.id, 'crit_chance', enemyStats.CRIT_CHANCE) || '???') : 
                        (enemyStats.CRIT_CHANCE !== undefined && enemyStats.CRIT_CHANCE !== null ? enemyStats.CRIT_CHANCE.toFixed(1) : '-')}%
                </Typography>

                {/* Critical Damage */}
                <Typography>
                    💥 {t('battle.criticalDamage')}: {getStatDisplayWithAchievement ? 
                        (getStatDisplayWithAchievement(currentEnemy.id, 'crit_damage', enemyStats.CRIT_DAMAGE) || '???') : 
                        (enemyStats.CRIT_DAMAGE !== undefined && enemyStats.CRIT_DAMAGE !== null ? enemyStats.CRIT_DAMAGE.toFixed(1) : '-')}%
                </Typography>

                {/* Battle-specific stats */}
                {currentBattle && playerStats && (
                    <>
                        <Divider sx={{ my: 1 }} />
                        
                        {/* Hit Chance */}
                        {hitChance !== null && (
                            <Typography>
                                🎲 {t('battle.hitChance')}: {hitChance}%
                            </Typography>
                        )}

                        {/* Damage Ranges */}
                        {damageRanges && (
                            <>
                                <Typography>
                                    ⚔️ {t('battle.baseDamage')}: {damageRanges.damageRange.min}-{damageRanges.damageRange.max}
                                </Typography>
                                <Typography>
                                    💥 {t('battle.critDamage')}: {damageRanges.critDamageRange.min}-{damageRanges.critDamageRange.max}
                                </Typography>
                            </>
                        )}
                    </>
                )}
            </Box>
        </div>
    );
};

export default EnemyStats; 