import { useEffect, useState } from "react";
import styles from "../assets/styles/Battle.module.scss";
import {
    Typography,
    LinearProgress,
    Avatar,
    Divider,
    Button,
    Box
} from "@mui/material";
import { getLootDrop, saveLoot } from "../utils/combat.js";
import enemies from "../utils/enemies.js";
import { getEnemyIcon, getSkillIcon, getCharacterIcon, getEnemyInitial, getCharacterName } from "../utils/common.js";
import { 
    PLAYER_STATS,
    calculateHitChance, 
    calculateDamage, 
    updateBattleState, 
    processPlayerAttack, 
    processEnemyAttack, 
    checkBattleResult, 
    createSpawnTimer 
} from "../utils/battleUtils.js";
import { getRandomEnemy } from "../utils/enemies.js";



function Battle({ player }) {
    const [currentEnemy, setCurrentEnemy] = useState(enemies.GOBLIN);
    const [selectedCharacter, setSelectedCharacter] = useState('warrior');
    const [playerHealth, setPlayerHealth] = useState(PLAYER_STATS.HEALTH);

    // Savaş sistemi state'leri
    const [lootBag, setLootBag] = useState([]);
    
    // Yeni savaş sistemi için state'ler
    const [battleResult, setBattleResult] = useState(null);
    const [battleLog, setBattleLog] = useState([]);
    const [isBattleActive, setIsBattleActive] = useState(false);
    const [currentBattle, setCurrentBattle] = useState(null);
    const [damageDisplay, setDamageDisplay] = useState({ player: null, enemy: null });
    const [isWaitingForEnemy, setIsWaitingForEnemy] = useState(false);
    const [enemySpawnProgress, setEnemySpawnProgress] = useState(0);



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
        const currentHealth = savedHealth ? parseInt(savedHealth) : PLAYER_STATS.HEALTH;
        
        // Yeni savaş başlat
        setTimeout(() => {
            startRealTimeBattle(randomEnemy, currentHealth);
        }, 0);
    };

    // Gerçek zamanlı savaş başlat
    const startRealTimeBattle = (enemy = currentEnemy, health = playerHealth) => {
        setCurrentBattle({
            player: { ...PLAYER_STATS, currentHealth: health },
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
        
        const savedHealth = localStorage.getItem("playerHealth");
        if (savedHealth) {
            setPlayerHealth(parseInt(savedHealth));
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
                        // Loot ekle
                        const looted = getLootDrop(currentEnemy.drops);
                        setLootBag(prev => [...prev, ...looted]);
                        saveLoot(looted);
                        
                        // Yeni düşman bekleme süresini başlat
                        startEnemySpawnTimer();
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
                    
                    <Typography className={styles.hpText}>
                        HP: {currentBattle?.player?.currentHealth || playerHealth}/{currentBattle?.player?.HEALTH || PLAYER_STATS.HEALTH}
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={currentBattle ? (currentBattle.player.currentHealth / currentBattle.player.HEALTH) * 100 : 100}
                        className={`${styles.progress} ${styles.playerHpBar}`}
                    />
                    <LinearProgress
                        variant="determinate"
                        value={currentBattle?.playerProgress || 0}
                        className={`${styles.progress} ${styles.attackBar}`}
                    />
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
                                                <Typography className={styles.hpText}>
                        HP: {currentBattle?.enemy?.currentHealth || currentEnemy.maxHp}/{currentBattle?.enemy?.maxHp || currentEnemy.maxHp}
                    </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={currentBattle ? (currentBattle.enemy.currentHealth / currentBattle.enemy.maxHp) * 100 : 100}
                                className={`${styles.progress} ${styles.enemyHpBar}`}
                            />
                            <LinearProgress
                                variant="determinate"
                                value={currentBattle?.enemyProgress || 0}
                                className={`${styles.progress} ${styles.attackBar}`}
                            />
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
                            <Typography>⚔️ ATK: {PLAYER_STATS.ATK}</Typography>
                            <Typography>🛡️ DEF: {PLAYER_STATS.DEF}</Typography>
                            <Typography>❤️ HP: {playerHealth}/{PLAYER_STATS.HEALTH}</Typography>
                            <Typography>⚡ Attack Speed: {PLAYER_STATS.ATTACK_SPEED}</Typography>
                            <Typography>🎯 Crit Chance: {PLAYER_STATS.CRIT_CHANCE}%</Typography>
                            <Typography>💥 Crit Damage: {PLAYER_STATS.CRIT_DAMAGE}%</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography>🎲 Hit Chance: {calculateHitChance(PLAYER_STATS.ATK, currentEnemy.DEF)}%</Typography>
                            <Typography>⚔️ Base Damage: {calculateDamage(PLAYER_STATS.ATK, currentEnemy.DEF)}</Typography>
                            <Typography>💥 Crit Damage: {Math.floor(calculateDamage(PLAYER_STATS.ATK, currentEnemy.DEF) * (PLAYER_STATS.CRIT_DAMAGE / 100))}</Typography>
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
                            <Typography>🎲 Hit Chance: {calculateHitChance(currentEnemy.ATK, PLAYER_STATS.DEF)}%</Typography>
                            <Typography>⚔️ Base Damage: {calculateDamage(currentEnemy.ATK, PLAYER_STATS.DEF)}</Typography>
                            <Typography>💥 Crit Damage: {Math.floor(calculateDamage(currentEnemy.ATK, PLAYER_STATS.DEF) * 1.2)}</Typography>
                        </>
                    )}
                </div>

                {/* LOOT TABLE */}
                <div className={styles.section}>
                    <Typography variant="h6">Possible Loot</Typography>
                    <Divider />
                                    {currentEnemy.drops.map((drop) => (
                    <Typography key={drop.name}>
                        {drop.name} - {(drop.chance * 100).toFixed(0)}%
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
                            <Typography key={idx} className={styles.lootBag}>
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
        </div>
    );
}

export default Battle;
