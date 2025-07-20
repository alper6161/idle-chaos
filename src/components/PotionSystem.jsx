import React, { useState } from 'react';
import { Typography, Button, Chip, Box, Slider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { LocalDrink, Settings } from '@mui/icons-material';
import { useTranslate } from '../hooks/useTranslate';
import { POTION_TYPES, saveAutoPotionSettings } from '../utils/potions.js';
import { SYSTEM_COLORS } from '../utils/common.js';
import styles from '../assets/styles/Battle.module.scss';

const PotionSystem = ({
    currentBattle,
    potions,
    autoPotionSettings,
    lastPotionUsed,
    onUsePotion,
    onAutoPotionSettingsChange
}) => {
    const { t } = useTranslate();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [tempThreshold, setTempThreshold] = useState(autoPotionSettings.threshold);

    if (!currentBattle) return null;

    const handleToggleAutoPotion = () => {
        const newSettings = {
            ...autoPotionSettings,
            enabled: !autoPotionSettings.enabled
        };
        saveAutoPotionSettings(newSettings);
        onAutoPotionSettingsChange(newSettings);
    };

    const handleSaveSettings = () => {
        const newSettings = {
            ...autoPotionSettings,
            threshold: tempThreshold
        };
        saveAutoPotionSettings(newSettings);
        onAutoPotionSettingsChange(newSettings);
        setSettingsOpen(false);
    };

    return (
        <>
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                <Chip 
                    label={`${autoPotionSettings.enabled ? t('potions.autoOn') : t('potions.autoOff')} (${autoPotionSettings.threshold}%)`}
                    color={autoPotionSettings.enabled ? "success" : "default"}
                    size="small"
                    className={styles.autoPotionChipCompact}
                    onClick={handleToggleAutoPotion}
                    sx={{
                        backgroundColor: autoPotionSettings.enabled ? undefined : SYSTEM_COLORS.TEXT.PRIMARY,
                        color: autoPotionSettings.enabled ? undefined : SYSTEM_COLORS.BACKGROUND.PRIMARY,
                        cursor: 'pointer',
                        '& .MuiChip-label': {
                            color: autoPotionSettings.enabled ? undefined : SYSTEM_COLORS.BACKGROUND.PRIMARY
                        }
                    }}
                />
                <Button
                    size="small"
                    onClick={() => setSettingsOpen(true)}
                    sx={{
                        minWidth: 'auto',
                        padding: '2px',
                        color: SYSTEM_COLORS.TEXT.PRIMARY,
                        fontSize: '0.6rem'
                    }}
                >
                    <Settings sx={{ fontSize: '0.6rem' }} />
                </Button>
            </Box>
        </div>
        
        {/* Auto Potion Settings Dialog */}
        <Dialog 
            open={settingsOpen} 
            onClose={() => setSettingsOpen(false)}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ 
                backgroundColor: SYSTEM_COLORS.BACKGROUND.PRIMARY,
                color: SYSTEM_COLORS.TEXT.PRIMARY,
                fontFamily: '"Press Start 2P", monospace'
            }}>
                Auto Potion Settings
            </DialogTitle>
            <DialogContent sx={{ 
                backgroundColor: SYSTEM_COLORS.BACKGROUND.SECONDARY,
                padding: '1rem'
            }}>
                <Typography variant="body2" sx={{ 
                    color: SYSTEM_COLORS.TEXT.PRIMARY,
                    marginBottom: '1rem',
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '0.8rem'
                }}>
                    HP Threshold: {tempThreshold}%
                </Typography>
                <Slider
                    value={tempThreshold}
                    onChange={(e, newValue) => setTempThreshold(newValue)}
                    min={10}
                    max={90}
                    step={5}
                    marks={[
                        { value: 10, label: '10%' },
                        { value: 30, label: '30%' },
                        { value: 50, label: '50%' },
                        { value: 70, label: '70%' },
                        { value: 90, label: '90%' }
                    ]}
                    sx={{
                        color: SYSTEM_COLORS.TEXT.SUCCESS,
                        '& .MuiSlider-mark': {
                            backgroundColor: SYSTEM_COLORS.TEXT.PRIMARY
                        },
                        '& .MuiSlider-markLabel': {
                            color: SYSTEM_COLORS.TEXT.PRIMARY,
                            fontFamily: '"Press Start 2P", monospace',
                            fontSize: '0.6rem'
                        }
                    }}
                />
                <Typography variant="caption" sx={{ 
                    color: SYSTEM_COLORS.TEXT.SECONDARY,
                    display: 'block',
                    marginTop: '1rem',
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '0.6rem'
                }}>
                    Auto potion will use the cheapest potion first when HP drops below this threshold.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ 
                backgroundColor: SYSTEM_COLORS.BACKGROUND.PRIMARY,
                padding: '1rem'
            }}>
                <Button 
                    onClick={() => setSettingsOpen(false)}
                    sx={{ 
                        color: SYSTEM_COLORS.TEXT.PRIMARY,
                        fontFamily: '"Press Start 2P", monospace'
                    }}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleSaveSettings}
                    variant="contained"
                    sx={{ 
                        backgroundColor: SYSTEM_COLORS.TEXT.SUCCESS,
                        color: SYSTEM_COLORS.BACKGROUND.PRIMARY,
                        fontFamily: '"Press Start 2P", monospace',
                        '&:hover': {
                            backgroundColor: SYSTEM_COLORS.TEXT.SUCCESS
                        }
                    }}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
        </>
    );
};

export default PotionSystem; 