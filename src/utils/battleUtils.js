// Battle Utilities - Helper functions related to battle
// Note: Player stats are now handled by playerStats.js utility

// Hit chance calculation
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

// Damage calculation
export const calculateDamage = (attackerATK, defenderDEF) => {
    let damage = attackerATK - (defenderDEF * 0.5);
    damage = Math.max(1, damage);
    const variation = damage * 0.1;
    damage += (Math.random() - 0.5) * variation;
    return Math.floor(damage);
};

// Battle state update
export const updateBattleState = (prevBattle, playerSpeed, enemySpeed) => {
    if (!prevBattle) return prevBattle;

    const newBattle = { ...prevBattle };
    
    // Attack bar calculation - 1-5 increase per tick
    newBattle.playerProgress = Math.min(100, newBattle.playerProgress + playerSpeed);
    newBattle.enemyProgress = Math.min(100, newBattle.enemyProgress + enemySpeed);

    return newBattle;
};

// Process player attack
export const processPlayerAttack = (battle, setDamageDisplay) => {
    const hitChance = calculateHitChance(battle.player.ATK, battle.enemy.DEF);
    const hitRoll = Math.random() * 100;
    
    if (hitRoll <= hitChance) {
        // Crit hit check
        const critRoll = Math.random() * 100;
        const isCrit = critRoll <= (battle.player.CRIT_CHANCE || 5);
        
        let damage = calculateDamage(battle.player.ATK, battle.enemy.DEF);
        
        if (isCrit) {
            damage = Math.floor(damage * ((battle.player.CRIT_DAMAGE || 150) / 100));
            const newEnemyHealth = Math.max(0, battle.enemy.currentHealth - damage);
            
            // Crit damage display
            setDamageDisplay(prev => ({ ...prev, enemy: damage, enemyType: 'crit' }));
            setTimeout(() => setDamageDisplay(prev => ({ ...prev, enemy: null, enemyType: null })), 1000);
            
            return {
                ...battle,
                enemy: { ...battle.enemy, currentHealth: newEnemyHealth },
                playerProgress: 0,
                battleLog: [...battle.battleLog, {
                    type: 'player_crit',
                    damage: damage,
                    message: `⚡ CRITICAL HIT! Player deals ${damage} damage! ⚡`
                }]
            };
        } else {
            const newEnemyHealth = Math.max(0, battle.enemy.currentHealth - damage);
            
            // Normal damage display
            setDamageDisplay(prev => ({ ...prev, enemy: damage, enemyType: 'normal' }));
            setTimeout(() => setDamageDisplay(prev => ({ ...prev, enemy: null, enemyType: null })), 1000);
            
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
        }
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

// Process enemy attack
export const processEnemyAttack = (battle, setDamageDisplay) => {
    const hitChance = calculateHitChance(battle.enemy.ATK, battle.player.DEF);
    const hitRoll = Math.random() * 100;
    
    if (hitRoll <= hitChance) {
        // Crit hit check
        const critRoll = Math.random() * 100;
        const isCrit = critRoll <= (battle.enemy.CRIT_CHANCE || 3);
        
        let damage = calculateDamage(battle.enemy.ATK, battle.player.DEF);
        
        if (isCrit) {
            damage = Math.floor(damage * ((battle.enemy.CRIT_DAMAGE || 120) / 100));
            const newPlayerHealth = Math.max(0, battle.player.currentHealth - damage);
            
            // Crit damage display
            setDamageDisplay(prev => ({ ...prev, player: damage, playerType: 'crit' }));
            setTimeout(() => setDamageDisplay(prev => ({ ...prev, player: null, playerType: null })), 1000);
            
            return {
                ...battle,
                player: { ...battle.player, currentHealth: newPlayerHealth },
                enemyProgress: 0,
                battleLog: [...battle.battleLog, {
                    type: 'enemy_crit',
                    damage: damage,
                    message: `💥 CRITICAL HIT! Enemy deals ${damage} damage! 💥`
                }]
            };
        } else {
            const newPlayerHealth = Math.max(0, battle.player.currentHealth - damage);
            
            // Normal damage display
            setDamageDisplay(prev => ({ ...prev, player: damage, playerType: 'normal' }));
            setTimeout(() => setDamageDisplay(prev => ({ ...prev, player: null, playerType: null })), 1000);
            
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
        }
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

// Check battle result
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

// New enemy spawn timer
export const createSpawnTimer = (setIsWaitingForEnemy, setEnemySpawnProgress, onComplete) => {
    setIsWaitingForEnemy(true);
    setEnemySpawnProgress(0);
    
    const duration = 5000; // 5 seconds
    const interval = 50; // 50ms per update
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