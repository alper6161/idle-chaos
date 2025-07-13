import { applyDamageMultiplier } from './buffUtils.js';
import { awardBattleActionXP, getAttackTypeFromWeapon, getEquippedWeapon } from './skillExperience.js';
import { calculateSkillBuffs } from './playerStats.js';

export const calculateHitChance = (attackerATK, defenderDEF, accuracyBonus = 0) => {
    // Ensure we have valid numbers
    const atk = Number(attackerATK) || 0;
    const def = Number(defenderDEF) || 0;
    const accuracy = Number(accuracyBonus) || 0;
    
    const ratio = atk / Math.max(def, 1);
    let baseChance = 60;
    
    if (ratio >= 2) baseChance += 25;
    else if (ratio >= 1.5) baseChance += 15;
    else if (ratio >= 1.2) baseChance += 10;
    else if (ratio < 0.8) baseChance -= 20;
    else if (ratio < 0.5) baseChance -= 35;
    
    // Apply accuracy bonus from skills (like stab)
    baseChance += accuracy;
    
    return Math.max(5, Math.min(95, baseChance));
};

export const calculateDamageRange = (attackerATK, defenderDEF, damageRangeBonus = 0) => {
    // Ensure we have valid numbers
    const atk = Number(attackerATK) || 0;
    const def = Number(defenderDEF) || 0;
    const bonus = Number(damageRangeBonus) || 0;
    
    let baseDamage = atk - (def * 0.5);
    baseDamage = Math.max(1, baseDamage);
    
    // Calculate damage range (min and max)
    const variation = baseDamage * 0.15; // 15% variation
    const minDamage = Math.floor(baseDamage - variation);
    let maxDamage = Math.floor(baseDamage + variation);
    
    // Apply slash skill bonus to max damage
    maxDamage += bonus;
    
    return {
        min: Math.max(1, minDamage),
        max: Math.max(1, maxDamage)
    };
};

export const calculateDamage = (attackerATK, defenderDEF) => {
    // Ensure we have valid numbers
    const atk = Number(attackerATK) || 0;
    const def = Number(defenderDEF) || 0;
    
    const damageRange = calculateDamageRange(atk, def);
    
    // Random damage within the range
    const damage = Math.floor(
        damageRange.min + Math.random() * (damageRange.max - damageRange.min + 1)
    );
    
    return Math.max(1, damage);
};

export const updateBattleState = (prevBattle, playerSpeed, enemySpeed) => {
    if (!prevBattle) return prevBattle;

    const newBattle = { ...prevBattle };
    
    newBattle.playerProgress = Math.min(100, newBattle.playerProgress + playerSpeed);
    newBattle.enemyProgress = Math.min(100, newBattle.enemyProgress + enemySpeed);

    return newBattle;
};

export const processPlayerAttack = (battle, setDamageDisplay) => {
    // Calculate accuracy bonus from skills (stab skill)
    const skillBuffs = calculateSkillBuffs();
    const accuracyBonus = skillBuffs.ACCURACY_BONUS || 0; // Stab skill gives accuracy
    
    const hitChance = calculateHitChance(battle.player.ATK, battle.enemy.DEF, accuracyBonus);
    const hitRoll = Math.random() * 100;
    
    // Determine attack type based on equipped weapon
    const equippedWeapon = getEquippedWeapon();
    const attackType = getAttackTypeFromWeapon(equippedWeapon);
    
    if (hitRoll <= hitChance) {
        const critRoll = Math.random() * 100;
        const isCrit = critRoll <= (battle.player.CRIT_CHANCE || 5);
        
        let damage = calculateDamage(battle.player.ATK, battle.enemy.DEF);
        
        // Apply damage buff
        damage = applyDamageMultiplier(damage);
        
        // Award skill experience for the attack
        const xpResult = awardBattleActionXP(attackType, damage, isCrit, true);
        
        if (isCrit) {
            damage = Math.floor(damage * ((battle.player.CRIT_DAMAGE || 150) / 100));
            const newEnemyHealth = Math.max(0, battle.enemy.currentHealth - damage);
            
            setDamageDisplay(prev => ({ ...prev, enemy: damage, enemyType: 'crit' }));
            setTimeout(() => setDamageDisplay(prev => ({ ...prev, enemy: null, enemyType: null })), 1000);
            
            return {
                ...battle,
                enemy: { ...battle.enemy, currentHealth: newEnemyHealth },
                playerProgress: 0,
                battleLog: [...battle.battleLog, {
                    type: 'player_crit',
                    damage: damage,
                    message: `⚡ CRITICAL HIT! Player deals ${damage} damage! ⚡`,
                    skillXP: xpResult
                }]
            };
        } else {
            const newEnemyHealth = Math.max(0, battle.enemy.currentHealth - damage);
            
            setDamageDisplay(prev => ({ ...prev, enemy: damage, enemyType: 'normal' }));
            setTimeout(() => setDamageDisplay(prev => ({ ...prev, enemy: null, enemyType: null })), 1000);
            
            return {
                ...battle,
                enemy: { ...battle.enemy, currentHealth: newEnemyHealth },
                playerProgress: 0,
                battleLog: [...battle.battleLog, {
                    type: 'player_attack',
                    damage: damage,
                    message: `Player hits for ${damage} damage!`,
                    skillXP: xpResult
                }]
            };
        }
    } else {
        // Award small XP for attempting attack (even if missed)
        const xpResult = awardBattleActionXP(attackType, 0, false, false);
        
        setDamageDisplay(prev => ({ ...prev, enemy: 'MISS' }));
        setTimeout(() => setDamageDisplay(prev => ({ ...prev, enemy: null })), 1000);
        
        return {
            ...battle,
            playerProgress: 0,
            battleLog: [...battle.battleLog, {
                type: 'player_miss',
                message: `Player misses!`,
                skillXP: xpResult
            }]
        };
    }
};

