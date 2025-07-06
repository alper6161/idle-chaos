// Battle Utilities - Savaş ile ilgili yardımcı fonksiyonlar

// Sabit oyuncu statları
export const PLAYER_STATS = {
    ATK: 15,
    DEF: 8,
    HEALTH: 100,
    ATTACK_SPEED: 3
};

// Vurma ihtimali hesaplama
export const calculateHitChance = (attackerATK, defenderDEF) => {
    const ratio = attackerATK / Math.max(defenderDEF, 1);
    let baseChance = 60;
    
    if (ratio >= 2) baseChance += 25;
    else if (ratio >= 1.5) baseChance += 15;
    else if (ratio >= 1.2) baseChance += 10;
    else if (ratio < 0.8) baseChance -= 20;
    else if (ratio < 0.5) baseChance -= 35;
    
    return Math.max(5, Math.min(95, baseChance));
};

// Hasar hesaplama
export const calculateDamage = (attackerATK, defenderDEF) => {
    let damage = attackerATK - (defenderDEF * 0.5);
    damage = Math.max(1, damage);
    const variation = damage * 0.1;
    damage += (Math.random() - 0.5) * variation;
    return Math.floor(damage);
};

// Savaş durumu güncelleme
export const updateBattleState = (prevBattle, playerSpeed, enemySpeed) => {
    if (!prevBattle) return prevBattle;

    const newBattle = { ...prevBattle };
    
    // Attack bar hesaplama - her tick'te 1-5 arası artış
    newBattle.playerProgress = Math.min(100, newBattle.playerProgress + playerSpeed);
    newBattle.enemyProgress = Math.min(100, newBattle.enemyProgress + enemySpeed);

    return newBattle;
};

// Oyuncu saldırısı işleme
export const processPlayerAttack = (battle, setDamageDisplay) => {
    const hitChance = calculateHitChance(battle.player.ATK, battle.enemy.DEF);
    const hitRoll = Math.random() * 100;
    
    if (hitRoll <= hitChance) {
        const damage = calculateDamage(battle.player.ATK, battle.enemy.DEF);
        const newEnemyHealth = Math.max(0, battle.enemy.currentHealth - damage);
        
        // Damage display
        setDamageDisplay(prev => ({ ...prev, enemy: damage }));
        setTimeout(() => setDamageDisplay(prev => ({ ...prev, enemy: null })), 1000);
        
        return {
            ...battle,
            enemy: { ...battle.enemy, currentHealth: newEnemyHealth },
            playerProgress: 0,
            battleLog: [...battle.battleLog, {
                type: 'player_attack',
                damage: damage,
                message: `Player hits for ${damage} damage!`
            }]
        };
    } else {
        // Miss display
        setDamageDisplay(prev => ({ ...prev, enemy: 'MISS' }));
        setTimeout(() => setDamageDisplay(prev => ({ ...prev, enemy: null })), 1000);
        
        return {
            ...battle,
            playerProgress: 0,
            battleLog: [...battle.battleLog, {
                type: 'player_miss',
                message: `Player misses!`
            }]
        };
    }
};

// Düşman saldırısı işleme
export const processEnemyAttack = (battle, setDamageDisplay) => {
    const hitChance = calculateHitChance(battle.enemy.ATK, battle.player.DEF);
    const hitRoll = Math.random() * 100;
    
    if (hitRoll <= hitChance) {
        const damage = calculateDamage(battle.enemy.ATK, battle.player.DEF);
        const newPlayerHealth = Math.max(0, battle.player.currentHealth - damage);
        
        // Damage display
        setDamageDisplay(prev => ({ ...prev, player: damage }));
        setTimeout(() => setDamageDisplay(prev => ({ ...prev, player: null })), 1000);
        
        return {
            ...battle,
            player: { ...battle.player, currentHealth: newPlayerHealth },
            enemyProgress: 0,
            battleLog: [...battle.battleLog, {
                type: 'enemy_attack',
                damage: damage,
                message: `Enemy hits for ${damage} damage!`
            }]
        };
    } else {
        // Miss display
        setDamageDisplay(prev => ({ ...prev, player: 'MISS' }));
        setTimeout(() => setDamageDisplay(prev => ({ ...prev, player: null })), 1000);
        
        return {
            ...battle,
            enemyProgress: 0,
            battleLog: [...battle.battleLog, {
                type: 'enemy_miss',
                message: `Enemy misses!`
            }]
        };
    }
};

// Savaş sonucu kontrol
export const checkBattleResult = (battle) => {
    if (battle.enemy.currentHealth <= 0) {
        return {
            winner: 'player',
            playerFinalHealth: battle.player.currentHealth,
            enemyFinalHealth: 0,
            battleLog: battle.battleLog
        };
    }
    
    if (battle.player.currentHealth <= 0) {
        return {
            winner: 'enemy',
            playerFinalHealth: 0,
            enemyFinalHealth: battle.enemy.currentHealth,
            battleLog: battle.battleLog
        };
    }
    
    return null;
};

// Yeni düşman spawn timer'ı
export const createSpawnTimer = (setIsWaitingForEnemy, setEnemySpawnProgress, onComplete) => {
    setIsWaitingForEnemy(true);
    setEnemySpawnProgress(0);
    
    const duration = 5000; // 5 saniye
    const interval = 50; // 50ms her güncelleme
    const steps = duration / interval;
    let currentStep = 0;
    
    const timer = setInterval(() => {
        currentStep++;
        const progress = (currentStep / steps) * 100;
        setEnemySpawnProgress(progress);
        
        if (currentStep >= steps) {
            clearInterval(timer);
            setIsWaitingForEnemy(false);
            setEnemySpawnProgress(0);
            onComplete();
        }
    }, interval);
    
    return timer;
}; 