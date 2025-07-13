// Equipment Generator System
// Converts equipment names from combat drops into full equipment objects
// Now supports item levels and rarity variations based on monster difficulty

import { EQUIPMENT_TEMPLATES, ITEM_LEVEL_RANGES, addLevelToItem } from './items.js';

// Difficulty-based item level ranges
const DIFFICULTY_LEVELS = {
    EASY: { minLevel: 1, maxLevel: 10, rarityBonus: 0 },
    NORMAL: { minLevel: 11, maxLevel: 30, rarityBonus: 0.1 },
    HARD: { minLevel: 31, maxLevel: 60, rarityBonus: 0.2 },
    VERY_HARD: { minLevel: 61, maxLevel: 80, rarityBonus: 0.3 },
    IMPOSSIBLE: { minLevel: 81, maxLevel: 100, rarityBonus: 0.4 }
};

// Base rarity chances
const BASE_RARITY_CHANCES = {
    common: 0.6,
    uncommon: 0.25,
    rare: 0.1,
    epic: 0.04,
    legendary: 0.01
};

// Level scaling multipliers
const LEVEL_SCALING = {
    common: 1.0,
    uncommon: 1.2,
    rare: 1.5,
    epic: 2.0,
    legendary: 3.0
};

const STAT_VARIATIONS = {
    common: { min: 0.8, max: 1.2 },
    uncommon: { min: 0.9, max: 1.3 },
    rare: { min: 1.0, max: 1.4 },
    epic: { min: 1.1, max: 1.5 },
    legendary: { min: 1.2, max: 1.6 }
};

const ADDITIONAL_STATS_POOL = {
    weapon: [
        { stat: 'ATK', weight: 50 },
        { stat: 'CRIT_CHANCE', weight: 30 },
        { stat: 'CRIT_DAMAGE', weight: 25 },
        { stat: 'ATTACK_SPEED', weight: 20 },
        { stat: 'LIFE_STEAL', weight: 15 }
    ],
    armor: [
        { stat: 'DEF', weight: 50 },
        { stat: 'HEALTH', weight: 40 },
        { stat: 'BLOCK_CHANCE', weight: 25 },
        { stat: 'DODGE', weight: 20 },
        { stat: 'RESISTANCE', weight: 15 }
    ]
};

let equipmentCounter = 1000; // Start IDs from 1000 to avoid conflicts

const generateEquipmentId = () => {
    return ++equipmentCounter;
};

// Determine difficulty based on enemy stats
const getEnemyDifficulty = (enemy) => {
    if (!enemy) return 'EASY';
    
    const totalPower = (enemy.maxHp || 0) + (enemy.ATK || 0) * 2 + (enemy.DEF || 0);
    
    if (totalPower <= 50) return 'EASY';
    if (totalPower <= 100) return 'NORMAL';
    if (totalPower <= 200) return 'HARD';
    if (totalPower <= 350) return 'VERY_HARD';
    return 'IMPOSSIBLE';
};

// Generate item level based on difficulty
const generateItemLevel = (difficulty) => {
    const levelRange = DIFFICULTY_LEVELS[difficulty];
    if (!levelRange) return 1;
    
    return Math.floor(Math.random() * (levelRange.maxLevel - levelRange.minLevel + 1)) + levelRange.minLevel;
};

// Determine rarity with RNG - every item can drop with any rarity
const determineRarity = (difficulty) => {
    const difficultyConfig = DIFFICULTY_LEVELS[difficulty];
    const rarityBonus = difficultyConfig ? difficultyConfig.rarityBonus : 0;
    
    // Base rarity chances
    const rarityChances = {
        common: 0.6,
        uncommon: 0.25,
        rare: 0.1,
        epic: 0.04,
        legendary: 0.01
    };
    
    // Apply difficulty bonus to upgrade chances
    if (rarityBonus > 0) {
        const rand = Math.random();
        if (rand < rarityBonus) {
            // Upgrade rarity based on difficulty
            const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
            const upgradeChances = {
                common: 0.3,      // 30% chance to upgrade from common
                uncommon: 0.25,   // 25% chance to upgrade from uncommon
                rare: 0.2,        // 20% chance to upgrade from rare
                epic: 0.15        // 15% chance to upgrade from epic
            };
            
            // First determine base rarity
            const baseRand = Math.random();
            let cumulative = 0;
            let selectedRarity = 'common';
            
            for (const [rarity, chance] of Object.entries(rarityChances)) {
                cumulative += chance;
                if (baseRand <= cumulative) {
                    selectedRarity = rarity;
                    break;
                }
            }
            
            // Then apply upgrade chance
            const upgradeChance = upgradeChances[selectedRarity] || 0;
            if (Math.random() < upgradeChance) {
                const currentIndex = rarityOrder.indexOf(selectedRarity);
                if (currentIndex < rarityOrder.length - 1) {
                    return rarityOrder[currentIndex + 1];
                }
            }
            
            return selectedRarity;
        }
    }
    
    // Normal RNG without difficulty bonus
    const rand = Math.random();
    let cumulative = 0;
    
    for (const [rarity, chance] of Object.entries(rarityChances)) {
        cumulative += chance;
        if (rand <= cumulative) {
            return rarity;
        }
    }
    
    return 'common'; // Fallback
};

// Apply level scaling to stats
const applyLevelScaling = (baseStat, level, rarity) => {
    const rarityMultiplier = LEVEL_SCALING[rarity] || 1.0;
    const levelMultiplier = 1 + (level - 1) * 0.1; // 10% increase per level
    return Math.floor(baseStat * rarityMultiplier * levelMultiplier);
};

