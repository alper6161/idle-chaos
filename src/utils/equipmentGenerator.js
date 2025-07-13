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

// Determine final rarity with difficulty bonus
const determineRarity = (baseRarity, difficulty) => {
    const difficultyConfig = DIFFICULTY_LEVELS[difficulty];
    if (!difficultyConfig) return baseRarity;
    
    const rarityUpgradeChance = difficultyConfig.rarityBonus;
    const rand = Math.random();
    
    // Chance to upgrade rarity based on difficulty
    if (rand < rarityUpgradeChance) {
        const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
        const currentIndex = rarityOrder.indexOf(baseRarity);
        if (currentIndex < rarityOrder.length - 1) {
            return rarityOrder[currentIndex + 1];
        }
    }
    
    return baseRarity;
};

// Apply level scaling to stats
const applyLevelScaling = (baseStat, level, rarity) => {
    const rarityMultiplier = LEVEL_SCALING[rarity] || 1.0;
    const levelMultiplier = 1 + (level - 1) * 0.1; // 10% increase per level
    return Math.floor(baseStat * rarityMultiplier * levelMultiplier);
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

        // Determine difficulty and generate level
        const difficulty = getEnemyDifficulty(enemy);
        const itemLevel = generateItemLevel(difficulty);
        const finalRarity = determineRarity(template.baseRarity, difficulty);

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

        // Apply base stats with level scaling and variation
        Object.entries(template.baseStats).forEach(([stat, value]) => {
            const scaledValue = applyLevelScaling(value, itemLevel, finalRarity);
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
                    itemName = item;
                } else if (item && typeof item === 'object' && item.name) {
                    itemName = item.name;
                } else {
                    console.warn('Invalid item format:', item);
                    return;
                }
                
                const generatedEquipment = generateEquipmentFromName(itemName, enemy);
                
                if (generatedEquipment) {
                    equipment.push(generatedEquipment);
                } else {
                    console.warn(`No template found for equipment: ${itemName}`);
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