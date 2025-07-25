import { applyDamageMultiplier, applyGoldMultiplier } from './buffUtils.js';
import { awardBattleActionXP, getAttackTypeFromWeapon, getEquippedWeapon, getSkillData } from './skillExperience.js';
import { calculateSkillBuffs, calculateSkillBuffsForAttackType, getEquippedItems } from './playerStats.js';
import { Box, Typography } from '@mui/material';
import { SKILL_LEVEL_BONUSES, MAGIC_TYPES } from './constants.js';
import { PETS } from './pets.js';

export const calculateDamageRange = (minDMG, maxDMG, defenderDEF, damageRangeBonus = 0, skillBuffs = {}, attackType = null) => {
    // Ensure we have valid numbers
    const minDamage = Number(minDMG) || 0;
    const maxDamage = Number(maxDMG) || 0;
    const bonus = Number(damageRangeBonus) || 0;
    
    // 3 Aşamalı MIN_DAMAGE ve MAX_DAMAGE Bonus hesaplaması
    let totalMinDamageBonus = 0;
    let totalMaxDamageBonus = 0;
    
    // Aşama 1: Skill Level Bonus - MIN_DAMAGE ve MAX_DAMAGE olarak
    if (attackType && SKILL_LEVEL_BONUSES[attackType]) {
        const skillData = getSkillData();
        const skillCategory = getSkillCategory(attackType);
        const skillLevel = skillData[skillCategory]?.[attackType]?.level || 0;
        const skillMinDamageBonus = SKILL_LEVEL_BONUSES[attackType].MIN_DAMAGE || 0;
        const skillMaxDamageBonus = SKILL_LEVEL_BONUSES[attackType].MAX_DAMAGE || 0;
        const skillMinBonus = skillLevel * skillMinDamageBonus;
        const skillMaxBonus = skillLevel * skillMaxDamageBonus;
        console.log('skillMinBonus', skillMinBonus, 'skillMaxBonus', skillMaxBonus);
        totalMinDamageBonus += skillMinBonus;
        totalMaxDamageBonus += skillMaxBonus;
    }

    // Aşama 2: Pet ve Mastery Bonusları - MIN_DAMAGE ve MAX_DAMAGE olarak
    const petBonuses = getPetBonuses();
    if (petBonuses && petBonuses.minDamage) {
        totalMinDamageBonus += petBonuses.minDamage;
    }
    if (petBonuses && petBonuses.maxDamage) {
        totalMaxDamageBonus += petBonuses.maxDamage;
    }
    
    // Mastery bonusları (eğer varsa)
    const masteryBonuses = getMasteryBonuses();
    if (masteryBonuses && masteryBonuses.MIN_DAMAGE) {
        totalMinDamageBonus += masteryBonuses.MIN_DAMAGE;
    }
    if (masteryBonuses && masteryBonuses.MAX_DAMAGE) {
        totalMaxDamageBonus += masteryBonuses.MAX_DAMAGE;
    }
    
    // Aşama 3: Item Bonusları - MIN_DAMAGE ve MAX_DAMAGE olarak
    const equippedItems = getEquippedItems();
    
    Object.values(equippedItems).forEach(item => {
        if (item && item.stats) {
            console.log(item);
            // MIN_DAMAGE bonusu
            if (item.stats.MIN_DAMAGE) {
                totalMinDamageBonus += item.stats.MIN_DAMAGE;
            }
            
            // MAX_DAMAGE bonusu
            if (item.stats.MAX_DAMAGE) {
                totalMaxDamageBonus += item.stats.MAX_DAMAGE;
            }
            
            // Attack type'a özel MIN_DAMAGE bonusu (eğer varsa)
            if (attackType && item.stats[`${attackType.toUpperCase()}_MIN_DAMAGE`]) {
                totalMinDamageBonus += item.stats[`${attackType.toUpperCase()}_MIN_DAMAGE`];
            }
            
            // Attack type'a özel MAX_DAMAGE bonusu (eğer varsa)
            if (attackType && item.stats[`${attackType.toUpperCase()}_MAX_DAMAGE`]) {
                totalMaxDamageBonus += item.stats[`${attackType.toUpperCase()}_MAX_DAMAGE`];
            }
        }
    });
    
    return {
        min: Math.max(1, totalMinDamageBonus),
        max: Math.max(1, totalMaxDamageBonus)
    };
};