// Apply rarity scaling to base stats - higher rarity = higher base stats
const applyRarityScaling = (baseStat, rarity) => {
    const rarityMultipliers = {
        common: 1.0,
        uncommon: 1.3,
        rare: 1.6,
        epic: 2.0,
        legendary: 2.5
    };
    
    const multiplier = rarityMultipliers[rarity] || 1.0;
    return Math.floor(baseStat * multiplier);
};

const applyStatVariation = (baseStat, rarity) => {
    const variation = STAT_VARIATIONS[rarity] || STAT_VARIATIONS.common;
    const multiplier = variation.min + (Math.random() * (variation.max - variation.min));
    return Math.floor(baseStat * multiplier);
};

const getRandomAdditionalStats = (equipmentType, rarity, level) => {
    const additionalStats = {};
    const statsPool = ADDITIONAL_STATS_POOL[equipmentType === 'weapon' ? 'weapon' : 'armor'];
    
    // Number of additional stats based on rarity
    const additionalStatCount = {
        common: 0,
        uncommon: Math.random() < 0.3 ? 1 : 0,
        rare: Math.random() < 0.7 ? 1 : 0,
        epic: Math.random() < 0.5 ? 2 : 1,
        legendary: Math.random() < 0.8 ? 3 : 2
    };

    const count = additionalStatCount[rarity] || 0;
    
    for (let i = 0; i < count; i++) {
        const randomStat = statsPool[Math.floor(Math.random() * statsPool.length)];
        if (!additionalStats[randomStat.stat]) {
            // Generate stat value based on rarity and level
            const baseValue = {
                ATK: 3, DEF: 2, HEALTH: 10, CRIT_CHANCE: 3, CRIT_DAMAGE: 8,
                ATTACK_SPEED: 0.2, LIFE_STEAL: 5, BLOCK_CHANCE: 5, DODGE: 3, RESISTANCE: 2
            };
            
            const baseStat = baseValue[randomStat.stat] || 5;
            additionalStats[randomStat.stat] = applyLevelScaling(baseStat, level, rarity);
        }
    }
    
    return additionalStats;
};

export const generateEquipmentFromName = (equipmentName, enemy = null) => {
    try {
        if (!equipmentName || typeof equipmentName !== 'string') {
            console.warn('Invalid equipment name:', equipmentName);
            return null;
        }
        
        const template = EQUIPMENT_TEMPLATES[equipmentName];
        
        if (!template) {
            console.warn(`No template found for equipment: ${equipmentName}`);
            return null;
        }

        // Check if this item can drop from this enemy
        if (template.allowedEnemies && enemy) {
            const enemyId = enemy.id || enemy.name?.toLowerCase();
            if (!template.allowedEnemies.includes(enemyId)) {
                console.warn(`Item ${equipmentName} cannot drop from enemy ${enemyId}`);
                return null;
            }
        }

        // Determine difficulty and generate level
        const difficulty = getEnemyDifficulty(enemy);
        const itemLevel = generateItemLevel(difficulty);
        const finalRarity = determineRarity(difficulty);

        const equipment = {
            id: generateEquipmentId(),
            name: equipmentName,
            type: template.type,
            rarity: finalRarity,
            level: itemLevel,
            stats: {}
        };

        // Add weaponType if it exists
        if (template.weaponType) {
            equipment.weaponType = template.weaponType;
        }

        // Apply base stats with rarity scaling, level scaling and variation
        Object.entries(template.baseStats).forEach(([stat, value]) => {
            // First apply rarity scaling to base stats
            const rarityScaledValue = applyRarityScaling(value, finalRarity);
            // Then apply level scaling
            const scaledValue = applyLevelScaling(rarityScaledValue, itemLevel, finalRarity);
            equipment.stats[stat] = applyStatVariation(scaledValue, finalRarity);
        });

        // Add random additional stats
        const additionalStats = getRandomAdditionalStats(template.type, finalRarity, itemLevel);
        Object.assign(equipment.stats, additionalStats);

        return equipment;
    } catch (error) {
        console.error('Error in generateEquipmentFromName:', error);
        return null;
    }
};

export const convertLootBagToEquipment = (lootBagItems, enemy = null) => {
    const equipment = [];
    
    try {
        // Ensure lootBagItems is an array
        if (!Array.isArray(lootBagItems)) {
            console.warn('lootBagItems is not an array:', lootBagItems);
            return equipment;
        }
        
        lootBagItems.forEach((item, index) => {
            try {
                // Skip gold items
                if (typeof item === 'string' && (item.includes('💰') || item.includes('gold'))) {
                    return;
                }
                
                // Handle both string and object items
                let itemName;
                if (typeof item === 'string') {
                    // Clean the item name - remove emojis, symbols, and extra spaces
                    itemName = item
                        .replace(/[⚔️🛡️💍👑📦]/g, '') // Remove equipment emojis
                        .replace(/[💰]/g, '') // Remove gold emoji
                        .replace(/gold'a satıldı/g, '') // Remove Turkish gold sold text
                        .trim(); // Remove extra spaces
                } else if (item && typeof item === 'object' && item.name) {
                    itemName = item.name;
                } else {
                    console.warn('Invalid item format:', item);
                    return;
                }
                
                // Skip empty item names
                if (!itemName || itemName.length === 0) {
                    console.warn('Empty item name after cleaning:', item);
                    return;
                }
                
                const generatedEquipment = generateEquipmentFromName(itemName, enemy);
                
                if (generatedEquipment) {
                    equipment.push(generatedEquipment);
                } else {
                    console.warn(`No template found for equipment: "${itemName}"`);
                }
            } catch (itemError) {
                console.error(`Error processing item ${index}:`, itemError);
            }
        });
        
        return equipment;
    } catch (error) {
        console.error('Error in convertLootBagToEquipment:', error);
        return equipment;
    }
};

export const clearProcessedLootBag = () => {
    localStorage.removeItem("lootBag");
}; 