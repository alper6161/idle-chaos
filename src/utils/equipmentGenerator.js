// Equipment Generator System

import { EQUIPMENT_TEMPLATES, ITEM_LEVEL_RANGES, addLevelToItem } from './items.js';

const DIFFICULTY_LEVELS = {
    EASY: { minLevel: 1, maxLevel: 10, rarityBonus: 0 },
    NORMAL: { minLevel: 11, maxLevel: 30, rarityBonus: 0.1 },
    HARD: { minLevel: 31, maxLevel: 60, rarityBonus: 0.2 },
    VERY_HARD: { minLevel: 61, maxLevel: 80, rarityBonus: 0.3 },
    IMPOSSIBLE: { minLevel: 81, maxLevel: 100, rarityBonus: 0.4 }
};

const BASE_RARITY_CHANCES = {
    common: 0.8,
    uncommon: 0.15,
    rare: 0.04,
    epic: 0.008,
    legendary: 0.002
};

const LEVEL_SCALING = {
    common: 0.8,
    uncommon: 1.0,
    rare: 1.3,
    epic: 1.6,
    legendary: 2.0
};

const STAT_VARIATIONS = {
    common: { min: 0.6, max: 1.0 },
    uncommon: { min: 0.7, max: 1.1 },
    rare: { min: 0.8, max: 1.2 },
    epic: { min: 0.9, max: 1.3 },
    legendary: { min: 1.0, max: 1.4 }
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

let equipmentCounter = 1000;

const generateEquipmentId = () => {
    const timestamp = Date.now();
    const uniqueId = timestamp * 1000 + equipmentCounter;
    equipmentCounter++;
    return uniqueId;
};

const getEnemyDifficulty = (enemy) => {
    if (!enemy) return 'EASY';
    
    const totalPower = (enemy.maxHp || 0) + (enemy.ATK || 0) * 2 + (enemy.DEF || 0);
    
    if (totalPower <= 50) return 'EASY';
    if (totalPower <= 100) return 'NORMAL';
    if (totalPower <= 200) return 'HARD';
    if (totalPower <= 350) return 'VERY_HARD';
    return 'IMPOSSIBLE';
};

const generateItemLevel = (difficulty) => {
    const minimumLevels = {
        EASY: 1,
        NORMAL: 10,
        HARD: 25,
        VERY_HARD: 40,
        IMPOSSIBLE: 50
    };
    
    const levelRange = DIFFICULTY_LEVELS[difficulty];
    if (!levelRange) return minimumLevels.EASY;
    
    const minLevel = Math.max(levelRange.minLevel, minimumLevels[difficulty] || 1);
    const maxLevel = levelRange.maxLevel;
    
    return Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
};

const determineRarity = (difficulty) => {
    const baseRarityChances = {
        common: 0.7,
        uncommon: 0.2,
        rare: 0.08,
        epic: 0.015,
        legendary: 0.005
    };
    
    const difficultyMultipliers = {
        EASY: { common: 1.0, uncommon: 1.0, rare: 1.0, epic: 1.0, legendary: 1.0 },
        NORMAL: { common: 0.9, uncommon: 1.1, rare: 1.2, epic: 1.3, legendary: 1.4 },
        HARD: { common: 0.8, uncommon: 1.2, rare: 1.4, epic: 1.6, legendary: 1.8 },
        VERY_HARD: { common: 0.7, uncommon: 1.3, rare: 1.6, epic: 2.0, legendary: 2.5 },
        IMPOSSIBLE: { common: 0.6, uncommon: 1.4, rare: 1.8, epic: 2.5, legendary: 3.0 }
    };
    
    const multipliers = difficultyMultipliers[difficulty] || difficultyMultipliers.EASY;
    
    const adjustedChances = {};
    let totalChance = 0;
    
    for (const [rarity, baseChance] of Object.entries(baseRarityChances)) {
        const multiplier = multipliers[rarity];
        const adjustedChance = baseChance * multiplier;
        adjustedChances[rarity] = adjustedChance;
        totalChance += adjustedChance;
    }
    
    const normalizedChances = {};
    for (const [rarity, chance] of Object.entries(adjustedChances)) {
        normalizedChances[rarity] = chance / totalChance;
    }
    
    const rand = Math.random();
    let cumulative = 0;
    
    for (const [rarity, chance] of Object.entries(normalizedChances)) {
        cumulative += chance;
        if (rand <= cumulative) {
            return rarity;
        }
    }
    
    return 'common';
};

const applyLevelScaling = (baseStat, level, rarity) => {
    const rarityMultiplier = LEVEL_SCALING[rarity] || 1.0;
    const levelMultiplier = 1 + (level - 1) * 0.1;
    return Math.floor(baseStat * rarityMultiplier * levelMultiplier);
};

const applyRarityScaling = (baseStat, rarity) => {
    const rarityMultipliers = {
        common: 0.8,
        uncommon: 1.0,
        rare: 1.3,
        epic: 1.6,
        legendary: 2.0
    };
    
    const multiplier = rarityMultipliers[rarity] || 0.8;
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
    
    const additionalStatCount = {
        common: 0,
        uncommon: Math.random() < 0.2 ? 1 : 0,
        rare: Math.random() < 0.5 ? 1 : 0,
        epic: Math.random() < 0.3 ? 2 : 1,
        legendary: Math.random() < 0.6 ? 3 : 2
    };

    const count = additionalStatCount[rarity] || 0;
    
    for (let i = 0; i < count; i++) {
        const randomStat = statsPool[Math.floor(Math.random() * statsPool.length)];
        if (!additionalStats[randomStat.stat]) {
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

        if (template.weaponType) {
            equipment.weaponType = template.weaponType;
        }

        Object.entries(template.baseStats).forEach(([stat, value]) => {
            const rarityScaledValue = applyRarityScaling(value, finalRarity);
            const scaledValue = applyLevelScaling(rarityScaledValue, itemLevel, finalRarity);
            equipment.stats[stat] = applyStatVariation(scaledValue, finalRarity);
        });

        const additionalStats = getRandomAdditionalStats(template.type, finalRarity, itemLevel);
        Object.assign(equipment.stats, additionalStats);

        return equipment;
    } catch (error) {
        console.error('Error generating equipment:', error);
        return null;
    }
};

export const convertLootBagToEquipment = (lootBagItems, enemy = null) => {
    const equipment = [];
    
    try {
        if (!Array.isArray(lootBagItems)) {
            console.warn('lootBagItems is not an array:', lootBagItems);
            return equipment;
        }
        
        lootBagItems.forEach((item, index) => {
            try {
                if (typeof item === 'string' && (item.includes('💰') || item.includes('gold'))) {
                    return;
                }
                
                let itemName;
                if (typeof item === 'string') {
                    itemName = item
                        .replace(/[⚔️🛡️💍👑📦]/g, '')
                        .replace(/[💰]/g, '')
                        .replace(/gold'a satıldı/g, '')
                        .trim();
                } else if (item && typeof item === 'object' && item.name) {
                    itemName = item.name;
                } else {
                    console.warn('Invalid item format:', item);
                    return;
                }
                
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

const getSlotKey = (key, slotNumber) => `${key}_slot_${slotNumber}`;

const getCurrentSlot = () => {
    try {
        const currentSlot = localStorage.getItem('idle-chaos-current-slot');
        return currentSlot ? parseInt(currentSlot) : 1;
    } catch (error) {
        console.error('Error getting current slot:', error);
        return 1;
    }
};

export const clearProcessedLootBag = () => {
    const currentSlot = getCurrentSlot();
    const slotKey = getSlotKey("lootBag", currentSlot);
    localStorage.removeItem(slotKey);
}; 