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
    DialogActions,
    Card,
    CardContent,
    CardActionArea,
    Tooltip,
    Grid,
    IconButton,
    Chip
} from "@mui/material";
import { LocalDrink } from "@mui/icons-material";
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
import { 
    POTION_TYPES, 
    getPotions, 
    usePotion, 
    shouldUseAutoPotion,
    getAutoPotionSettings,
    saveAutoPotionSettings
} from "../utils/potions.js";
import { useTranslate } from "../hooks/useTranslate";

function Battle({ player }) {
    const [battleMode, setBattleMode] = useState('selection'); // 'selection' or 'battle'
    const [currentEnemy, setCurrentEnemy] = useState(null);
    const [selectedCharacter, setSelectedCharacter] = useState('warrior');
    const [playerStats, setPlayerStats] = useState(getPlayerStats());
    const [playerHealth, setPlayerHealth] = useState(playerStats.HEALTH);
    const { t } = useTranslate();

    const [lootBag, setLootBag] = useState([]);
    const [playerGold, setPlayerGold] = useState(getGold());
    
    // Potion states
    const [potions, setPotions] = useState(getPotions());
    const [autoPotionSettings, setAutoPotionSettings] = useState(getAutoPotionSettings());
    const [lastPotionUsed, setLastPotionUsed] = useState(null);
    
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

    // Potion usage function
    const handleUsePotion = (potionType) => {
        const result = usePotion(potionType);
        if (result.success) {
            setPotions(result.remainingPotions);
            
            // Heal the player
            if (currentBattle) {
                const newHealth = Math.min(
                    currentBattle.player.currentHealth + result.healAmount,
                    currentBattle.player.HEALTH
                );
                
                setCurrentBattle(prev => ({
                    ...prev,
                    player: { ...prev.player, currentHealth: newHealth }
                }));
                
                setPlayerHealth(newHealth);
                localStorage.setItem("playerHealth", newHealth.toString());
                
                // Show potion used effect
                setLastPotionUsed({
                    type: potionType,
                    healAmount: result.healAmount,
                    timestamp: Date.now()
                });
                
                // Clear effect after 2 seconds
                setTimeout(() => {
                    setLastPotionUsed(null);
                }, 2000);
            }
        }
    };

    // Auto potion check
    const checkAutoPotion = () => {
        if (!currentBattle || !autoPotionSettings.enabled) return;
        
        const potionToUse = shouldUseAutoPotion(
            currentBattle.player.currentHealth,
            currentBattle.player.HEALTH
        );
        
        if (potionToUse) {
            handleUsePotion(potionToUse);
        }
    };

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
        setPlayerHealth(currentPlayerStats.HEALTH); // <-- Güncel max HP
        localStorage.setItem("playerHealth", currentPlayerStats.HEALTH.toString());
        
        setBattleMode('selection');
        setCurrentEnemy(null);
        setBattleResult(null);
        setCurrentBattle(null);
        setIsBattleActive(false);
    };

    const startEnemySpawnTimer = () => {
        createSpawnTimer(
            setIsWaitingForEnemy, 
            setEnemySpawnProgress, 
            spawnNewEnemy
        );
    };
    
    const spawnNewEnemy = () => {
        setBattleResult(null);
        setCurrentBattle(null);
        
        const savedHealth = localStorage.getItem("playerHealth");
        const currentPlayerStats = getPlayerStats();
        const currentHealth = savedHealth ? parseInt(savedHealth) : currentPlayerStats.HEALTH;
        
        setTimeout(() => {
            startRealTimeBattle(currentEnemy, currentHealth);
        }, 0);
    };

    const handleEnemySelect = (enemy) => {
        setCurrentEnemy(enemy);
        setBattleMode('battle');

        // Her zaman güncel max HP'yi al
        const currentPlayerStats = getPlayerStats();
        setPlayerHealth(currentPlayerStats.HEALTH); // <-- Burası önemli

        setTimeout(() => {
            startRealTimeBattle(enemy, currentPlayerStats.HEALTH);
        }, 100);
    };

    const handleBackToSelection = () => {
        setBattleMode('selection');
        setCurrentEnemy(null);
        setBattleResult(null);
        setCurrentBattle(null);
        setIsBattleActive(false);
        setIsWaitingForEnemy(false);
        setEnemySpawnProgress(0);
    };

    const startRealTimeBattle = (enemy = currentEnemy, health = playerHealth) => {
        const currentPlayerStats = getPlayerStats();
        setPlayerStats(currentPlayerStats);
        
        // Eğer mevcut HP, yeni max HP'den büyükse, max HP'ye eşitle
        const adjustedHealth = Math.min(health, currentPlayerStats.HEALTH);
        
        setCurrentBattle({
            player: { ...currentPlayerStats, currentHealth: adjustedHealth },
            enemy: { ...enemy, currentHealth: enemy.maxHp },
            playerProgress: 0,
            enemyProgress: 0,
            battleLog: []
        });
        setIsBattleActive(true);
        setBattleResult(null);
        setDamageDisplay({ player: null, enemy: null });
    };

    const getDifficultyColor = (enemy) => {
        if (enemy.maxHp <= 25) return '#4caf50'; // Easy - Green
        if (enemy.maxHp <= 50) return '#ff9800'; // Medium - Orange
        if (enemy.maxHp <= 80) return '#f44336'; // Hard - Red
        return '#9c27b0'; // Very Hard - Purple
    };

    const getDifficultyText = (enemy) => {
        if (enemy.maxHp <= 25) return 'Easy';
        if (enemy.maxHp <= 50) return 'Medium';
        if (enemy.maxHp <= 80) return 'Hard';
        return 'Very Hard';
    };

    const renderLootTooltip = (enemy) => (
        <Box sx={{ p: 1 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
                {t('battle.possibleDrops')}
            </Typography>
            {enemy.drops.map((drop, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                    {drop.name} - {(drop.chance * 100).toFixed(0)}%
                    {drop.type === 'gold' && (
                        <span style={{ color: '#ffd700' }}> (💰 {drop.value} Gold)</span>
                    )}
                </Typography>
            ))}
        </Box>
    );

    useEffect(() => {
        const savedCharacter = localStorage.getItem("selectedCharacter");
        if (savedCharacter) {
            setSelectedCharacter(savedCharacter);
        }
        
        const currentPlayerStats = getPlayerStats();
        setPlayerStats(currentPlayerStats);
        
        // Her zaman güncel max HP'yi kullan
        setPlayerHealth(currentPlayerStats.HEALTH);
        localStorage.setItem("playerHealth", currentPlayerStats.HEALTH.toString());
    }, []);

    useEffect(() => {
        const checkEquipmentChanges = () => {
            const currentPlayerStats = getPlayerStats();
            if (JSON.stringify(currentPlayerStats) !== JSON.stringify(playerStats)) {
                setPlayerStats(currentPlayerStats);
                if (currentBattle) {
                    setCurrentBattle(prev => ({
                        ...prev,
                        player: { ...currentPlayerStats, currentHealth: Math.min(prev.player.currentHealth, currentPlayerStats.HEALTH) }
                    }));
                }
            }
        };

        const interval = setInterval(checkEquipmentChanges, 1000);
        
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
            
            // Check for auto potion usage
            checkAutoPotion();
        }, 200);

        return () => clearInterval(interval);
    }, [isBattleActive, currentBattle, autoPotionSettings]);

    // playerStats değiştiğinde playerHealth'i de güncelle
    useEffect(() => {
        setPlayerHealth(playerStats.HEALTH);
        localStorage.setItem("playerHealth", playerStats.HEALTH.toString());
    }, [playerStats.HEALTH]);

    // Update auto potion settings when buffs change
    useEffect(() => {
        const checkAutoPotionBuff = () => {
            const activeBuffs = JSON.parse(localStorage.getItem('activeBuffs') || '{}');
            const autoPotionBuff = activeBuffs['auto_potion'];
            
            if (autoPotionBuff && autoPotionBuff.expiresAt > Date.now()) {
                // Auto potion buff is active
                const newSettings = { ...autoPotionSettings, enabled: true };
                setAutoPotionSettings(newSettings);
                saveAutoPotionSettings(newSettings);
            } else if (autoPotionSettings.enabled) {
                // Auto potion buff expired, disable auto potion
                const newSettings = { ...autoPotionSettings, enabled: false };
                setAutoPotionSettings(newSettings);
                saveAutoPotionSettings(newSettings);
            }
        };

        const interval = setInterval(checkAutoPotionBuff, 5000);
        checkAutoPotionBuff(); // Check immediately
        
        return () => clearInterval(interval);
    }, [autoPotionSettings.enabled]);

    // Enemy Selection Screen
    if (battleMode === 'selection') {
        return (
            <div className={styles.battleContainer}>
                <div className={styles.enemySelectionHeader}>
                    <Typography variant="h4" className={styles.selectionTitle}>
                        {t('battle.selectEnemy')}
                    </Typography>
                    <Typography variant="h6" className={styles.selectionSubtitle}>
                        {t('battle.choosYourOpponent')}
                    </Typography>
                </div>

                <Grid container spacing={3} className={styles.enemyGrid}>
                    {Object.values(enemies).map((enemy) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={enemy.id}>
                            <Tooltip
                                title={renderLootTooltip(enemy)}
                                arrow
                                placement="top"
                                className={styles.enemyTooltip}
                            >
                                <Card className={styles.enemyCard}>
                                    <CardActionArea onClick={() => handleEnemySelect(enemy)}>
                                        <CardContent className={styles.enemyCardContent}>
                                            <div className={styles.enemyAvatar}>
                                                <Avatar 
                                                    src={getEnemyIcon(enemy.id)} 
                                                    className={styles.enemyImage}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                                <div 
                                                    className={styles.enemyAvatarFallback}
                                                    style={{ display: 'none' }}
                                                >
                                                    {getEnemyInitial(enemy.name)}
                                                </div>
                                            </div>
                                            
                                            <Typography variant="h6" className={styles.enemyName}>
                                                {enemy.name}
                                            </Typography>
                                            
                                            <div className={styles.enemyStats}>
                                                <Typography variant="body2">
                                                    ❤️ HP: {enemy.maxHp}
                                                </Typography>
                                                <Typography variant="body2">
                                                    ⚔️ ATK: {enemy.ATK}
                                                </Typography>
                                                <Typography variant="body2">
                                                    🛡️ DEF: {enemy.DEF}
                                                </Typography>
                                            </div>
                                            
                                            <div 
                                                className={styles.difficultyBadge}
                                                style={{ backgroundColor: getDifficultyColor(enemy) }}
                                            >
                                                <Typography variant="caption">
                                                    {getDifficultyText(enemy)}
                                                </Typography>
                                            </div>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Tooltip>
                        </Grid>
                    ))}
                </Grid>
            </div>
        );
    }

    // Battle Screen
    return (
        <div className={styles.battleContainer}>
            <div className={styles.battleHeader}>
                <Button 
                    variant="outlined" 
                    onClick={handleBackToSelection}
                    className={styles.backButton}
                >
                    {t('battle.backToSelection')}
                </Button>
                <Typography variant="h5" className={styles.battleTitle}>
                    {t('battle.fightThisEnemy')}: {currentEnemy?.name}
                </Typography>
            </div>

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
                            value={currentBattle ? (currentBattle.player.currentHealth / currentBattle.player.HEALTH) * 100 : (playerHealth / playerStats.HEALTH) * 100}
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
                </div>

                {/* ENEMY */}
                <div className={styles.fighter}>
                    <Avatar 
                        src={getEnemyIcon(currentEnemy?.id)} 
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
                        {getEnemyInitial(currentEnemy?.name)}
                    </div>
                    <Typography variant="h6">{currentEnemy?.name}</Typography>
                    
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
                                    HP: {currentBattle?.enemy?.currentHealth || currentEnemy?.maxHp}/{currentBattle?.enemy?.maxHp || currentEnemy?.maxHp}
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={currentBattle ? (currentBattle.enemy.currentHealth / currentBattle.enemy.maxHp) * 100 : 100}
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
            </div>

            {/* Potion System */}
            {currentBattle && (
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
                                <Tooltip
                                    key={potion.id}
                                    title={`${t(`potions.${potion.id}HealthPotion`)} - ${t('potions.restoresHp', { amount: potion.healAmount })} (${count} available)`}
                                    arrow
                                    placement="top"
                                >
                                    <Button
                                        variant="contained"
                                        className={styles.potionButton}
                                        disabled={!canUse}
                                        onClick={() => handleUsePotion(potion.id)}
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
                                </Tooltip>
                            );
                        })}
                    </div>
                    
                    {/* Potion Used Effect */}
                    {lastPotionUsed && (
                        <div className={styles.potionEffect}>
                            <Typography variant="h4" className={styles.healText}>
                                +{lastPotionUsed.healAmount} HP
                            </Typography>
                        </div>
                    )}
                </div>
            )}

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
                            <Typography>🎲 {t('battle.hitChance')}: {calculateHitChance(currentBattle.player.ATK, currentBattle.enemy.DEF)}%</Typography>
                            <Typography>⚔️ {t('battle.baseDamage')}: {calculateDamage(currentBattle.player.ATK, currentBattle.enemy.DEF)}</Typography>
                            <Typography>💥 {t('battle.critDamage')}: {Math.floor(calculateDamage(currentBattle.player.ATK, currentBattle.enemy.DEF) * ((currentBattle.player.CRIT_DAMAGE || 150) / 100))}</Typography>
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
                            <Typography>🎲 {t('battle.hitChance')}: {calculateHitChance(playerStats.ATK, currentEnemy?.DEF || 0)}%</Typography>
                            <Typography>⚔️ {t('battle.baseDamage')}: {calculateDamage(playerStats.ATK, currentEnemy?.DEF || 0)}</Typography>
                            <Typography>💥 {t('battle.critDamage')}: {Math.floor(calculateDamage(playerStats.ATK, currentEnemy?.DEF || 0) * (playerStats.CRIT_DAMAGE / 100))}</Typography>
                        </>
                    )}
                </div>

                {/* ENEMY STATS */}
                <div className={styles.section}>
                    <Typography variant="h6">{t('battle.enemyStats')}</Typography>
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
                            <Typography>🎲 {t('battle.hitChance')}: {calculateHitChance(currentBattle.enemy.ATK, currentBattle.player.DEF)}%</Typography>
                            <Typography>⚔️ {t('battle.baseDamage')}: {calculateDamage(currentBattle.enemy.ATK, currentBattle.player.DEF)}</Typography>
                            <Typography>💥 {t('battle.critDamage')}: {Math.floor(calculateDamage(currentBattle.enemy.ATK, currentBattle.player.DEF) * ((currentBattle.enemy.CRIT_DAMAGE || 120) / 100))}</Typography>
                        </>
                    ) : (
                        <>
                            <Typography>⚔️ {t('battle.attack')}: {currentEnemy?.ATK}</Typography>
                            <Typography>🛡️ {t('battle.defense')}: {currentEnemy?.DEF}</Typography>
                            <Typography>❤️ {t('battle.health')}: {currentEnemy?.maxHp}/{currentEnemy?.maxHp}</Typography>
                            <Typography>⚡ {t('battle.attackSpeed')}: {currentEnemy?.ATTACK_SPEED || 1.5}</Typography>
                            <Typography>🎯 {t('battle.criticalChance')}: 3%</Typography>
                            <Typography>💥 {t('battle.criticalDamage')}: 120%</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography>🎲 {t('battle.hitChance')}: {calculateHitChance(currentEnemy?.ATK || 0, playerStats.DEF)}%</Typography>
                            <Typography>⚔️ {t('battle.baseDamage')}: {calculateDamage(currentEnemy?.ATK || 0, playerStats.DEF)}</Typography>
                            <Typography>💥 {t('battle.critDamage')}: {Math.floor(calculateDamage(currentEnemy?.ATK || 0, playerStats.DEF) * 1.2)}</Typography>
                        </>
                    )}
                </div>

                {/* LOOT TABLE */}
                <div className={styles.section}>
                    <Typography variant="h6">{t('battle.possibleLoot')}</Typography>
                    <Divider />
                    {currentEnemy?.drops.map((drop) => (
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
                    <Typography variant="h6">{t('battle.lootGained')}</Typography>
                    <Divider />
                    {lootBag.length === 0 ? (
                        <Typography>{t('battle.noLootYet')}</Typography>
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
                <Typography variant="h6">{t('battle.battleLog')}</Typography>
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
                        {t('battle.playerFinalHp')}: {battleResult.playerFinalHealth} | 
                        {t('battle.enemyFinalHp')}: {battleResult.enemyFinalHealth}
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
                    💀 {t('battle.youDied')} 💀
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
