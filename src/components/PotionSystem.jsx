import React from 'react';
import { Typography, Button, Chip, Box } from '@mui/material';
import { LocalDrink } from '@mui/icons-material';
import { useTranslate } from '../hooks/useTranslate';
import { POTION_TYPES } from '../utils/potions.js';
import { SYSTEM_COLORS } from '../utils/common.js';
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
        <div className={styles.potionSectionMini}>
            <div className={styles.potionHeaderCompact}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <LocalDrink sx={{ fontSize: '0.8rem', color: SYSTEM_COLORS.TEXT.PRIMARY }} />
                    <Typography variant="caption" className={styles.potionTitleCompact}>
                        {t('potions.healthPotions')}
                    </Typography>
                </Box>
            </div>
            <div className={styles.potionGridMini}>
                {Object.entries(POTION_TYPES).map(([key, potion]) => {
                    const count = potions[potion.id] || 0;
                    const canUse = count > 0 && currentBattle.player.currentHealth < currentBattle.player.HEALTH;
                    return (
                        <Button
                            key={potion.id}
                            variant="contained"
                            className={styles.potionButtonMini}
                            disabled={!canUse}
                            onClick={() => onUsePotion(potion.id)}
                            style={{
                                backgroundColor: potion.color,
                                border: lastPotionUsed?.type === potion.id ? '2px solid #ffd700' : 'none',
                                boxShadow: lastPotionUsed?.type === potion.id ? '0 0 10px #ffd700' : 'none'
                            }}
                        >
                            <div className={styles.potionContentMini}>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        fontSize: '0.9rem', 
                                        fontWeight: 'bold',
                                        color: '#ffffff',
                                        textShadow: '1px 1px 0px #000',
                                        fontFamily: '"Press Start 2P", monospace'
                                    }}
                                >
                                    +{potion.healAmount}
                                </Typography>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        fontSize: '0.4rem',
                                        color: '#ffffff',
                                        textShadow: '1px 1px 0px #000',
                                        fontFamily: '"Press Start 2P", monospace',
                                        background: 'rgba(0, 0, 0, 0.5)',
                                        padding: '0.02rem 0.1rem',
                                        borderRadius: 0,
                                        border: '1px solid #ffffff'
                                    }}
                                >
                                    {count}
                                </Typography>
                            </div>
                        </Button>
                    );
                })}
            </div>
            {lastPotionUsed && (
                <div className={styles.potionEffectCompact}>
                    <Typography variant="caption" className={styles.healTextCompact}>
                        +{lastPotionUsed.healAmount} HP
                    </Typography>
                </div>
            )}
            <Chip 
                label={autoPotionSettings.enabled ? t('potions.autoOn') : t('potions.autoOff')}
                color={autoPotionSettings.enabled ? "success" : "default"}
                size="small"
                className={styles.autoPotionChipCompact}
                sx={{
                    backgroundColor: autoPotionSettings.enabled ? undefined : SYSTEM_COLORS.TEXT.PRIMARY,
                    color: autoPotionSettings.enabled ? undefined : SYSTEM_COLORS.BACKGROUND.PRIMARY,
                    '& .MuiChip-label': {
                        color: autoPotionSettings.enabled ? undefined : SYSTEM_COLORS.BACKGROUND.PRIMARY
                    }
                }}
            />
        </div>
    );
};

export default PotionSystem; 