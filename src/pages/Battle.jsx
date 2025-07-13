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
    calculateDamageRange,
    updateBattleState, 
    processPlayerAttack, 
    processEnemyAttack, 
    checkBattleResult, 
    createSpawnTimer 
} from "../utils/battleUtils.js";
import { awardBattleActionXP, debugSkillLeveling, debugXPRequirements, getWeaponType, getAvailableAttackTypes } from "../utils/skillExperience.js";
import { getPlayerStats, getEquipmentBonuses, calculateSkillBuffs, calculateSkillBuffsForAttackType } from "../utils/playerStats.js";
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
    
    // Attack type selection
    const [selectedAttackType, setSelectedAttackType] = useState('stab');
    const [availableAttackTypes, setAvailableAttackTypes] = useState([]);

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
        
        // Award HP experience for participating in battle
        const hpXP = awardBattleActionXP('battle_participation', 0, false, true);
        
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

                // Calculate skill buffs for attack speed
                const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                const attackSpeedBonus = skillBuffs.ATTACK_SPEED || 0;
                const effectiveAttackSpeed = prev.player.ATTACK_SPEED + attackSpeedBonus;
                
                const playerSpeed = Math.max(1, Math.min(5, effectiveAttackSpeed));
                const enemySpeed = Math.max(1, Math.min(5, prev.enemy.ATTACK_SPEED));
                let newBattle = updateBattleState(prev, playerSpeed, enemySpeed);

                if (newBattle.playerProgress >= 100) {
                    newBattle = processPlayerAttack(newBattle, setDamageDisplay, selectedAttackType);
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
                        
                        // Add loot messages to battle log
                        const updatedBattle = {
                            ...newBattle,
                            battleLog: [
                                ...newBattle.battleLog,
                                {
                                    type: 'victory',
                                    message: `🎉 ${t('battle.playerWins')}! Enemy defeated!`
                                },
                                ...newLoot.map(item => ({
                                    type: 'loot',
                                    message: `📦 Loot: ${item}`
                                }))
                            ]
                        };
                        
                        setCurrentBattle(updatedBattle);
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

    // Update attack types when equipment changes
    useEffect(() => {
        const updateAttackTypes = () => {
            // Check both possible localStorage keys
            const equippedItems1 = JSON.parse(localStorage.getItem("equippedItems") || "{}");
            const equippedItems2 = JSON.parse(localStorage.getItem("idle-chaos-equipped-items") || "{}");
            
            const equippedWeapon = equippedItems1.weapon || equippedItems2.weapon;
            const weaponType = getWeaponType(equippedWeapon);
            const attackTypes = getAvailableAttackTypes(weaponType);
            

            
            setAvailableAttackTypes(attackTypes);
            
            // If current selected attack type is not available, select the first one
            if (!attackTypes.find(at => at.type === selectedAttackType)) {
                setSelectedAttackType(attackTypes[0]?.type || 'stab');
            }
        };

        updateAttackTypes();
        
        // Listen for equipment changes - check every 2 seconds
        const interval = setInterval(updateAttackTypes, 2000);
        
        // Also listen for storage events (other tabs)
        const handleStorageChange = () => {
            updateAttackTypes();
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [selectedAttackType]);

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
                    {Object.values(enemies)
                        .sort((a, b) => a.maxHp - b.maxHp) // Kolaydan zora sırala
                        .map((enemy) => (
                        <Grid key={enemy.id}>
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
                                                        if (e.target && e.target.nextSibling) {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }
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
                    
                    {/* Attack Type Selection - Small */}
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
                                            onClick={() => setSelectedAttackType(attackType.type)}
                                        >
                                            <span className={styles.attackTypeSmallIcon}>{attackType.icon}</span>
                                        </Button>
                                    </Tooltip>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ENEMY */}
                <div className={styles.fighter}>
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
                                <Button
                                    key={potion.id}
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
                            {(() => {
                                const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                const atkBonus = skillBuffs.ATK || 0;
                                const effectiveATK = currentBattle.player.ATK + atkBonus;
                                return (
                                    <Typography>
                                        ⚔️ {t('battle.attack')}: {effectiveATK.toFixed(1)}
                                        {atkBonus > 0 && <span className={styles.skillBonus}> (+{atkBonus.toFixed(1)})</span>}
                                    </Typography>
                                );
                            })()}
                            <Typography>🛡️ {t('battle.defense')}: {currentBattle.player.DEF}</Typography>
                            <Typography>❤️ {t('battle.health')}: {currentBattle.player.currentHealth}/{currentBattle.player.HEALTH}</Typography>
                            {(() => {
                                const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                const attackSpeedBonus = skillBuffs.ATTACK_SPEED || 0;
                                const effectiveAttackSpeed = currentBattle.player.ATTACK_SPEED + attackSpeedBonus;
                                return (
                                    <Typography>
                                        ⚡ {t('battle.attackSpeed')}: {effectiveAttackSpeed.toFixed(1)}
                                        {attackSpeedBonus > 0 && <span className={styles.skillBonus}> (+{attackSpeedBonus.toFixed(2)})</span>}
                                    </Typography>
                                );
                            })()}
                            {(() => {
                                const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                const critChanceBonus = skillBuffs.CRIT_CHANCE || 0;
                                const effectiveCritChance = (currentBattle.player.CRIT_CHANCE || 5) + critChanceBonus;
                                return (
                                    <Typography>
                                        🎯 {t('battle.criticalChance')}: {effectiveCritChance.toFixed(1)}%
                                        {critChanceBonus > 0 && <span className={styles.skillBonus}> (+{critChanceBonus.toFixed(1)}%)</span>}
                                    </Typography>
                                );
                            })()}
                            <Typography>💥 {t('battle.criticalDamage')}: {currentBattle.player.CRIT_DAMAGE || 150}%</Typography>
                            <Divider sx={{ my: 1 }} />
                            {(() => {
                                const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                const accuracyBonus = skillBuffs.ACCURACY_BONUS || 0; // Stab skill gives accuracy
                                const atkBonus = skillBuffs.ATK || 0; // Magic skills give ATK
                                const effectiveATK = currentBattle.player.ATK + atkBonus;
                                const hitChance = calculateHitChance(effectiveATK, currentBattle.enemy.DEF, accuracyBonus);
                                return (
                                    <Typography>🎲 {t('battle.hitChance')}: {hitChance}%</Typography>
                                );
                            })()}
                            {(() => {
                                const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                const damageRangeBonus = skillBuffs.DAMAGE_RANGE_BONUS || 0;
                                const critDamageBonus = skillBuffs.CRIT_DAMAGE || 0;
                                const atkBonus = skillBuffs.ATK || 0; // Magic skills give ATK
                                const effectiveATK = currentBattle.player.ATK + atkBonus;
                                const damageRange = calculateDamageRange(effectiveATK, currentBattle.enemy.DEF, damageRangeBonus);
                                const totalCritDamage = (currentBattle.player.CRIT_DAMAGE || 150) + critDamageBonus;
                                const critDamageRange = {
                                    min: Math.floor(damageRange.min * (totalCritDamage / 100)),
                                    max: Math.floor(damageRange.max * (totalCritDamage / 100))
                                };
                                return (
                                    <>
                                        <Typography>⚔️ {t('battle.baseDamage')}: {damageRange.min}-{damageRange.max}</Typography>
                                        <Typography>💥 {t('battle.critDamage')}: {critDamageRange.min}-{critDamageRange.max}</Typography>
                                    </>
                                );
                            })()}
                        </>
                    ) : (
                        <>
                            {(() => {
                                const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                const atkBonus = skillBuffs.ATK || 0;
                                const effectiveATK = playerStats.ATK + atkBonus;
                                return (
                                    <Typography>
                                        ⚔️ {t('battle.attack')}: {effectiveATK.toFixed(1)}
                                        {getEquipmentBonuses().ATK && <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().ATK})</span>}
                                        {atkBonus > 0 && <span className={styles.skillBonus}> (+{atkBonus.toFixed(1)})</span>}
                                    </Typography>
                                );
                            })()}
                            <Typography>🛡️ {t('battle.defense')}: {playerStats.DEF} {getEquipmentBonuses().DEF ? <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().DEF})</span> : ''}</Typography>
                            <Typography>❤️ {t('battle.health')}: {playerHealth}/{playerStats.HEALTH} {getEquipmentBonuses().HEALTH ? <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().HEALTH})</span> : ''}</Typography>
                            {(() => {
                                const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                const attackSpeedBonus = skillBuffs.ATTACK_SPEED || 0;
                                const effectiveAttackSpeed = playerStats.ATTACK_SPEED + attackSpeedBonus;
                                return (
                                    <Typography>
                                        ⚡ {t('battle.attackSpeed')}: {effectiveAttackSpeed.toFixed(1)}
                                        {getEquipmentBonuses().ATTACK_SPEED && <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().ATTACK_SPEED})</span>}
                                        {attackSpeedBonus > 0 && <span className={styles.skillBonus}> (+{attackSpeedBonus.toFixed(2)})</span>}
                                    </Typography>
                                );
                            })()}
                            {(() => {
                                const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                const critChanceBonus = skillBuffs.CRIT_CHANCE || 0;
                                const effectiveCritChance = playerStats.CRIT_CHANCE + critChanceBonus;
                                

                                
                                return (
                                    <Typography>
                                        🎯 {t('battle.criticalChance')}: {effectiveCritChance.toFixed(1)}%
                                        {getEquipmentBonuses().CRIT_CHANCE && <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().CRIT_CHANCE}%)</span>}
                                        {critChanceBonus > 0 && <span className={styles.skillBonus}> (+{critChanceBonus.toFixed(1)}%)</span>}
                                    </Typography>
                                );
                            })()}
                            <Typography>💥 {t('battle.criticalDamage')}: {playerStats.CRIT_DAMAGE}% {getEquipmentBonuses().CRIT_DAMAGE ? <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().CRIT_DAMAGE}%)</span> : ''}</Typography>
                            <Divider sx={{ my: 1 }} />
                            {(() => {
                                const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                const accuracyBonus = skillBuffs.ACCURACY_BONUS || 0;
                                const atkBonus = skillBuffs.ATK || 0; // Magic skills give ATK
                                const effectiveATK = playerStats.ATK + atkBonus;
                                const hitChance = calculateHitChance(effectiveATK, currentEnemy?.DEF || 0, accuracyBonus);
                                return (
                                    <Typography>🎲 {t('battle.hitChance')}: {hitChance}%</Typography>
                                );
                            })()}
                            {(() => {
                                const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                const damageRangeBonus = skillBuffs.DAMAGE_RANGE_BONUS || 0;
                                const critDamageBonus = skillBuffs.CRIT_DAMAGE || 0;
                                const atkBonus = skillBuffs.ATK || 0; // Magic skills give ATK
                                const effectiveATK = playerStats.ATK + atkBonus;
                                const baseDamage = calculateDamage(effectiveATK, currentEnemy?.DEF || 0, damageRangeBonus);
                                const totalCritDamage = playerStats.CRIT_DAMAGE + critDamageBonus;
                                return (
                                    <>
                                        <Typography>⚔️ {t('battle.baseDamage')}: {baseDamage}</Typography>
                                        <Typography>💥 {t('battle.critDamage')}: {Math.floor(baseDamage * (totalCritDamage / 100))}</Typography>
                                    </>
                                );
                            })()}
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
                            {(() => {
                                const damageRange = calculateDamageRange(currentBattle.enemy.ATK, currentBattle.player.DEF);
                                const critDamageRange = {
                                    min: Math.floor(damageRange.min * ((currentBattle.enemy.CRIT_DAMAGE || 120) / 100)),
                                    max: Math.floor(damageRange.max * ((currentBattle.enemy.CRIT_DAMAGE || 120) / 100))
                                };
                                return (
                                    <>
                                        <Typography>⚔️ {t('battle.baseDamage')}: {damageRange.min}-{damageRange.max}</Typography>
                                        <Typography>💥 {t('battle.critDamage')}: {critDamageRange.min}-{critDamageRange.max}</Typography>
                                    </>
                                );
                            })()}
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
                            <Typography>⚔️ {t('battle.baseDamage')}: {calculateDamage(currentEnemy?.ATK || 0, playerStats.DEF, 0)}</Typography>
                            <Typography>💥 {t('battle.critDamage')}: {Math.floor(calculateDamage(currentEnemy?.ATK || 0, playerStats.DEF, 0) * 1.2)}</Typography>
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
                        <div className={styles.lootSymbolsContainer}>
                            {lootBag.map((item, idx) => {
                                const isGold = item.includes('💰');
                                const isEquipment = item.includes('⚔️') || item.includes('🛡️') || item.includes('💍') || item.includes('👑');
                                
                                let symbol = '📦';
                                let tooltipText = item;
                                
                                if (isGold) {
                                    symbol = '💰';
                                    tooltipText = `Gold: ${item.replace('💰', '').trim()}`;
                                } else if (isEquipment) {
                                    if (item.includes('⚔️')) symbol = '⚔️';
                                    else if (item.includes('🛡️')) symbol = '🛡️';
                                    else if (item.includes('💍')) symbol = '💍';
                                    else if (item.includes('👑')) symbol = '👑';
                                    else symbol = '⚔️';
                                    tooltipText = `Equipment: ${item.replace(/[⚔️🛡️💍👑]/g, '').trim()}`;
                                }
                                
                                return (
                                    <Tooltip 
                                        key={idx} 
                                        title={tooltipText}
                                        arrow
                                        placement="top"
                                    >
                                        <div className={`${styles.lootSymbol} ${isGold ? styles.goldSymbol : styles.equipmentSymbol}`}>
                                            {symbol}
                                        </div>
                                    </Tooltip>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Battle Log - Her zaman göster */}
            <div className={styles.section}>
                <Typography variant="h6">{t('battle.battleLog')}</Typography>
                <Divider />
                <Box className={styles.battleLog}>
                    {currentBattle?.battleLog?.map((log, idx) => (
                        <div key={idx}>
                            <Typography 
                                variant="body2" 
                                                            className={`${styles.battleLogItem} ${
                                log.type === 'player_attack' ? styles.playerAttack :
                                log.type === 'player_crit' ? styles.playerCrit :
                                log.type === 'enemy_attack' ? styles.enemyAttack :
                                log.type === 'enemy_crit' ? styles.enemyCrit :
                                log.type?.includes('miss') ? styles.miss :
                                log.type?.includes('defeated') ? styles.defeat :
                                log.type === 'victory' ? styles.victory :
                                log.type === 'loot' ? styles.loot : ''
                            }`}
                            >
                                {log.message}
                            </Typography>
                            {log.skillXP && log.skillXP.skillsAwarded.length > 0 && (
                                <Typography 
                                    variant="caption" 
                                    className={styles.skillXPMessage}
                                    style={{ color: '#4caf50', marginLeft: '10px' }}
                                >
                                    ✨ +{log.skillXP.xpAwarded} XP to {log.skillXP.skillsAwarded.join(', ')}
                                    {log.skillXP.leveledUp && ' 🎉 LEVEL UP!'}
                                </Typography>
                            )}
                        </div>
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
