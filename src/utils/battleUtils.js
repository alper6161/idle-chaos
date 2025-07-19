import { applyDamageMultiplier } from './buffUtils.js';
import { awardBattleActionXP, getAttackTypeFromWeapon, getEquippedWeapon } from './skillExperience.js';
import { calculateSkillBuffs, calculateSkillBuffsForAttackType } from './playerStats.js';

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

export const calculateDamageRange = (attackerATK, defenderDEF, damageRangeBonus = 0, skillBuffs = {}) => {
    // Ensure we have valid numbers
    const atk = Number(attackerATK) || 0;
    const def = Number(defenderDEF) || 0;
    const bonus = Number(damageRangeBonus) || 0;
    
    // Apply skill level bonuses
    const minDamageBonus = skillBuffs.MIN_DAMAGE || 0;
    const maxDamageBonus = skillBuffs.MAX_DAMAGE || 0;
    
    let baseDamage = atk - (def * 0.5);
    baseDamage = Math.max(1, baseDamage);
    
    // Calculate damage range (min and max)
    const variation = baseDamage * 0.15; // 15% variation
    let minDamage = Math.floor(baseDamage - variation);
    let maxDamage = Math.floor(baseDamage + variation);
    
    // Apply skill level bonuses to damage range
    minDamage += minDamageBonus;
    maxDamage += maxDamageBonus;
    
    // Apply slash skill bonus to max damage
    maxDamage += bonus;
    
    return {
        min: Math.max(1, minDamage),
        max: Math.max(1, maxDamage)
    };
};

