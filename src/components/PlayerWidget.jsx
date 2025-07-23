import React from 'react';
import { Avatar, Typography, LinearProgress, Button, Tooltip } from '@mui/material';
import { useTranslate } from '../hooks/useTranslate';
import { getCharacterIcon, getCharacterName } from '../utils/common.js';
import styles from '../assets/styles/Battle.module.scss';

const PlayerWidget = ({
    selectedCharacter,
    currentBattle,
    playerHealth,
    playerStats,
    damageDisplay,
    availableAttackTypes,
    selectedAttackType,
    onAttackTypeSelect
}) => {
    const { t } = useTranslate();

    return (
        <div className={styles.fighter}>
            <Avatar src={getCharacterIcon(selectedCharacter)} className={styles.avatar} />
            <Typography variant="h6">{getCharacterName(selectedCharacter)}</Typography>
            {damageDisplay.player && (
                <div 
                    className={`${styles.damageDisplay} ${
                        damageDisplay.player === 'MISS' ? styles.missDisplay : 
                        damageDisplay.playerType === 'crit' ? styles.enemyCritDamage :
                        damageDisplay.playerType === 'heal' ? styles.healDisplay : styles.enemyDamage
                    }`}
                >
                    {damageDisplay.player.amount || damageDisplay.player}
                </div>
            )}
            <div className={styles.hpBarContainer}>
                <Typography className={styles.hpText}>
                    HP: {currentBattle?.player?.currentHealth || playerHealth}/{currentBattle?.player?.HEALTH || playerStats?.HEALTH}
                </Typography>
                <LinearProgress
                    variant="determinate"
                    value={currentBattle ? (currentBattle.player.currentHealth / currentBattle.player.HEALTH) * 100 : (playerHealth / playerStats?.HEALTH) * 100}
                    className={`${styles.progress} ${styles.playerHpBar}`}
                />
            </div>
            <div className={styles.attackBarContainer}>
                <LinearProgress
                    variant="determinate"
                    value={currentBattle?.playerProgress || 0}
                    className={`${styles.progress} ${styles.attackBar}`}
                    sx={{ height: '15px', borderRadius: '8px' }}
                />
            </div>
            {currentBattle && (
                <div className={styles.attackTypeSmall}>
                    <Typography variant="caption" className={styles.attackTypeSmallTitle}>
                        🎯 {t('battle.selectAttackType')}
                    </Typography>
                    <div className={styles.attackTypeSmallGrid}>
                        {availableAttackTypes.map((attackType) => (
                            <Tooltip
                                key={attackType.type}
                                title={attackType.description}
                                arrow
                                placement="top"
                            >
                                <Button
                                    variant="text"
                                    className={`${styles.attackTypeSmallButton} ${
                                        selectedAttackType === attackType.type ? styles.attackTypeSelected : ''
                                    }`}
                                    onClick={() => onAttackTypeSelect(attackType.type)}
                                >
                                    <span className={styles.attackTypeSmallIcon}>{attackType.icon}</span>
                                </Button>
                            </Tooltip>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerWidget; 