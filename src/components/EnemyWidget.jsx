import React from 'react';
import { Avatar, Typography, LinearProgress } from '@mui/material';
import { getEnemyIcon, getEnemyInitial } from '../utils/common.js';
import styles from '../assets/styles/Battle.module.scss';

const EnemyWidget = ({
    currentEnemy,
    currentBattle,
    damageDisplay,
    spawnTimerUI,
    getStatDisplayWithAchievement,
    getEnemyHpDisplayWithAchievement
}) => {
    return (
        <div className={styles.fighter}>
            {spawnTimerUI ? (
                spawnTimerUI
            ) : (
                <>
                    <Avatar 
                        src={getEnemyIcon(currentEnemy?.id)} 
                        className={styles.avatar}
                        onError={(e) => {
                            if (e.target && e.target.nextSibling) {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }
                        }}
                    />
                    <div 
                        className={styles.avatarFallback}
                        style={{ display: 'none' }}
                    >
                        {getEnemyInitial(currentEnemy?.name)}
                    </div>
                    <Typography variant="h6">{currentEnemy?.name}</Typography>
                    {damageDisplay.enemy && (
                        <div 
                            className={`${styles.damageDisplay} ${
                                damageDisplay.enemy === 'MISS' ? styles.missDisplay : 
                                damageDisplay.enemyType === 'crit' ? styles.playerCritDamage : styles.playerDamage
                            }`}
                        >
                            {damageDisplay.enemy}
                        </div>
                    )}
                    <div className={styles.hpBarContainer}>
                        <Typography 
                            className={`${styles.hpText} ${
                                getStatDisplayWithAchievement(currentEnemy?.id, 'hp', currentEnemy?.maxHp) === "" ? styles.hiddenStat : styles.revealedStat
                            }`}
                        >
                            HP: {getEnemyHpDisplayWithAchievement(currentEnemy?.id, currentBattle?.enemy?.currentHealth || 0, currentBattle?.enemy?.maxHealth || currentBattle?.enemy?.maxHp || currentEnemy?.maxHp)}
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={currentBattle ? (getStatDisplayWithAchievement(currentEnemy?.id, 'hp', currentBattle.enemy.maxHealth || currentBattle.enemy.maxHp) === "" ? 100 : (currentBattle.enemy.currentHealth / (currentBattle.enemy.maxHealth || currentBattle.enemy.maxHp)) * 100) : 100}
                            className={`${styles.progress} ${styles.enemyHpBar}`}
                        />
                    </div>
                    <div className={styles.attackBarContainer}>
                        <LinearProgress
                            variant="determinate"
                            value={currentBattle?.enemyProgress || 0}
                            className={`${styles.progress} ${styles.attackBar}`}
                            sx={{ height: '15px', borderRadius: '8px' }}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default EnemyWidget; 