export const processEnemyAttack = (battle, setDamageDisplay) => {
    const hitChance = calculateHitChance(battle.enemy.ATK, battle.player.DEF);
    const hitRoll = Math.random() * 100;
    
    if (hitRoll <= hitChance) {
        const critRoll = Math.random() * 100;
        const isCrit = critRoll <= (battle.enemy.CRIT_CHANCE || 3);
        
        let damage = calculateDamage(battle.enemy.ATK, battle.player.DEF);
        
        // Award defense skill experience for taking damage
        const defenseXP = awardBattleActionXP('damage_taken', damage, isCrit, true);
        
        if (isCrit) {
            damage = Math.floor(damage * ((battle.enemy.CRIT_DAMAGE || 120) / 100));
            const newPlayerHealth = Math.max(0, battle.player.currentHealth - damage);
            
            setDamageDisplay(prev => ({ ...prev, player: damage, playerType: 'crit' }));
            setTimeout(() => setDamageDisplay(prev => ({ ...prev, player: null, playerType: null })), 1000);
            
            return {
                ...battle,
                player: { ...battle.player, currentHealth: newPlayerHealth },
                enemyProgress: 0,
                battleLog: [...battle.battleLog, {
                    type: 'enemy_crit',
                    damage: damage,
                    message: `💥 CRITICAL HIT! Enemy deals ${damage} damage! 💥`,
                    skillXP: defenseXP
                }]
            };
        } else {
            const newPlayerHealth = Math.max(0, battle.player.currentHealth - damage);
            
            setDamageDisplay(prev => ({ ...prev, player: damage, playerType: 'normal' }));
            setTimeout(() => setDamageDisplay(prev => ({ ...prev, player: null, playerType: null })), 1000);
            
            return {
                ...battle,
                player: { ...battle.player, currentHealth: newPlayerHealth },
                enemyProgress: 0,
                battleLog: [...battle.battleLog, {
                    type: 'enemy_attack',
                    damage: damage,
                    message: `Enemy hits for ${damage} damage!`,
                    skillXP: defenseXP
                }]
            };
        }
    } else {
        // Award defense XP for dodging
        const defenseXP = awardBattleActionXP('dodge', 0, false, true);
        
        setDamageDisplay(prev => ({ ...prev, player: 'MISS' }));
        setTimeout(() => setDamageDisplay(prev => ({ ...prev, player: null })), 1000);
        
        return {
            ...battle,
            enemyProgress: 0,
            battleLog: [...battle.battleLog, {
                type: 'enemy_miss',
                message: `Enemy misses!`,
                skillXP: defenseXP
            }]
        };
    }
};

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

export const createSpawnTimer = (setIsWaitingForEnemy, setEnemySpawnProgress, onComplete) => {
    setIsWaitingForEnemy(true);
    setEnemySpawnProgress(0);
    
    const duration = 5000;
    const interval = 50;
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