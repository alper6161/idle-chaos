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



function Battle({ player }) {
    const [currentEnemy, setCurrentEnemy] = useState(enemies.GOBLIN);
    const [selectedCharacter, setSelectedCharacter] = useState('warrior');
    const [playerStats, setPlayerStats] = useState(getPlayerStats());
    const [playerHealth, setPlayerHealth] = useState(playerStats.HEALTH);

    // Savaş sistemi state'leri
    const [lootBag, setLootBag] = useState([]);
    const [playerGold, setPlayerGold] = useState(getGold());
    
    // Yeni savaş sistemi için state'ler
    const [battleResult, setBattleResult] = useState(null);
    const [battleLog, setBattleLog] = useState([]);
    const [isBattleActive, setIsBattleActive] = useState(false);
    const [currentBattle, setCurrentBattle] = useState(null);
    const [damageDisplay, setDamageDisplay] = useState({ player: null, enemy: null });
    const [isWaitingForEnemy, setIsWaitingForEnemy] = useState(false);
    const [enemySpawnProgress, setEnemySpawnProgress] = useState(0);
    
    // Death popup state'leri
    const [deathDialog, setDeathDialog] = useState({
        open: false,
        countdown: 15
    });



    // Ölüm popup'ını aç
    const showDeathDialog = () => {
        setDeathDialog({
            open: true,
            countdown: 15
        });
        
        // 15 saniye countdown başlat
        const countdownInterval = setInterval(() => {
            setDeathDialog(prev => {
                if (prev.countdown <= 1) {
                    clearInterval(countdownInterval);
                    // Oyuncuyu yeniden doğur
                    respawnPlayer();
                    return { open: false, countdown: 15 };
                }
                return { ...prev, countdown: prev.countdown - 1 };
            });
        }, 1000);
    };

    // Oyuncuyu yeniden doğur
    const respawnPlayer = () => {
        const currentPlayerStats = getPlayerStats();
        setPlayerStats(currentPlayerStats);
        setPlayerHealth(currentPlayerStats.HEALTH);
        localStorage.setItem("playerHealth", currentPlayerStats.HEALTH.toString());
        
        // Yeni düşman ile savaş başlat
        const randomEnemy = getRandomEnemy();
        setCurrentEnemy(randomEnemy);
        startRealTimeBattle(randomEnemy, currentPlayerStats.HEALTH);
    };

    // Yeni düşman spawn timer'ı
    const startEnemySpawnTimer = () => {
        createSpawnTimer(
            setIsWaitingForEnemy, 
            setEnemySpawnProgress, 
            spawnNewEnemy
        );
    };
    
    // Yeni düşman spawn et
    const spawnNewEnemy = () => {
        // Rastgele yeni düşman seç
        const randomEnemy = getRandomEnemy();
        setCurrentEnemy(randomEnemy);
        setBattleResult(null);
        setCurrentBattle(null);
        
        // localStorage'dan güncel can değerini al
        const savedHealth = localStorage.getItem("playerHealth");
        const currentPlayerStats = getPlayerStats();
        const currentHealth = savedHealth ? parseInt(savedHealth) : currentPlayerStats.HEALTH;
        
        // Yeni savaş başlat
        setTimeout(() => {
            startRealTimeBattle(randomEnemy, currentHealth);
        }, 0);
    };

    // Gerçek zamanlı savaş başlat
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

    // Seçilen karakter tipini ve oyuncu canını yükle
    useEffect(() => {
        const savedCharacter = localStorage.getItem("selectedCharacter");
        if (savedCharacter) {
            setSelectedCharacter(savedCharacter);
        }
        
        // Equipment'tan güncel player stats'ını al
        const currentPlayerStats = getPlayerStats();
        setPlayerStats(currentPlayerStats);
        
        const savedHealth = localStorage.getItem("playerHealth");
        if (savedHealth) {
            const healthValue = parseInt(savedHealth);
            // Eğer maksimum health artmışsa, current health'i de arttır
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

    // Sayfa yüklendiğinde otomatik savaş başlat
    useEffect(() => {
        // İlk yüklemede rastgele düşman ile savaş başlat
        if (!isBattleActive && !currentBattle && !battleResult) {
            const randomEnemy = getRandomEnemy();
            setCurrentEnemy(randomEnemy);
            startRealTimeBattle(randomEnemy);
        }
    }, []); // Sadece component mount olduğunda çalışır

    // Equipment değişikliği algıla
    useEffect(() => {
        const checkEquipmentChanges = () => {
            const currentPlayerStats = getPlayerStats();
            // Stats değişti mi kontrol et
            if (JSON.stringify(currentPlayerStats) !== JSON.stringify(playerStats)) {
                setPlayerStats(currentPlayerStats);
                // Eğer current battle varsa, stats'ı güncelle
                if (currentBattle) {
                    setCurrentBattle(prev => ({
                        ...prev,
                        player: { ...currentPlayerStats, currentHealth: prev.player.currentHealth }
                    }));
                }
            }
        };

        // Her 2 saniyede bir kontrol et
        const interval = setInterval(checkEquipmentChanges, 2000);
        
        // Sayfa focus olduğunda da kontrol et
        const handleFocus = () => {
            checkEquipmentChanges();
        };
        
        window.addEventListener('focus', handleFocus);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
        };
    }, [playerStats, currentBattle]);

    // Yeni attack bar sistemi
    useEffect(() => {
        if (!isBattleActive || !currentBattle) return;

        const interval = setInterval(() => {
            setCurrentBattle(prev => {
                if (!prev) return prev;

                // Attack bar güncelleme
                const playerSpeed = Math.max(1, Math.min(5, prev.player.ATTACK_SPEED));
                const enemySpeed = Math.max(1, Math.min(5, prev.enemy.ATTACK_SPEED));
                let newBattle = updateBattleState(prev, playerSpeed, enemySpeed);

                // Oyuncu saldırısı
                if (newBattle.playerProgress >= 100) {
                    newBattle = processPlayerAttack(newBattle, setDamageDisplay);
                }

                // Düşman saldırısı
                if (newBattle.enemyProgress >= 100) {
                    newBattle = processEnemyAttack(newBattle, setDamageDisplay);
                }

                // Savaş sonucu kontrol
                const battleResult = checkBattleResult(newBattle);
                if (battleResult) {
                    setIsBattleActive(false);
                    setBattleResult(battleResult);
                    
                    // Oyuncu canını güncelle ve kaydet
                    setPlayerHealth(battleResult.playerFinalHealth);
                    localStorage.setItem("playerHealth", battleResult.playerFinalHealth.toString());
                    
                    if (battleResult.winner === 'player') {
                        // Loot ve gold ekle
                        const lootResult = getLootDrop(currentEnemy.drops);
                        
                        // Items'ları loot bag'e ekle
                        const newLoot = [...lootResult.items];
                        
                        // Gold items'ları ayrı ayrı ekle
                        if (lootResult.goldItems && lootResult.goldItems.length > 0) {
                            lootResult.goldItems.forEach(goldItem => {
                                newLoot.push(`💰 ${goldItem.name} ${goldItem.value} gold'a satıldı`);
                            });
                            const newGold = addGold(lootResult.gold);
                            setPlayerGold(newGold);
                        }
                        
                        setLootBag(prev => [...prev, ...newLoot]);
                        saveLoot(lootResult.items); // Sadece gerçek item'ları kaydet
                        
                        // Yeni düşman bekleme süresini başlat
                        startEnemySpawnTimer();
                    } else if (battleResult.winner === 'enemy') {
                        // Oyuncu öldü, ölüm popup'ını göster
                        showDeathDialog();
                    }
                    return prev;
                }

                return newBattle;
            });
        }, 200); // 200ms interval - daha yavaş ve kontrollü

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
                    <Typography variant="h6">Player Stats</Typography>
                    <Divider />
                    {currentBattle ? (
                        <>
                            <Typography>⚔️ ATK: {currentBattle.player.ATK}</Typography>
                            <Typography>🛡️ DEF: {currentBattle.player.DEF}</Typography>
                            <Typography>❤️ HP: {currentBattle.player.currentHealth}/{currentBattle.player.HEALTH}</Typography>
                            <Typography>⚡ Attack Speed: {currentBattle.player.ATTACK_SPEED}</Typography>
                            <Typography>🎯 Crit Chance: {currentBattle.player.CRIT_CHANCE || 5}%</Typography>
                            <Typography>💥 Crit Damage: {currentBattle.player.CRIT_DAMAGE || 150}%</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography>🎲 Hit Chance: {calculateHitChance(currentBattle.player.ATK, currentBattle.enemy.DEF)}%</Typography>
                            <Typography>⚔️ Base Damage: {calculateDamage(currentBattle.player.ATK, currentBattle.enemy.DEF)}</Typography>
                            <Typography>💥 Crit Damage: {Math.floor(calculateDamage(currentBattle.player.ATK, currentBattle.enemy.DEF) * ((currentBattle.player.CRIT_DAMAGE || 150) / 100))}</Typography>
                        </>
                    ) : (
                        <>
                            <Typography>⚔️ ATK: {playerStats.ATK} {getEquipmentBonuses().ATK ? <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().ATK})</span> : ''}</Typography>
                            <Typography>🛡️ DEF: {playerStats.DEF} {getEquipmentBonuses().DEF ? <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().DEF})</span> : ''}</Typography>
                            <Typography>❤️ HP: {playerHealth}/{playerStats.HEALTH} {getEquipmentBonuses().HEALTH ? <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().HEALTH})</span> : ''}</Typography>
                            <Typography>⚡ Attack Speed: {playerStats.ATTACK_SPEED} {getEquipmentBonuses().ATTACK_SPEED ? <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().ATTACK_SPEED})</span> : ''}</Typography>
                            <Typography>🎯 Crit Chance: {playerStats.CRIT_CHANCE}% {getEquipmentBonuses().CRIT_CHANCE ? <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().CRIT_CHANCE}%)</span> : ''}</Typography>
                            <Typography>💥 Crit Damage: {playerStats.CRIT_DAMAGE}% {getEquipmentBonuses().CRIT_DAMAGE ? <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().CRIT_DAMAGE}%)</span> : ''}</Typography>
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
                            <Typography>⚔️ ATK: {currentBattle.enemy.ATK}</Typography>
                            <Typography>🛡️ DEF: {currentBattle.enemy.DEF}</Typography>
                            <Typography>❤️ HP: {currentBattle.enemy.currentHealth}/{currentBattle.enemy.maxHp}</Typography>
                            <Typography>⚡ Attack Speed: {currentBattle.enemy.ATTACK_SPEED}</Typography>
                            <Typography>🎯 Crit Chance: {currentBattle.enemy.CRIT_CHANCE || 3}%</Typography>
                            <Typography>💥 Crit Damage: {currentBattle.enemy.CRIT_DAMAGE || 120}%</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography>🎲 Hit Chance: {calculateHitChance(currentBattle.enemy.ATK, currentBattle.player.DEF)}%</Typography>
                            <Typography>⚔️ Base Damage: {calculateDamage(currentBattle.enemy.ATK, currentBattle.player.DEF)}</Typography>
                            <Typography>💥 Crit Damage: {Math.floor(calculateDamage(currentBattle.enemy.ATK, currentBattle.player.DEF) * ((currentBattle.enemy.CRIT_DAMAGE || 120) / 100))}</Typography>
                        </>
                    ) : (
                        <>
                            <Typography>⚔️ ATK: {currentEnemy.ATK}</Typography>
                            <Typography>🛡️ DEF: {currentEnemy.DEF}</Typography>
                            <Typography>❤️ HP: {currentEnemy.maxHp}/{currentEnemy.maxHp}</Typography>
                            <Typography>⚡ Attack Speed: {currentEnemy.ATTACK_SPEED || 1.5}</Typography>
                            <Typography>🎯 Crit Chance: 3%</Typography>
                            <Typography>💥 Crit Damage: 120%</Typography>
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
                        {battleResult.winner === 'player' ? '🎉 Player Wins!' : '💀 Enemy Wins!'}
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
                            You have been defeated by {currentEnemy.name}!
                        </Typography>
                        <Typography variant="body1" className={styles.respawnText}>
                            Respawning in {deathDialog.countdown} seconds...
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
