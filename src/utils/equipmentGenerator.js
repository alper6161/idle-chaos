// Equipment Generator System
// Converts equipment names from combat drops into full equipment objects

const EQUIPMENT_TEMPLATES = {
    // Melee Weapons
    "Rusty Sword": {
        type: "weapon",
        weaponType: "melee",
        rarity: "common",
        baseStats: { ATK: 5, CRIT_CHANCE: 3 }
    },
    "Rat Fang Dagger": {
        type: "weapon",
        weaponType: "melee",
        rarity: "common",
        baseStats: { ATK: 4, CRIT_CHANCE: 8, ATTACK_SPEED: 0.3 }
    },
    "Bone Sword": {
        type: "weapon",
        weaponType: "melee",
        rarity: "uncommon",
        baseStats: { ATK: 8, CRIT_CHANCE: 5, CRIT_DAMAGE: 10 }
    },
    "Orc Axe": {
        type: "weapon",
        weaponType: "melee",
        rarity: "rare", 
        baseStats: { ATK: 12, CRIT_DAMAGE: 15 }
    },
    "Spider Fang Blade": {
        type: "weapon",
        weaponType: "melee",
        rarity: "rare",
        baseStats: { ATK: 10, CRIT_CHANCE: 12, ATTACK_SPEED: 0.4 }
    },
    "Troll Club": {
        type: "weapon",
        weaponType: "melee",
        rarity: "epic",
        baseStats: { ATK: 15, CRIT_CHANCE: 8, CRIT_DAMAGE: 20 }
    },
    "Dragon Flame Sword": {
        type: "weapon",
        weaponType: "melee",
        rarity: "legendary",
        baseStats: { ATK: 22, CRIT_CHANCE: 15, CRIT_DAMAGE: 35, FIRE_DAMAGE: 12 }
    },
    
    // NEW MELEE WEAPONS
    "Wolf Fang Dagger": {
        type: "weapon",
        weaponType: "melee",
        rarity: "uncommon",
        baseStats: { ATK: 7, CRIT_CHANCE: 10, ATTACK_SPEED: 0.3 }
    },
    "Zombie Hand Dagger": {
        type: "weapon",
        weaponType: "melee",
        rarity: "uncommon",
        baseStats: { ATK: 6, CRIT_CHANCE: 8, POISON_DAMAGE: 5 }
    },
    "Bandit Dagger": {
        type: "weapon",
        weaponType: "melee",
        rarity: "rare",
        baseStats: { ATK: 9, CRIT_CHANCE: 15, ATTACK_SPEED: 0.4 }
    },
    "Lizardman Spear": {
        type: "weapon",
        weaponType: "melee",
        rarity: "rare",
        baseStats: { ATK: 11, CRIT_CHANCE: 8, ATTACK_SPEED: 0.3 }
    },
    "Bee Stinger Dagger": {
        type: "weapon",
        weaponType: "melee",
        rarity: "uncommon",
        baseStats: { ATK: 5, CRIT_CHANCE: 12, POISON_DAMAGE: 8 }
    },
    "Cultist Staff": {
        type: "weapon",
        weaponType: "melee",
        rarity: "rare",
        baseStats: { ATK: 8, CRIT_CHANCE: 6, SHADOW_DAMAGE: 10 }
    },
    "Gargoyle Claw": {
        type: "weapon",
        weaponType: "melee",
        rarity: "epic",
        baseStats: { ATK: 14, CRIT_CHANCE: 10, CRIT_DAMAGE: 18 }
    },
    "Harpy Talon": {
        type: "weapon",
        weaponType: "melee",
        rarity: "rare",
        baseStats: { ATK: 10, CRIT_CHANCE: 12, ATTACK_SPEED: 0.4 }
    },
    "Minotaur Axe": {
        type: "weapon",
        weaponType: "melee",
        rarity: "epic",
        baseStats: { ATK: 16, CRIT_CHANCE: 8, CRIT_DAMAGE: 25 }
    },
    "Wraith Blade": {
        type: "weapon",
        weaponType: "melee",
        rarity: "epic",
        baseStats: { ATK: 13, CRIT_CHANCE: 10, SHADOW_DAMAGE: 15 }
    },
    "Werewolf Claw": {
        type: "weapon",
        weaponType: "melee",
        rarity: "epic",
        baseStats: { ATK: 12, CRIT_CHANCE: 15, ATTACK_SPEED: 0.5 }
    },
    "Golem Fist": {
        type: "weapon",
        weaponType: "melee",
        rarity: "epic",
        baseStats: { ATK: 18, CRIT_CHANCE: 6, CRIT_DAMAGE: 20 }
    },
    "Vampire Fang": {
        type: "weapon",
        weaponType: "melee",
        rarity: "epic",
        baseStats: { ATK: 11, CRIT_CHANCE: 12, LIFE_STEAL: 8 }
    },
    "Chimera Claw": {
        type: "weapon",
        weaponType: "melee",
        rarity: "epic",
        baseStats: { ATK: 15, CRIT_CHANCE: 10, CRIT_DAMAGE: 22 }
    },
    "Hydra Fang": {
        type: "weapon",
        weaponType: "melee",
        rarity: "legendary",
        baseStats: { ATK: 20, CRIT_CHANCE: 12, POISON_DAMAGE: 20 }
    },
    "Demon Blade": {
        type: "weapon",
        weaponType: "melee",
        rarity: "legendary",
        baseStats: { ATK: 24, CRIT_CHANCE: 15, FIRE_DAMAGE: 18 }
    },
    "Lich Staff": {
        type: "weapon",
        weaponType: "melee",
        rarity: "legendary",
        baseStats: { ATK: 18, CRIT_CHANCE: 12, SHADOW_DAMAGE: 25 }
    },
    "Manticore Stinger": {
        type: "weapon",
        weaponType: "melee",
        rarity: "legendary",
        baseStats: { ATK: 22, CRIT_CHANCE: 18, POISON_DAMAGE: 30 }
    },
    "Demon Lord Blade": {
        type: "weapon",
        weaponType: "melee",
        rarity: "legendary",
        baseStats: { ATK: 28, CRIT_CHANCE: 20, FIRE_DAMAGE: 25 }
    },
    "Void Scythe": {
        type: "weapon",
        weaponType: "melee",
        rarity: "legendary",
        baseStats: { ATK: 30, CRIT_CHANCE: 25, SHADOW_DAMAGE: 35 }
    },
    "Celestial Blade": {
        type: "weapon",
        weaponType: "melee",
        rarity: "legendary",
        baseStats: { ATK: 32, CRIT_CHANCE: 22, LIGHT_DAMAGE: 30 }
    },
    
    // Ranged Weapons
    "Rat Fang Bow": {
        type: "weapon",
        weaponType: "ranged",
        rarity: "common",
        baseStats: { ATK: 6, CRIT_CHANCE: 5, ATTACK_SPEED: 0.2 }
    },
    "Bone Crossbow": {
        type: "weapon",
        weaponType: "ranged",
        rarity: "uncommon",
        baseStats: { ATK: 9, CRIT_CHANCE: 8, CRIT_DAMAGE: 12 }
    },
    "Spider Silk Bow": {
        type: "weapon",
        weaponType: "ranged",
        rarity: "rare",
        baseStats: { ATK: 12, CRIT_CHANCE: 10, ATTACK_SPEED: 0.3 }
    },
    "Orc Throwing Axe": {
        type: "weapon",
        weaponType: "ranged",
        rarity: "rare",
        baseStats: { ATK: 11, CRIT_DAMAGE: 18, ATTACK_SPEED: 0.4 }
    },
    "Bandit Bow": {
        type: "weapon",
        weaponType: "ranged",
        rarity: "rare",
        baseStats: { ATK: 10, CRIT_CHANCE: 12, ATTACK_SPEED: 0.3 }
    },
    "Spirit Hunter Bow": {
        type: "weapon",
        weaponType: "ranged",
        rarity: "legendary",
        baseStats: { ATK: 25, CRIT_CHANCE: 18, ATTACK_SPEED: 0.4 }
    },
    "Dragon Bone Bow": {
        type: "weapon",
        weaponType: "ranged",
        rarity: "legendary",
        baseStats: { ATK: 26, CRIT_CHANCE: 20, CRIT_DAMAGE: 40 }
    },
    "Demon Lord Bow": {
        type: "weapon",
        weaponType: "ranged",
        rarity: "legendary",
        baseStats: { ATK: 28, CRIT_CHANCE: 22, FIRE_DAMAGE: 20 }
    },
    "Celestial Bow": {
        type: "weapon",
        weaponType: "ranged",
        rarity: "legendary",
        baseStats: { ATK: 30, CRIT_CHANCE: 25, LIGHT_DAMAGE: 25 }
    },
    
    // Magic Weapons
    "Rat Fang Staff": {
        type: "weapon",
        weaponType: "magic",
        rarity: "common",
        baseStats: { ATK: 5, CRIT_CHANCE: 6, MANA_REGEN: 2 }
    },
    "Bone Wand": {
        type: "weapon",
        weaponType: "magic",
        rarity: "uncommon",
        baseStats: { ATK: 7, CRIT_CHANCE: 8, SHADOW_DAMAGE: 8 }
    },
    "Spider Silk Staff": {
        type: "weapon",
        weaponType: "magic",
        rarity: "rare",
        baseStats: { ATK: 11, CRIT_CHANCE: 10, POISON_DAMAGE: 12 }
    },
    "Orc Shaman Staff": {
        type: "weapon",
        weaponType: "magic",
        rarity: "rare",
        baseStats: { ATK: 11, CRIT_DAMAGE: 15, ATTACK_SPEED: 0.3 }
    },
    "Dragon Bone Staff": {
        type: "weapon",
        weaponType: "magic",
        rarity: "epic",
        baseStats: { ATK: 15, CRIT_CHANCE: 10, CRIT_DAMAGE: 22 }
    },
    "Spirit Mage Staff": {
        type: "weapon",
        weaponType: "magic",
        rarity: "legendary",
        baseStats: { ATK: 23, CRIT_CHANCE: 16, CRIT_DAMAGE: 38, ATTACK_SPEED: 0.4 }
    },
    "Demon Lord Staff": {
        type: "weapon",
        weaponType: "magic",
        rarity: "legendary",
        baseStats: { ATK: 25, CRIT_CHANCE: 18, FIRE_DAMAGE: 22 }
    },
    "Celestial Staff": {
        type: "weapon",
        weaponType: "magic",
        rarity: "legendary",
        baseStats: { ATK: 27, CRIT_CHANCE: 20, LIGHT_DAMAGE: 28 }
    },
    
    // Armor and Accessories
    "Slime Shield": {
        type: "shield",
        rarity: "uncommon",
        baseStats: { DEF: 6, HEALTH: 15 }
    },
    "Spirit Cloak": {
        type: "cape",
        rarity: "rare",
        baseStats: { DEF: 4, DODGE: 12, CRIT_CHANCE: 6 }
    },
    "Silk Armor": {
        type: "chest",
        rarity: "rare",
        baseStats: { DEF: 8, HEALTH: 25, DODGE: 8 }
    },
    "Dragon Scale Armor": {
        type: "chest",
        rarity: "legendary",
        baseStats: { DEF: 18, HEALTH: 60, FIRE_RESISTANCE: 25 }
    },
    
    // NEW ARMOR AND ACCESSORIES
    "Bat Wing Cloak": {
        type: "cape",
        rarity: "uncommon",
        baseStats: { DEF: 3, DODGE: 15, ATTACK_SPEED: 0.2 }
    },
    "Wolf Hide Armor": {
        type: "chest",
        rarity: "uncommon",
        baseStats: { DEF: 6, HEALTH: 20, DODGE: 5 }
    },
    "Lizardman Scale Armor": {
        type: "chest",
        rarity: "rare",
        baseStats: { DEF: 10, HEALTH: 30, POISON_RESISTANCE: 15 }
    },
    "Dark Robe": {
        type: "chest",
        rarity: "rare",
        baseStats: { DEF: 7, HEALTH: 25, SHADOW_RESISTANCE: 20 }
    }
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

const applyStatVariation = (baseStat, rarity) => {
    const variation = STAT_VARIATIONS[rarity] || STAT_VARIATIONS.common;
    const multiplier = variation.min + (Math.random() * (variation.max - variation.min));
    return Math.floor(baseStat * multiplier);
};

const getRandomAdditionalStats = (equipmentType, rarity) => {
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
            // Generate stat value based on rarity
            const baseValue = {
                ATK: 3, DEF: 2, HEALTH: 10, CRIT_CHANCE: 3, CRIT_DAMAGE: 8,
                ATTACK_SPEED: 0.2, LIFE_STEAL: 5, BLOCK_CHANCE: 5, DODGE: 3, RESISTANCE: 2
            };
            
            additionalStats[randomStat.stat] = applyStatVariation(baseValue[randomStat.stat] || 5, rarity);
        }
    }
    
    return additionalStats;
};

export const generateEquipmentFromName = (equipmentName) => {
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

        const equipment = {
            id: generateEquipmentId(),
            name: equipmentName,
            type: template.type,
            rarity: template.rarity,
            stats: {}
        };

        // Add weaponType if it exists
        if (template.weaponType) {
            equipment.weaponType = template.weaponType;
        }

        // Apply base stats with variation
        Object.entries(template.baseStats).forEach(([stat, value]) => {
            equipment.stats[stat] = applyStatVariation(value, template.rarity);
        });

        // Add random additional stats
        const additionalStats = getRandomAdditionalStats(template.type, template.rarity);
        Object.assign(equipment.stats, additionalStats);

        return equipment;
    } catch (error) {
        console.error('Error in generateEquipmentFromName:', error);
        return null;
    }
};

export const convertLootBagToEquipment = (lootBagItems) => {
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
                
                const generatedEquipment = generateEquipmentFromName(itemName);
                
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