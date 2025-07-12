import { useEffect, useState } from "react";
import styles from "../assets/styles/Battle.module.scss";
import {
    Typography,
    LinearProgress,
    Avatar,
    Divider,
    Button,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import { getLootDrop, saveLoot } from "../utils/combat.js";
import enemies from "../utils/enemies.js";
import { getEnemyIcon, getSkillIcon, getCharacterIcon, getEnemyInitial, getCharacterName } from "../utils/common.js";
import { 
    calculateHitChance, 
    calculateDamage, 
    updateBattleState, 
    processPlayerAttack, 
    processEnemyAttack, 
    checkBattleResult, 
    createSpawnTimer 
} from "../utils/battleUtils.js";
import { getPlayerStats, getEquipmentBonuses } from "../utils/playerStats.js";
import { getRandomEnemy } from "../utils/enemies.js";
import { getGold, addGold, formatGold } from "../utils/gold.js";
import { useTranslate } from "../hooks/useTranslate";



function Battle({ player }) {
    const [currentEnemy, setCurrentEnemy] = useState(enemies.GOBLIN);
    const [selectedCharacter, setSelectedCharacter] = useState('warrior');
    const [playerStats, setPlayerStats] = useState(getPlayerStats());
    const [playerHealth, setPlayerHealth] = useState(playerStats.HEALTH);
    const { t } = useTranslate();

    const [lootBag, setLootBag] = useState([]);
    const [playerGold, setPlayerGold] = useState(getGold());
    
    const [battleResult, setBattleResult] = useState(null);
    const [battleLog, setBattleLog] = useState([]);
    const [isBattleActive, setIsBattleActive] = useState(false);
    const [currentBattle, setCurrentBattle] = useState(null);
    const [damageDisplay, setDamageDisplay] = useState({ player: null, enemy: null });
    const [isWaitingForEnemy, setIsWaitingForEnemy] = useState(false);
    const [enemySpawnProgress, setEnemySpawnProgress] = useState(0);
    
    const [deathDialog, setDeathDialog] = useState({
        open: false,
        countdown: 15
    });



    const showDeathDialog = () => {
        setDeathDialog({
            open: true,
            countdown: 15
        });
        
        const countdownInterval = setInterval(() => {
            setDeathDialog(prev => {
                if (prev.countdown <= 1) {
                    clearInterval(countdownInterval);
                    respawnPlayer();
                    return { open: false, countdown: 15 };
                }
                return { ...prev, countdown: prev.countdown - 1 };
            });
        }, 1000);
    };

    const respawnPlayer = () => {
        const currentPlayerStats = getPlayerStats();
        setPlayerStats(currentPlayerStats);
        setPlayerHealth(currentPlayerStats.HEALTH);
        localStorage.setItem("playerHealth", currentPlayerStats.HEALTH.toString());
        
        const randomEnemy = getRandomEnemy();
        setCurrentEnemy(randomEnemy);
        startRealTimeBattle(randomEnemy, currentPlayerStats.HEALTH);
    };

    const startEnemySpawnTimer = () => {
        createSpawnTimer(
            setIsWaitingForEnemy, 
            setEnemySpawnProgress, 
            spawnNewEnemy
        );
    };
    
    const spawnNewEnemy = () => {
        const randomEnemy = getRandomEnemy();
        setCurrentEnemy(randomEnemy);
        setBattleResult(null);
        setCurrentBattle(null);
        
        const savedHealth = localStorage.getItem("playerHealth");
        const currentPlayerStats = getPlayerStats();
        const currentHealth = savedHealth ? parseInt(savedHealth) : currentPlayerStats.HEALTH;
        
        setTimeout(() => {
            startRealTimeBattle(randomEnemy, currentHealth);
        }, 0);
    };

    const startRealTimeBattle = (enemy = currentEnemy, health = playerHealth) => {
        const currentPlayerStats = getPlayerStats();
        setPlayerStats(currentPlayerStats);
        setCurrentBattle({
            player: { ...currentPlayerStats, currentHealth: health },
            enemy: { ...enemy, currentHealth: enemy.maxHp },
            playerProgress: 0,
            enemyProgress: 0,
            battleLog: []
        });
        setIsBattleActive(true);
        setBattleResult(null);
        setDamageDisplay({ player: null, enemy: null });
    };

    useEffect(() => {
        const savedCharacter = localStorage.getItem("selectedCharacter");
        if (savedCharacter) {
            setSelectedCharacter(savedCharacter);
        }
        
        const currentPlayerStats = getPlayerStats();
        setPlayerStats(currentPlayerStats);
        
        const savedHealth = localStorage.getItem("playerHealth");
        if (savedHealth) {
            const healthValue = parseInt(savedHealth);
            if (healthValue < currentPlayerStats.HEALTH) {
                setPlayerHealth(currentPlayerStats.HEALTH);
                localStorage.setItem("playerHealth", currentPlayerStats.HEALTH.toString());
            } else {
                setPlayerHealth(healthValue);
            }
        } else {
            setPlayerHealth(currentPlayerStats.HEALTH);
            localStorage.setItem("playerHealth", currentPlayerStats.HEALTH.toString());
        }
    }, []);

    useEffect(() => {
        if (!isBattleActive && !currentBattle && !battleResult) {
            const randomEnemy = getRandomEnemy();
            setCurrentEnemy(randomEnemy);
            startRealTimeBattle(randomEnemy);
        }
    }, []);

    useEffect(() => {
        const checkEquipmentChanges = () => {
            const currentPlayerStats = getPlayerStats();
            if (JSON.stringify(currentPlayerStats) !== JSON.stringify(playerStats)) {
                setPlayerStats(currentPlayerStats);
                if (currentBattle) {
                    setCurrentBattle(prev => ({
                        ...prev,
                        player: { ...currentPlayerStats, currentHealth: prev.player.currentHealth }
                    }));
                }
            }
        };

        const interval = setInterval(checkEquipmentChanges, 2000);
        
        const handleFocus = () => {
            checkEquipmentChanges();
        };
        
        window.addEventListener('focus', handleFocus);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
        };
    }, [playerStats, currentBattle]);

    useEffect(() => {
        if (!isBattleActive || !currentBattle) return;

        const interval = setInterval(() => {
            setCurrentBattle(prev => {
                if (!prev) return prev;

                const playerSpeed = Math.max(1, Math.min(5, prev.player.ATTACK_SPEED));
                const enemySpeed = Math.max(1, Math.min(5, prev.enemy.ATTACK_SPEED));
                let newBattle = updateBattleState(prev, playerSpeed, enemySpeed);

                if (newBattle.playerProgress >= 100) {
                    newBattle = processPlayerAttack(newBattle, setDamageDisplay);
                }

                if (newBattle.enemyProgress >= 100) {
                    newBattle = processEnemyAttack(newBattle, setDamageDisplay);
                }

                const battleResult = checkBattleResult(newBattle);
                if (battleResult) {
                    setIsBattleActive(false);
                    setBattleResult(battleResult);
                    
                    setPlayerHealth(battleResult.playerFinalHealth);
                    localStorage.setItem("playerHealth", battleResult.playerFinalHealth.toString());
                    
                    if (battleResult.winner === 'player') {
                        const lootResult = getLootDrop(currentEnemy.drops);
                        
                        const newLoot = [...lootResult.items];
                        
                        if (lootResult.goldItems && lootResult.goldItems.length > 0) {
                            lootResult.goldItems.forEach(goldItem => {
                                newLoot.push(`💰 ${goldItem.name} ${goldItem.value} gold'a satıldı`);
                            });
                            const newGold = addGold(lootResult.gold);
                            setPlayerGold(newGold);
                        }
                        
                        setLootBag(prev => [...prev, ...newLoot]);
                        saveLoot(lootResult.items);
                        
                        startEnemySpawnTimer();
                    } else if (battleResult.winner === 'enemy') {
                        showDeathDialog();
                    }
                    return prev;
                }

                return newBattle;
            });
        }, 200);

        return () => clearInterval(interval);
    }, [isBattleActive, currentBattle]);



    return (
        <div className={styles.battleContainer}>
            <div className={styles.fighters}>
                {/* PLAYER */}
                <div className={styles.fighter}>
                    <Avatar src={getCharacterIcon(selectedCharacter)} className={styles.avatar} />
                    <Typography variant="h6">{getCharacterName(selectedCharacter)}</Typography>
                    
                    {/* Damage Display */}
                    {damageDisplay.player && (
                        <Typography 
                            variant="h4" 
                            className={`${styles.damageDisplay} ${
                                damageDisplay.player === 'MISS' ? styles.missDisplay : 
                                damageDisplay.playerType === 'crit' ? styles.enemyCritDamage : styles.enemyDamage
                            }`}
                        >
                            {damageDisplay.player}
                        </Typography>
                    )}
                    
                    <div className={styles.hpBarContainer}>
                        <Typography className={styles.hpText}>
                            HP: {currentBattle?.player?.currentHealth || playerHealth}/{currentBattle?.player?.HEALTH || playerStats.HEALTH}
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={currentBattle ? (currentBattle.player.currentHealth / currentBattle.player.HEALTH) * 100 : 100}
                            className={`${styles.progress} ${styles.playerHpBar}`}
                        />
                    </div>
                    <div className={styles.attackBarContainer}>
                        <Typography className={styles.attackTimeText}>
                            {Math.ceil(100 / (currentBattle?.player?.ATTACK_SPEED || playerStats.ATTACK_SPEED) * 0.2)}s
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={currentBattle?.playerProgress || 0}
                            className={`${styles.progress} ${styles.attackBar}`}
                            sx={{ height: '15px', borderRadius: '8px' }}
                        />
                    </div>
                </div>

                {/* ENEMY */}
                <div className={styles.fighter}>
                    <Avatar 
                        src={getEnemyIcon(currentEnemy.id)} 
                        className={styles.avatar}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                    <div 
                        className={styles.avatarFallback}
                        style={{ display: 'none' }}
                    >
                        {getEnemyInitial(currentEnemy.name)}
                    </div>
                    <Typography variant="h6">{currentEnemy.name}</Typography>
                    
                    {/* Damage Display */}
                    {damageDisplay.enemy && (
                        <Typography 
                            variant="h4" 
                            className={`${styles.damageDisplay} ${
                                damageDisplay.enemy === 'MISS' ? styles.missDisplay : 
                                damageDisplay.enemyType === 'crit' ? styles.playerCritDamage : styles.playerDamage
                            }`}
                        >
                            {damageDisplay.enemy}
                        </Typography>
                    )}
                    
                    {/* Bekleme süresi gösterimi */}
                    {isWaitingForEnemy ? (
                        <div className={styles.enemySpawnContainer}>
                            <Typography className={styles.spawnText}>
                                Spawning Enemy...
                            </Typography>
                            <div className={styles.circularProgress}>
                                <div 
                                    className={styles.circularProgressBar}
                                    style={{ '--progress': `${enemySpawnProgress}%` }}
                                ></div>
                                <div className={styles.circularProgressText}>
                                    {Math.ceil((100 - enemySpawnProgress) / 20)}s
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                                                                            <div className={styles.hpBarContainer}>
                                <Typography className={styles.hpText}>
                                    HP: {currentBattle?.enemy?.currentHealth || currentEnemy.maxHp}/{currentBattle?.enemy?.maxHp || currentEnemy.maxHp}
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={currentBattle ? (currentBattle.enemy.currentHealth / currentBattle.enemy.maxHp) * 100 : 100}
                                    className={`${styles.progress} ${styles.enemyHpBar}`}
                                />
                            </div>
                            <div className={styles.attackBarContainer}>
                                <Typography className={styles.attackTimeText}>
                                    {Math.ceil(100 / (currentBattle?.enemy?.ATTACK_SPEED || currentEnemy.ATTACK_SPEED || 1.5) * 0.2)}s
                                </Typography>
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
            </div>



            {/* Widget Container - Yan yana düzenleme */}
            <div className={styles.widgetContainer}>
                {/* PLAYER STATS */}
                <div className={styles.section}>
                    <Typography variant="h6">{t('battle.health')}</Typography>
                    <Divider />
                    {currentBattle ? (
                        <>
                            <Typography>⚔️ {t('battle.attack')}: {currentBattle.player.ATK}</Typography>
                            <Typography>🛡️ {t('battle.defense')}: {currentBattle.player.DEF}</Typography>
                            <Typography>❤️ {t('battle.health')}: {currentBattle.player.currentHealth}/{currentBattle.player.HEALTH}</Typography>
                            <Typography>⚡ {t('battle.attackSpeed')}: {currentBattle.player.ATTACK_SPEED}</Typography>
                            <Typography>🎯 {t('battle.criticalChance')}: {currentBattle.player.CRIT_CHANCE || 5}%</Typography>
                            <Typography>💥 {t('battle.criticalDamage')}: {currentBattle.player.CRIT_DAMAGE || 150}%</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography>🎲 Hit Chance: {calculateHitChance(currentBattle.player.ATK, currentBattle.enemy.DEF)}%</Typography>
                            <Typography>⚔️ Base Damage: {calculateDamage(currentBattle.player.ATK, currentBattle.enemy.DEF)}</Typography>
                            <Typography>💥 Crit Damage: {Math.floor(calculateDamage(currentBattle.player.ATK, currentBattle.enemy.DEF) * ((currentBattle.player.CRIT_DAMAGE || 150) / 100))}</Typography>
                        </>
                    ) : (
                        <>
                            <Typography>⚔️ {t('battle.attack')}: {playerStats.ATK} {getEquipmentBonuses().ATK ? <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().ATK})</span> : ''}</Typography>
                            <Typography>🛡️ {t('battle.defense')}: {playerStats.DEF} {getEquipmentBonuses().DEF ? <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().DEF})</span> : ''}</Typography>
                            <Typography>❤️ {t('battle.health')}: {playerHealth}/{playerStats.HEALTH} {getEquipmentBonuses().HEALTH ? <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().HEALTH})</span> : ''}</Typography>
                            <Typography>⚡ {t('battle.attackSpeed')}: {playerStats.ATTACK_SPEED} {getEquipmentBonuses().ATTACK_SPEED ? <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().ATTACK_SPEED})</span> : ''}</Typography>
                            <Typography>🎯 {t('battle.criticalChance')}: {playerStats.CRIT_CHANCE}% {getEquipmentBonuses().CRIT_CHANCE ? <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().CRIT_CHANCE}%)</span> : ''}</Typography>
                            <Typography>💥 {t('battle.criticalDamage')}: {playerStats.CRIT_DAMAGE}% {getEquipmentBonuses().CRIT_DAMAGE ? <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().CRIT_DAMAGE}%)</span> : ''}</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography>🎲 Hit Chance: {calculateHitChance(playerStats.ATK, currentEnemy.DEF)}%</Typography>
                            <Typography>⚔️ Base Damage: {calculateDamage(playerStats.ATK, currentEnemy.DEF)}</Typography>
                            <Typography>💥 Crit Damage: {Math.floor(calculateDamage(playerStats.ATK, currentEnemy.DEF) * (playerStats.CRIT_DAMAGE / 100))}</Typography>
                        </>
                    )}
                </div>

                {/* ENEMY STATS */}
                <div className={styles.section}>
                    <Typography variant="h6">Enemy Stats</Typography>
                    <Divider />
                    {currentBattle ? (
                        <>
                            <Typography>⚔️ {t('battle.attack')}: {currentBattle.enemy.ATK}</Typography>
                            <Typography>🛡️ {t('battle.defense')}: {currentBattle.enemy.DEF}</Typography>
                            <Typography>❤️ {t('battle.health')}: {currentBattle.enemy.currentHealth}/{currentBattle.enemy.maxHp}</Typography>
                            <Typography>⚡ {t('battle.attackSpeed')}: {currentBattle.enemy.ATTACK_SPEED}</Typography>
                            <Typography>🎯 {t('battle.criticalChance')}: {currentBattle.enemy.CRIT_CHANCE || 3}%</Typography>
                            <Typography>💥 {t('battle.criticalDamage')}: {currentBattle.enemy.CRIT_DAMAGE || 120}%</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography>🎲 Hit Chance: {calculateHitChance(currentBattle.enemy.ATK, currentBattle.player.DEF)}%</Typography>
                            <Typography>⚔️ Base Damage: {calculateDamage(currentBattle.enemy.ATK, currentBattle.player.DEF)}</Typography>
                            <Typography>💥 Crit Damage: {Math.floor(calculateDamage(currentBattle.enemy.ATK, currentBattle.player.DEF) * ((currentBattle.enemy.CRIT_DAMAGE || 120) / 100))}</Typography>
                        </>
                    ) : (
                        <>
                            <Typography>⚔️ {t('battle.attack')}: {currentEnemy.ATK}</Typography>
                            <Typography>🛡️ {t('battle.defense')}: {currentEnemy.DEF}</Typography>
                            <Typography>❤️ {t('battle.health')}: {currentEnemy.maxHp}/{currentEnemy.maxHp}</Typography>
                            <Typography>⚡ {t('battle.attackSpeed')}: {currentEnemy.ATTACK_SPEED || 1.5}</Typography>
                            <Typography>🎯 {t('battle.criticalChance')}: 3%</Typography>
                            <Typography>💥 {t('battle.criticalDamage')}: 120%</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography>🎲 Hit Chance: {calculateHitChance(currentEnemy.ATK, playerStats.DEF)}%</Typography>
                            <Typography>⚔️ Base Damage: {calculateDamage(currentEnemy.ATK, playerStats.DEF)}</Typography>
                            <Typography>💥 Crit Damage: {Math.floor(calculateDamage(currentEnemy.ATK, playerStats.DEF) * 1.2)}</Typography>
                        </>
                    )}
                </div>

                {/* LOOT TABLE */}
                <div className={styles.section}>
                    <Typography variant="h6">Possible Loot</Typography>
                    <Divider />
                    {currentEnemy.drops.map((drop) => (
                        <Typography key={drop.name} className={drop.type === 'gold' ? styles.goldLoot : styles.equipmentLoot}>
                            {drop.name} - {(drop.chance * 100).toFixed(0)}%
                            {drop.type === 'gold' && (
                                <span className={styles.goldValue}> (💰 {drop.value} Gold)</span>
                            )}
                        </Typography>
                    ))}
                </div>

                {/* LOOT GAINED */}
                <div className={styles.section}>
                    <Typography variant="h6">Loot Gained</Typography>
                    <Divider />
                    {lootBag.length === 0 ? (
                        <Typography>No loot yet...</Typography>
                    ) : (
                        lootBag.map((item, idx) => (
                            <Typography 
                                key={idx} 
                                className={item.includes('💰') ? styles.goldLootBag : styles.lootBag}
                            >
                                {item}
                            </Typography>
                        ))
                    )}
                </div>
            </div>



            {/* Battle Log - Her zaman göster */}
            <div className={styles.section}>
                <Typography variant="h6">Battle Log</Typography>
                <Divider />
                <Box className={styles.battleLog}>
                    {currentBattle?.battleLog?.map((log, idx) => (
                        <Typography 
                            key={idx} 
                            variant="body2" 
                            className={`${styles.battleLogItem} ${
                                log.type === 'player_attack' ? styles.playerAttack :
                                log.type === 'player_crit' ? styles.playerCrit :
                                log.type === 'enemy_attack' ? styles.enemyAttack :
                                log.type === 'enemy_crit' ? styles.enemyCrit :
                                log.type?.includes('miss') ? styles.miss :
                                log.type?.includes('defeated') ? styles.defeat : ''
                            }`}
                        >
                            {log.message}
                        </Typography>
                    ))}
                </Box>
            </div>

            {/* Battle Result */}
            {battleResult && (
                <div className={styles.section}>
                    <Typography variant="h6" color={battleResult.winner === 'player' ? 'success.main' : 'error.main'}>
                        {battleResult.winner === 'player' ? t('battle.playerWins') : t('battle.enemyWins')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Player Final HP: {battleResult.playerFinalHealth} | 
                        Enemy Final HP: {battleResult.enemyFinalHealth}
                    </Typography>
                </div>
            )}

            {/* Death Dialog */}
            <Dialog 
                open={deathDialog.open} 
                maxWidth="sm"
                fullWidth
                disableEscapeKeyDown
            >
                <DialogTitle className={styles.deathDialogTitle}>
                    💀 YOU DIED! 💀
                </DialogTitle>
                <DialogContent className={styles.deathDialogContent}>
                    <div className={styles.deathMessage}>
                        <Typography variant="h5" className={styles.deathText}>
                            {t('battle.playerDefeated')}
                        </Typography>
                        <Typography variant="body1" className={styles.respawnText}>
                            {t('battle.respawnIn', { seconds: deathDialog.countdown })}
                        </Typography>
                        <div className={styles.respawnProgress}>
                            <LinearProgress 
                                variant="determinate" 
                                value={((15 - deathDialog.countdown) / 15) * 100}
                                className={styles.respawnBar}
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default Battle;
