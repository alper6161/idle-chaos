// Equipment Generator System
// Converts equipment names from combat drops into full equipment objects

const EQUIPMENT_TEMPLATES = {
    "Rusty Sword": {
        type: "weapon",
        rarity: "common",
        baseStats: { ATK: 5, CRIT_CHANCE: 3 }
    },
    "Rat Fang Dagger": {
        type: "weapon",
        rarity: "common",
        baseStats: { ATK: 4, CRIT_CHANCE: 8, ATTACK_SPEED: 0.3 }
    },
    "Bone Sword": {
        type: "weapon", 
        rarity: "uncommon",
        baseStats: { ATK: 8, CRIT_CHANCE: 5, CRIT_DAMAGE: 10 }
    },
    "Slime Shield": {
        type: "shield",
        rarity: "uncommon",
        baseStats: { DEF: 6, HEALTH: 15 }
    },
    "Orc Axe": {
        type: "weapon",
        rarity: "rare", 
        baseStats: { ATK: 12, CRIT_DAMAGE: 15 }
    },
    "Spirit Cloak": {
        type: "cape",
        rarity: "rare",
        baseStats: { DEF: 4, DODGE: 12, CRIT_CHANCE: 6 }
    },
    "Spider Fang Blade": {
        type: "weapon",
        rarity: "rare",
        baseStats: { ATK: 10, CRIT_CHANCE: 12, ATTACK_SPEED: 0.4 }
    },
    "Silk Armor": {
        type: "chest",
        rarity: "rare",
        baseStats: { DEF: 8, HEALTH: 25, DODGE: 8 }
    },
    "Troll Club": {
        type: "weapon",
        rarity: "epic",
        baseStats: { ATK: 15, CRIT_CHANCE: 8, CRIT_DAMAGE: 20 }
    },
    "Dragon Flame Sword": {
        type: "weapon",
        rarity: "legendary",
        baseStats: { ATK: 22, CRIT_CHANCE: 15, CRIT_DAMAGE: 35, FIRE_DAMAGE: 12 }
    },
    "Dragon Scale Armor": {
        type: "chest",
        rarity: "legendary",
        baseStats: { DEF: 18, HEALTH: 60, FIRE_RESISTANCE: 25 }
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

    // Apply base stats with variation
    Object.entries(template.baseStats).forEach(([stat, value]) => {
        equipment.stats[stat] = applyStatVariation(value, template.rarity);
    });

    // Add random additional stats
    const additionalStats = getRandomAdditionalStats(template.type, template.rarity);
    Object.assign(equipment.stats, additionalStats);

    return equipment;
};

export const convertLootBagToEquipment = (lootBagItems) => {
    const equipment = [];
    
    lootBagItems.forEach(itemName => {
        // Skip gold items
        if (itemName.includes('💰') || itemName.includes('gold')) {
            return;
        }
        
        const generatedEquipment = generateEquipmentFromName(itemName);
        if (generatedEquipment) {
            equipment.push(generatedEquipment);
        }
    });
    
    return equipment;
};

export const clearProcessedLootBag = () => {
    localStorage.removeItem("lootBag");
}; 