export const calculateDamage = (minDMG, maxDMG, defenderDEF, damageRangeBonus = 0, skillBuffs = {}, attackType = null) => {
    // Ensure we have valid numbers
    const minDamage = Number(minDMG) || 0;
    const maxDamage = Number(maxDMG) || 0;
    const def = Number(defenderDEF) || 0;
    const bonus = Number(damageRangeBonus) || 0;
    
    const damageRange = calculateDamageRange(minDamage, maxDamage, def, bonus, skillBuffs, attackType);
    
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
    let attackType;
    if (selectedAttackType) {
        attackType = selectedAttackType;
    } else {
        const equippedWeapon = getEquippedWeapon();
        attackType = getAttackTypeFromWeapon(equippedWeapon);
    }
    
    const skillBuffs = calculateSkillBuffsForAttackType(attackType);
    console.log('skillBuffs', skillBuffs);
    console.log('battle', battle);
    console.log('attackType', attackType);

    const hitChance = calculateAccuracy(battle.player.ATK, battle.enemy.DEF, attackType);
    console.log('hit Chance', hitChance);
    const hitRoll = Math.random() * 100;
    
    if (hitRoll <= hitChance) {
        const critRoll = Math.random() * 100;
        const effectiveCritChance = (battle.player.CRIT_CHANCE || 5);
        const isCrit = critRoll <= effectiveCritChance;
        
        let damage = calculateDamage(battle.player.MIN_DAMAGE || 0, battle.player.MAX_DAMAGE || 0, battle.enemy.DEF, 0, skillBuffs, attackType);
        console.log('Damage', damage);

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

export const processEnemyAttack = (battle, setDamageDisplay) => {
            const hitChance = calculateAccuracy(battle.enemy.ATK, battle.player.DEF);
    const hitRoll = Math.random() * 100;
    
    if (hitRoll <= hitChance) {
        const critRoll = Math.random() * 100;
        const isCrit = critRoll <= (battle.enemy.CRIT_CHANCE || 3);
        
        let damage = calculateDamage(battle.enemy.BASE_DAMAGE_MIN || 0, battle.enemy.BASE_DAMAGE_MAX || 0, battle.player.DEF, 0, {}, null); // Enemies don't get skill bonuses
        
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

// Pure functions moved from Battle.jsx

/**
 * Get stat display with achievement check
 * @param {string} enemyId - Enemy ID
 * @param {string} statType - Stat type (hp, atk, def, etc.)
 * @param {number} value - Stat value
 * @param {Function} isAchievementUnlocked - Achievement check function
 * @returns {string} Formatted stat display
 */
export const getStatDisplayWithAchievement = (enemyId, statType, value, isAchievementUnlocked) => {
    return getStatDisplay(enemyId, statType, value, isAchievementUnlocked);
};

/**
 * Get enemy HP display with achievement check
 * @param {string} enemyId - Enemy ID
 * @param {number} current - Current HP
 * @param {number} max - Max HP
 * @param {Function} isAchievementUnlocked - Achievement check function
 * @returns {string} Formatted HP display
 */
export const getEnemyHpDisplayWithAchievement = (enemyId, current, max, isAchievementUnlocked) => {
    return getEnemyHpDisplay(enemyId, current, max, isAchievementUnlocked);
};

/**
 * Get selected skill level and bonuses
 * @param {string} selectedAttackType - Selected attack type
 * @param {Function} getSkillData - Function to get skill data
 * @returns {Object} Skill level and bonuses
 */
export const getSelectedSkillInfo = (selectedAttackType, getSkillData) => {
    if (!selectedAttackType) return { level: 0, bonuses: null };
    
    const skillData = getSkillData();
    let skillLevel = 0;
    
    // Find the skill level in all categories
    Object.values(skillData).forEach(category => {
        if (category[selectedAttackType]) {
            skillLevel = category[selectedAttackType].level || 0;
        }
    });
    
    const bonuses = SKILL_LEVEL_BONUSES[selectedAttackType];
    
    return { level: skillLevel, bonuses };
};

/**
 * Render loot tooltip content
 * @param {Object} enemy - Enemy object
 * @param {Function} t - Translation function
 * @returns {JSX.Element} Tooltip content
 */
export const renderLootTooltip = (enemy, t) => {
    return (
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
};

/**
 * Handle chest click logic
 * @param {string} chestItem - Chest item name
 * @param {number} index - Item index
 * @param {Array} DUNGEONS - Dungeons array
 * @param {Function} handleTakeItem - Function to handle taking item
 * @param {Function} setChestPreviewModal - Function to set chest preview modal
 * @returns {Object|null} Dungeon object if found, null otherwise
 */
export const handleChestClickLogic = (chestItem, index, DUNGEONS, handleTakeItem, setChestPreviewModal) => {
    // Extract dungeon name from chest item (backwards compatibility)
    const dungeonName = chestItem.replace('🎁 ', '').replace(' Chest', '');
    const dungeon = DUNGEONS.find(d => d.name === dungeonName);
    
    if (!dungeon || !dungeon.chest) {
        // If it's not an old-style chest, treat it as a regular item
        handleTakeItem(chestItem, index);
        return null;
    }
    
    // For old-style chest items, show preview modal
    setChestPreviewModal({
        open: true,
        dungeon: dungeon,
        chestItem: chestItem
    });
    
    return dungeon;
};

/**
 * Handle opening chest logic
 * @param {Object} chestPreviewModal - Chest preview modal state
 * @param {Function} convertLootBagToEquipment - Function to convert loot to equipment
 * @param {Function} addToInventory - Function to add item to inventory
 * @param {Function} setChestDropDialog - Function to set chest drop dialog
 * @param {Function} setChestPreviewModal - Function to set chest preview modal
 * @param {Function} addNotification - Function to add notification
 * @returns {Object|null} Selected item if successful, null otherwise
 */
export const handleOpenChestLogic = (
    chestPreviewModal, 
    convertLootBagToEquipment, 
    addToInventory, 
    setChestDropDialog, 
    setChestPreviewModal, 
    addNotification
) => {
    const { dungeon, chestItem } = chestPreviewModal;
    
    if (!dungeon || !dungeon.chest) return null;
    
    // Random selection based on chances
    const totalChance = dungeon.chest.reduce((sum, item) => sum + item.chance, 0);
    const random = Math.random() * totalChance;
    let currentChance = 0;
    let selectedItem = null;
    
    for (const item of dungeon.chest) {
        currentChance += item.chance;
        if (random <= currentChance) {
            selectedItem = item;
            break;
        }
    }
    
    if (!selectedItem) selectedItem = dungeon.chest[0]; // Fallback
    
    // Generate equipment from the selected item
    const equipment = convertLootBagToEquipment([selectedItem.name]);
    
    if (equipment.length > 0) {
        // Add to inventory
        try {
            addToInventory(equipment[0]);
            
            // Show drop dialog
            setChestDropDialog({
                open: true,
                item: equipment[0],
                dungeon: dungeon
            });
            
            // Close preview modal
            setChestPreviewModal({ open: false, dungeon: null, chestItem: null });
            
            // Remove chest from loot bag
            // Note: This would need to be handled by the calling component
            
            addNotification({
                type: 'success',
                title: 'Chest Opened!',
                message: `You found ${equipment[0].name}!`,
                duration: 3000
            });
            
            return selectedItem;
        } catch (error) {
            console.error('Error adding equipment to inventory:', error);
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to add item to inventory',
                duration: 3000
            });
        }
    }
    
    return null;
}; 

export function calculateAccuracy(skill, defense, attackType = null) {
    // Magic attacks always have 100% accuracy
    if (attackType && MAGIC_TYPES.includes(attackType)) {
        return 100;
    }
    
    // 3 Aşamalı ATK hesaplaması
    let totalATK = 0;
    
    // Aşama 1: Skill Level Bonus
    if (attackType && SKILL_LEVEL_BONUSES[attackType]) {
        const skillData = getSkillData();
        const skillCategory = getSkillCategory(attackType);
        const skillLevel = skillData[skillCategory]?.[attackType]?.level || 0;
        const skillBonus = SKILL_LEVEL_BONUSES[attackType].ATK || 0;
        const skillATKBonus = skillLevel * skillBonus;
        console.log('skillATKBonus', skillATKBonus);
        totalATK += skillATKBonus;
    }

    // Aşama 2: Pet ve Mastery Bonusları
    const petBonuses = getPetBonuses();
    if (petBonuses && petBonuses.attack) {
        totalATK += petBonuses.attack;
    }
    
    // Mastery bonusları (eğer varsa)
    const masteryBonuses = getMasteryBonuses();
    if (masteryBonuses && masteryBonuses.ATK) {
        totalATK += masteryBonuses.ATK;
    }
    
    // Aşama 3: Item Bonusları
    const equippedItems = getEquippedItems();
    let itemATKBonus = 0;
    
    Object.values(equippedItems).forEach(item => {
        if (item && item.stats) {
            console.log(item);
            // Genel ATK bonusu
            if (item.stats.ATK) {
                itemATKBonus += item.stats.ATK;
            }
            
            // Attack type'a özel bonus (eğer varsa)
            if (attackType && item.stats[`${attackType.toUpperCase()}_BONUS`]) {
                itemATKBonus += item.stats[`${attackType.toUpperCase()}_BONUS`];
            }
        }
    });
    
    totalATK += itemATKBonus;

    // Final accuracy hesaplaması
    if (Math.round(totalATK) === Math.round(defense)) return 25;
    if (totalATK > defense) {
        const diff = totalATK - defense;
        console.log('+ diff', diff);
        return Math.min(100, 25 + getCoreAccuracyFormula(diff));
    } else {
        const diff = defense - totalATK;
        console.log('- diff', diff);
        return Math.max(5, 25 - getCoreAccuracyFormula(diff));
    }
}

function getCoreAccuracyFormula(diff) {
    const k = 40;
    if (diff >= 0) {
        return Math.floor(75 * (1 - Math.exp(-diff / k)));
    } else {
        return Math.floor(75 * Math.exp(diff / k));
    }
}



export function getPetBonuses() {
    const currentSlot = getCurrentSlot();
    const petKey = getSlotKey('idle-chaos-pets', currentSlot);
    const equippedPets = JSON.parse(localStorage.getItem(petKey) || '[]');
    
    const bonuses = {
        attack: 0,
        defense: 0,
        health: 0,
        attackSpeed: 0,
        criticalChance: 0,
        criticalDamage: 0,
        dodge: 0,
        lifeSteal: 0,
        fireResistance: 0,
        iceResistance: 0,
        lightningResistance: 0,
        poisonResistance: 0,
        shadowResistance: 0,
        darkResistance: 0,
        lightResistance: 0,
        earthResistance: 0,
        voidResistance: 0,
        allResistance: 0
    };

    if (!equippedPets || !Array.isArray(equippedPets)) return bonuses;

    equippedPets.forEach(petId => {
        const pet = PETS[petId];
        if (pet && pet.bonuses) {
            Object.keys(pet.bonuses).forEach(stat => {
                if (bonuses.hasOwnProperty(stat)) {
                    bonuses[stat] += pet.bonuses[stat];
                }
            });
        }
    });

    return bonuses;
}

export function getSkillCategory(attackType) {
    const skillCategories = {
        // Melee skills
        stab: 'melee',
        slash: 'melee', 
        crush: 'melee',
        
        // Ranged skills
        archery: 'ranged',
        throwing: 'ranged',
        poison: 'ranged',
        
        // Magic skills
        lightning: 'magic',
        fire: 'magic',
        ice: 'magic',
        
        // Defence skills
        block: 'defence',
        dodge: 'defence',
        armor: 'defence',
        
        // Hitpool skills
        hp: 'hitpool',
        heal: 'hitpool',
        buff: 'hitpool',
        
        // Holy skills
        critChance: 'holy',
        critDamage: 'holy',
        lifeSteal: 'holy',
        counterAttack: 'holy',
        doubleAttack: 'holy'
    };
    
    return skillCategories[attackType] || null;
}

export function getMasteryBonuses() {
    return {
        ATK: 0,
        DEF: 0,
        HEALTH: 0
    };
}

export function getLootDrop(drops) {
    const items = [];
    const goldItems = [];
    let totalGold = 0;
    
    drops.forEach(drop => {
        if (Math.random() < drop.chance) {
            if (drop.type === "equipment") {
                items.push(drop.name);
            } else if (drop.type === "gold") {
                const buffedValue = applyGoldMultiplier(drop.value);
                goldItems.push({ name: drop.name, value: buffedValue });
                totalGold += buffedValue;
            }
        }
    });
    
    return {
        items: items,
        goldItems: goldItems,
        gold: totalGold
    };
} 