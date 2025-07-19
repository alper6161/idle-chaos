import React, { useMemo } from 'react';
import { Typography, Divider, Box } from '@mui/material';
import { useTranslate } from '../hooks/useTranslate';
import { calculateHitChance, calculateDamageRange } from '../utils/battleUtils';
import { calculateSkillBuffsForAttackType, getEquipmentBonuses } from '../utils/playerStats.js';
import styles from '../assets/styles/Battle.module.scss';

const PlayerStats = ({
    currentBattle,
    currentEnemy,
    playerStats,
    playerHealth,
    selectedAttackType,
    getSelectedSkillInfo
}) => {
    const { t } = useTranslate();

    // Memoize effective stats with skill buffs
    const effectiveStats = useMemo(() => {
        const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
        const equipmentBonuses = getEquipmentBonuses();
        
        if (currentBattle) {
            return {
                ATK: currentBattle.player.ATK + (skillBuffs.ATK || 0),
                DEF: currentBattle.player.DEF + (skillBuffs.DEF || 0),
                HEALTH: currentBattle.player.HEALTH + (skillBuffs.HEALTH || 0),
                ATTACK_SPEED: currentBattle.player.ATTACK_SPEED + (skillBuffs.ATTACK_SPEED || 0),
                CRIT_CHANCE: (currentBattle.player.CRIT_CHANCE || 5) + (skillBuffs.CRIT_CHANCE || 0),
                CRIT_DAMAGE: (currentBattle.player.CRIT_DAMAGE || 150) + (skillBuffs.CRIT_DAMAGE || 0),
                skillBuffs,
                equipmentBonuses
            };
        } else {
            return {
                ATK: playerStats.ATK + (skillBuffs.ATK || 0),
                DEF: playerStats.DEF + (skillBuffs.DEF || 0),
                HEALTH: playerStats.HEALTH + (skillBuffs.HEALTH || 0),
                ATTACK_SPEED: playerStats.ATTACK_SPEED + (skillBuffs.ATTACK_SPEED || 0),
                CRIT_CHANCE: playerStats.CRIT_CHANCE + (skillBuffs.CRIT_CHANCE || 0),
                CRIT_DAMAGE: playerStats.CRIT_DAMAGE + (skillBuffs.CRIT_DAMAGE || 0),
                skillBuffs,
                equipmentBonuses
            };
        }
    }, [currentBattle, playerStats, selectedAttackType]);

    // Calculate damage ranges
    const damageRanges = useMemo(() => {
        if (!currentBattle || !currentEnemy) return null;
        
        const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
        const atkBonus = skillBuffs.ATK || 0;
        const effectiveATK = currentBattle.player.ATK + atkBonus;
        const damageRangeBonus = skillBuffs ? skillBuffs.MIN_DAMAGE.toFixed(1) + ' - ' + skillBuffs.MAX_DAMAGE.toFixed(1) : 0;
        const damageRange = calculateDamageRange(effectiveATK, currentBattle.enemy.DEF, damageRangeBonus);
        const totalCritDamage = (currentBattle.player.CRIT_DAMAGE || 150) + (skillBuffs.CRIT_DAMAGE || 0);
        const critDamageRange = {
            min: Math.floor(damageRange.min * (totalCritDamage / 100)),
            max: Math.floor(damageRange.max * (totalCritDamage / 100))
        };
        
        return { damageRange, critDamageRange, damageRangeBonus };
    }, [currentBattle, currentEnemy, selectedAttackType]);

    // Calculate hit chance
    const hitChance = useMemo(() => {
        if (!currentBattle || !currentEnemy) return null;
        
        const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
        const accuracyBonus = skillBuffs.ACCURACY_BONUS || 0;
        const atkBonus = skillBuffs.ATK || 0;
        const effectiveATK = currentBattle.player.ATK + atkBonus;
        return calculateHitChance(effectiveATK, currentBattle.enemy.DEF, accuracyBonus);
    }, [currentBattle, currentEnemy, selectedAttackType]);

    return (
        <div className={styles.section} style={{ flex: 1 }}>
            <Typography variant="h6">{t('battle.playerStats')}</Typography>
            <Divider />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* Attack */}
                <Typography>
                    ⚔️ {t('battle.attack')}: {effectiveStats.ATK.toFixed(1)}
                    {effectiveStats.equipmentBonuses.ATK && <span className={styles.equipmentBonus}>(+{effectiveStats.equipmentBonuses.ATK})</span>}
                    {effectiveStats.skillBuffs.ATK > 0 && <span className={styles.skillBonus}> (+{effectiveStats.skillBuffs.ATK.toFixed(1)})</span>}
                </Typography>

                {/* Defense */}
                <Typography>
                    🛡️ {t('battle.defense')}: {effectiveStats.DEF.toFixed(1)}
                    {effectiveStats.equipmentBonuses.DEF && <span className={styles.equipmentBonus}>(+{effectiveStats.equipmentBonuses.DEF})</span>}
                    {effectiveStats.skillBuffs.DEF > 0 && <span className={styles.skillBonus}> (+{effectiveStats.skillBuffs.DEF.toFixed(1)})</span>}
                </Typography>

                {/* Health */}
                <Typography>
                    ❤️ {t('battle.health')}: {currentBattle ? currentBattle.player.currentHealth : playerHealth}/{effectiveStats.HEALTH.toFixed(0)}
                    {effectiveStats.equipmentBonuses.HEALTH && <span className={styles.equipmentBonus}>(+{effectiveStats.equipmentBonuses.HEALTH})</span>}
                    {effectiveStats.skillBuffs.HEALTH > 0 && <span className={styles.skillBonus}> (+{effectiveStats.skillBuffs.HEALTH.toFixed(0)} max)</span>}
                </Typography>

                {/* Attack Speed */}
                <Typography>
                    ⚡ {t('battle.attackSpeed')}: {effectiveStats.ATTACK_SPEED.toFixed(1)}
                    {effectiveStats.equipmentBonuses.ATTACK_SPEED && <span className={styles.equipmentBonus}>(+{effectiveStats.equipmentBonuses.ATTACK_SPEED})</span>}
                    {effectiveStats.skillBuffs.ATTACK_SPEED > 0 && <span className={styles.skillBonus}> (+{effectiveStats.skillBuffs.ATTACK_SPEED.toFixed(2)})</span>}
                </Typography>

                {/* Critical Chance */}
                <Typography>
                    🎯 {t('battle.criticalChance')}: {effectiveStats.CRIT_CHANCE.toFixed(1)}%
                    {effectiveStats.equipmentBonuses.CRIT_CHANCE && <span className={styles.equipmentBonus}>(+{effectiveStats.equipmentBonuses.CRIT_CHANCE}%)</span>}
                    {effectiveStats.skillBuffs.CRIT_CHANCE > 0 && <span className={styles.skillBonus}> (+{effectiveStats.skillBuffs.CRIT_CHANCE.toFixed(1)}%)</span>}
                </Typography>

                {/* Critical Damage */}
                <Typography>
                    💥 {t('battle.criticalDamage')}: {effectiveStats.CRIT_DAMAGE.toFixed(1)}%
                    {effectiveStats.equipmentBonuses.CRIT_DAMAGE && <span className={styles.equipmentBonus}>(+{effectiveStats.equipmentBonuses.CRIT_DAMAGE}%)</span>}
                    {effectiveStats.skillBuffs.CRIT_DAMAGE > 0 && <span className={styles.skillBonus}> (+{effectiveStats.skillBuffs.CRIT_DAMAGE.toFixed(1)}%)</span>}
                </Typography>

                {/* Battle-specific stats */}
                {currentBattle && currentEnemy && (
                    <>
                        <Divider sx={{ my: 1 }} />
                        
                        {/* Hit Chance */}
                        {hitChance !== null && (
                            <Typography>
                                🎲 {t('battle.hitChance')}: {hitChance}%
                                {effectiveStats.skillBuffs.ACCURACY_BONUS > 0 && <span className={styles.skillBonus}> (+{effectiveStats.skillBuffs.ACCURACY_BONUS.toFixed(1)}%)</span>}
                            </Typography>
                        )}

                        {/* Damage Ranges */}
                        {damageRanges && (
                            <>
                                <Typography>
                                    ⚔️ {t('battle.baseDamage')}: {damageRanges.damageRange.min}-{damageRanges.damageRange.max}
                                    {damageRanges.damageRangeBonus && <span className={styles.skillBonus}> ({damageRanges.damageRangeBonus})</span>}
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

export default PlayerStats; 