export const calculateDamage = (attackerATK, defenderDEF, damageRangeBonus = 0, skillBuffs = {}) => {
    // Ensure we have valid numbers
    const atk = Number(attackerATK) || 0;
    const def = Number(defenderDEF) || 0;
    const bonus = Number(damageRangeBonus) || 0;
    
    const damageRange = calculateDamageRange(atk, def, bonus, skillBuffs);
    
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

export const processPlayerAttack = (battle, setDamageDisplay, selectedAttackType = null) => {
    // Use selected attack type or determine from equipped weapon
    let attackType;
    if (selectedAttackType) {
        attackType = selectedAttackType;
    } else {
        const equippedWeapon = getEquippedWeapon();
        attackType = getAttackTypeFromWeapon(equippedWeapon);
    }
    
    // Calculate skill buffs based on selected attack type only
    const skillBuffs = calculateSkillBuffsForAttackType(attackType);
    const atkBonus = skillBuffs.ATK || 0;
    
    // Apply ATK bonus from skill levels
    const effectiveATK = battle.player.ATK + atkBonus;
    
    const hitChance = calculateHitChance(effectiveATK, battle.enemy.DEF, 0);
    const hitRoll = Math.random() * 100;
    
    if (hitRoll <= hitChance) {
        const critRoll = Math.random() * 100;
        const effectiveCritChance = (battle.player.CRIT_CHANCE || 5);
        const isCrit = critRoll <= effectiveCritChance;
        
        let damage = calculateDamage(effectiveATK, battle.enemy.DEF, 0, skillBuffs);
        
        // Apply damage buff
        damage = applyDamageMultiplier(damage);
        
        // Award skill experience for the attack
        const xpResult = awardBattleActionXP(attackType, damage, isCrit, true);
        
        if (isCrit) {
            // Apply crit damage
            const totalCritDamage = (battle.player.CRIT_DAMAGE || 150);
            damage = Math.floor(damage * (totalCritDamage / 100));
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
        
        let damage = calculateDamage(battle.enemy.ATK, battle.player.DEF, 0, {}); // Enemies don't get skill bonuses
        
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

// Helper functions moved from Battle.jsx

/**
 * Get difficulty color based on enemy HP
 * @param {Object} enemy - Enemy object with maxHp property
 * @returns {string} Color hex code
 */
export const getDifficultyColor = (enemy) => {
    // Easy enemies (HP <= 40)
    if (enemy.maxHp <= 40) return '#4caf50'; // Easy - Green
    // Normal enemies (HP 41-90)
    if (enemy.maxHp <= 90) return '#ff9800'; // Normal - Orange
    // Hard enemies (HP 91-130)
    if (enemy.maxHp <= 130) return '#f44336'; // Hard - Red
    // Very Hard enemies (HP 131-200)
    if (enemy.maxHp <= 200) return '#9c27b0'; // Very Hard - Purple
    // Impossible enemies (HP > 200)
    return '#212121'; // Impossible - Dark Gray/Black
};

/**
 * Get difficulty text based on enemy HP
 * @param {Object} enemy - Enemy object with maxHp property
 * @returns {string} Difficulty text
 */
export const getDifficultyText = (enemy) => {
    // Easy enemies (HP <= 40)
    if (enemy.maxHp <= 40) return 'Easy';
    // Normal enemies (HP 41-90)
    if (enemy.maxHp <= 90) return 'Normal';
    // Hard enemies (HP 91-130)
    if (enemy.maxHp <= 130) return 'Hard';
    // Very Hard enemies (HP 131-200)
    if (enemy.maxHp <= 200) return 'Very Hard';
    // Impossible enemies (HP > 200)
    return 'Impossible';
};

/**
 * Get threshold for achievement unlocking based on stat type
 * @param {string} statType - Type of stat (hp, atk, def, etc.)
 * @returns {number} Threshold value
 */
export const getThresholdForStat = (statType) => {
    switch (statType) {
        case 'hp': return 10;
        case 'atk': return 25;
        case 'def': return 50;
        case 'attack_speed': return 25; 
        case 'crit_chance': return 25;
        case 'crit_damage': return 25;
        case 'hit_chance': return 25;
        default: return 100;
    }
};

/**
 * Get stat display value based on achievement unlock status
 * @param {string} enemyId - Enemy ID for achievement check
 * @param {string} statType - Type of stat
 * @param {number} value - Stat value
 * @param {Function} isAchievementUnlocked - Achievement check function
 * @returns {string} Display value or empty string if locked
 */
export const getStatDisplay = (enemyId, statType, value, isAchievementUnlocked) => {
    const isUnlocked = isAchievementUnlocked(enemyId, getThresholdForStat(statType));
    if (isUnlocked) {
        return value !== undefined && value !== null ? value.toString() : "0";
    } else {
        return "";
    }
};

/**
 * Get enemy HP display safely based on achievement unlock status
 * @param {string} enemyId - Enemy ID for achievement check
 * @param {number} current - Current HP
 * @param {number} max - Max HP
 * @param {Function} isAchievementUnlocked - Achievement check function
 * @returns {string} HP display string
 */
export const getEnemyHpDisplay = (enemyId, current, max, isAchievementUnlocked) => {
    return getStatDisplay(enemyId, 'hp', max, isAchievementUnlocked) === "" ? "???" : `${current}/${max}`;
};

/**
 * Calculate item sell value based on estimated rarity and level
 * @param {string} itemName - Name of the item
 * @returns {number} Calculated sell value
 */
export const calculateItemSellValue = (itemName) => {
    // Base values per estimated rarity (based on item name patterns)
    const baseValues = {
        common: 10,
        uncommon: 25,
        rare: 60,
        epic: 150,
        legendary: 400
    };
    
    // Estimate rarity based on item name patterns
    let rarity = 'common';
    const itemLower = itemName.toLowerCase();
    
    if (itemLower.includes('legendary') || itemLower.includes('dragon') || itemLower.includes('celestial') || itemLower.includes('ancient') || itemLower.includes('void')) {
        rarity = 'legendary';
    } else if (itemLower.includes('epic') || itemLower.includes('demon') || itemLower.includes('infernal') || itemLower.includes('archdemon')) {
        rarity = 'epic';
    } else if (itemLower.includes('rare') || itemLower.includes('bone') || itemLower.includes('spider') || itemLower.includes('skeleton')) {
        rarity = 'rare';
    } else if (itemLower.includes('uncommon') || itemLower.includes('slime') || itemLower.includes('orc')) {
        rarity = 'uncommon';
    }
    
    // Deterministic level based on item name (same item = same level)
    let hash = 0;
    for (let i = 0; i < itemName.length; i++) {
        const char = itemName.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    const estimatedLevel = Math.abs(hash % 50) + 1; // 1-50 range
    const levelMultiplier = 1 + (estimatedLevel - 1) * 0.1;
    
    const rarityMultiplier = baseValues[rarity];
    const totalValue = Math.floor(rarityMultiplier * levelMultiplier);
    
    return Math.max(5, totalValue); // Minimum 5 gold
};

/**
 * Get slot-specific key for localStorage
 * @param {string} key - Base key name
 * @param {number} slotNumber - Slot number
 * @returns {string} Slot-specific key
 */
export const getSlotKey = (key, slotNumber) => `${key}_slot_${slotNumber}`;

/**
 * Get current slot number from localStorage
 * @returns {number} Current slot number (defaults to 1)
 */
export const getCurrentSlot = () => {
    try {
        const currentSlot = localStorage.getItem('idle-chaos-current-slot');
        return currentSlot ? parseInt(currentSlot) : 1;
    } catch (error) {
        console.error('Error getting current slot:', error);
        return 1;
    }
}; 