import React from 'react';
import { Typography, Button, Chip } from '@mui/material';
import { LocalDrink } from '@mui/icons-material';
import { useTranslate } from '../hooks/useTranslate';
import { POTION_TYPES } from '../utils/potions.js';
import styles from '../assets/styles/Battle.module.scss';

const PotionSystem = ({
    currentBattle,
    potions,
    autoPotionSettings,
    lastPotionUsed,
    onUsePotion
}) => {
    const { t } = useTranslate();

    if (!currentBattle) return null;

    return (
        <div className={styles.potionSection}>
            <div className={styles.potionHeader}>
                <Typography variant="h6" className={styles.potionTitle}>
                    <LocalDrink /> {t('potions.healthPotions')}
                </Typography>
                <Chip 
                    label={autoPotionSettings.enabled ? t('potions.autoOn') : t('potions.autoOff')}
                    color={autoPotionSettings.enabled ? "success" : "default"}
                    size="small"
                    className={styles.autoPotionChip}
                />
            </div>
            <div className={styles.potionGrid}>
                {Object.entries(POTION_TYPES).map(([key, potion]) => {
                    const count = potions[potion.id] || 0;
                    const canUse = count > 0 && currentBattle.player.currentHealth < currentBattle.player.HEALTH;
                    return (
                        <Button
                            key={potion.id}
                            variant="contained"
                            className={styles.potionButton}
                            disabled={!canUse}
                            onClick={() => onUsePotion(potion.id)}
                            style={{
                                backgroundColor: potion.color,
                                border: lastPotionUsed?.type === potion.id ? '3px solid #ffd700' : 'none',
                                boxShadow: lastPotionUsed?.type === potion.id ? '0 0 15px #ffd700' : 'none'
                            }}
                        >
                            <div className={styles.potionContent}>
                                <Typography variant="caption" className={styles.potionName}>
                                    {t(`potions.${potion.id}HealthPotion`)}
                                </Typography>
                                <Typography variant="body2" className={styles.potionHeal}>
                                    +{potion.healAmount}
                                </Typography>
                                <Typography variant="caption" className={styles.potionCount}>
                                    {count}
                                </Typography>
                            </div>
                        </Button>
                    );
                })}
            </div>
            {lastPotionUsed && (
                <div className={styles.potionEffect}>
                    <Typography variant="h4" className={styles.healText}>
                        +{lastPotionUsed.healAmount} HP
                    </Typography>
                </div>
            )}
        </div>
    );
};

export default PotionSystem; 