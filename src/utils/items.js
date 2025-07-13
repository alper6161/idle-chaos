// Centralized Items Database
// Contains all equipment templates, drop configurations, and item management

// Item Level Ranges by Rarity
export const ITEM_LEVEL_RANGES = {
    common: { min: 1, max: 20 },
    uncommon: { min: 15, max: 35 },
    rare: { min: 30, max: 50 },
    epic: { min: 45, max: 70 },
    legendary: { min: 60, max: 100 }
};

// Equipment Templates Database
export const EQUIPMENT_TEMPLATES = {
    // === WEAPONS ===
    
    // Melee Weapons
    "Rusty Sword": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "common",
        baseStats: { ATK: 5, CRIT_CHANCE: 3 }
    },
    "Rat Fang Dagger": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "common",
        baseStats: { ATK: 4, CRIT_CHANCE: 8, ATTACK_SPEED: 0.3 }
    },
    "Bone Sword": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "uncommon",
        baseStats: { ATK: 8, CRIT_CHANCE: 5, CRIT_DAMAGE: 10 }
    },
    "Orc Axe": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "rare", 
        baseStats: { ATK: 12, CRIT_DAMAGE: 15 }
    },
    "Spider Fang Blade": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "rare",
        baseStats: { ATK: 10, CRIT_CHANCE: 12, ATTACK_SPEED: 0.4 }
    },
    "Troll Club": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "epic",
        baseStats: { ATK: 15, CRIT_CHANCE: 8, CRIT_DAMAGE: 20 }
    },
    "Dragon Flame Sword": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "legendary",
        baseStats: { ATK: 22, CRIT_CHANCE: 15, CRIT_DAMAGE: 35, FIRE_DAMAGE: 12 }
    },
    "Wolf Fang Dagger": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "uncommon",
        baseStats: { ATK: 7, CRIT_CHANCE: 10, ATTACK_SPEED: 0.3 }
    },
    "Zombie Hand Dagger": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "uncommon",
        baseStats: { ATK: 6, CRIT_CHANCE: 8, POISON_DAMAGE: 5 }
    },
    "Bandit Dagger": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "rare",
        baseStats: { ATK: 9, CRIT_CHANCE: 15, ATTACK_SPEED: 0.4 }
    },
    "Lizardman Spear": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "rare",
        baseStats: { ATK: 11, CRIT_CHANCE: 8, ATTACK_SPEED: 0.3 }
    },
    "Bee Stinger Dagger": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "uncommon",
        baseStats: { ATK: 5, CRIT_CHANCE: 12, POISON_DAMAGE: 8 }
    },
    "Cultist Staff": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "rare",
        baseStats: { ATK: 8, CRIT_CHANCE: 6, SHADOW_DAMAGE: 10 }
    },
    "Gargoyle Claw": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "epic",
        baseStats: { ATK: 14, CRIT_CHANCE: 10, CRIT_DAMAGE: 18 }
    },
    "Harpy Talon": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "rare",
        baseStats: { ATK: 10, CRIT_CHANCE: 12, ATTACK_SPEED: 0.4 }
    },
    "Minotaur Axe": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "epic",
        baseStats: { ATK: 16, CRIT_CHANCE: 8, CRIT_DAMAGE: 25 }
    },
    "Wraith Blade": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "epic",
        baseStats: { ATK: 13, CRIT_CHANCE: 10, SHADOW_DAMAGE: 15 }
    },
    "Werewolf Claw": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "epic",
        baseStats: { ATK: 12, CRIT_CHANCE: 15, ATTACK_SPEED: 0.5 }
    },
    "Golem Fist": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "epic",
        baseStats: { ATK: 18, CRIT_CHANCE: 6, CRIT_DAMAGE: 20 }
    },
    "Vampire Fang": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "epic",
        baseStats: { ATK: 11, CRIT_CHANCE: 12, LIFE_STEAL: 8 }
    },
    "Chimera Claw": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "epic",
        baseStats: { ATK: 15, CRIT_CHANCE: 10, CRIT_DAMAGE: 22 }
    },
    "Hydra Fang": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "legendary",
        baseStats: { ATK: 20, CRIT_CHANCE: 12, POISON_DAMAGE: 20 }
    },
    "Demon Blade": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "legendary",
        baseStats: { ATK: 24, CRIT_CHANCE: 15, FIRE_DAMAGE: 18 }
    },
    "Lich Staff": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "legendary",
        baseStats: { ATK: 18, CRIT_CHANCE: 12, SHADOW_DAMAGE: 25 }
    },
    "Manticore Stinger": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "legendary",
        baseStats: { ATK: 22, CRIT_CHANCE: 18, POISON_DAMAGE: 30 }
    },
    "Demon Lord Blade": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "legendary",
        baseStats: { ATK: 28, CRIT_CHANCE: 20, FIRE_DAMAGE: 25 }
    },
    "Void Scythe": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "legendary",
        baseStats: { ATK: 30, CRIT_CHANCE: 25, SHADOW_DAMAGE: 35 }
    },
    "Celestial Blade": {
        type: "weapon",
        weaponType: "melee",
        baseRarity: "legendary",
        baseStats: { ATK: 32, CRIT_CHANCE: 22, LIGHT_DAMAGE: 30 }
    },
    
    // Ranged Weapons
    "Rat Fang Bow": {
        type: "weapon",
        weaponType: "ranged",
        baseRarity: "common",
        baseStats: { ATK: 6, CRIT_CHANCE: 5, ATTACK_SPEED: 0.2 }
    },
    "Bone Crossbow": {
        type: "weapon",
        weaponType: "ranged",
        baseRarity: "uncommon",
        baseStats: { ATK: 9, CRIT_CHANCE: 8, CRIT_DAMAGE: 12 }
    },
    "Spider Silk Bow": {
        type: "weapon",
        weaponType: "ranged",
        baseRarity: "rare",
        baseStats: { ATK: 12, CRIT_CHANCE: 10, ATTACK_SPEED: 0.3 }
    },
    "Orc Throwing Axe": {
        type: "weapon",
        weaponType: "ranged",
        baseRarity: "rare",
        baseStats: { ATK: 11, CRIT_DAMAGE: 18, ATTACK_SPEED: 0.4 }
    },
    "Bandit Bow": {
        type: "weapon",
        weaponType: "ranged",
        baseRarity: "rare",
        baseStats: { ATK: 10, CRIT_CHANCE: 12, ATTACK_SPEED: 0.3 }
    },
    "Spirit Hunter Bow": {
        type: "weapon",
        weaponType: "ranged",
        baseRarity: "legendary",
        baseStats: { ATK: 25, CRIT_CHANCE: 18, ATTACK_SPEED: 0.4 }
    },
    "Dragon Bone Bow": {
        type: "weapon",
        weaponType: "ranged",
        baseRarity: "legendary",
        baseStats: { ATK: 26, CRIT_CHANCE: 20, CRIT_DAMAGE: 40 }
    },
    "Demon Lord Bow": {
        type: "weapon",
        weaponType: "ranged",
        baseRarity: "legendary",
        baseStats: { ATK: 28, CRIT_CHANCE: 22, FIRE_DAMAGE: 20 }
    },
    "Celestial Bow": {
        type: "weapon",
        weaponType: "ranged",
        baseRarity: "legendary",
        baseStats: { ATK: 30, CRIT_CHANCE: 25, LIGHT_DAMAGE: 25 }
    },
    
    // Magic Weapons
    "Rat Fang Staff": {
        type: "weapon",
        weaponType: "magic",
        baseRarity: "common",
        baseStats: { ATK: 5, CRIT_CHANCE: 6, MANA_REGEN: 2 }
    },
    "Bone Wand": {
        type: "weapon",
        weaponType: "magic",
        baseRarity: "uncommon",
        baseStats: { ATK: 7, CRIT_CHANCE: 8, SHADOW_DAMAGE: 8 }
    },
    "Spider Silk Staff": {
        type: "weapon",
        weaponType: "magic",
        baseRarity: "rare",
        baseStats: { ATK: 11, CRIT_CHANCE: 10, POISON_DAMAGE: 12 }
    },
    "Orc Shaman Staff": {
        type: "weapon",
        weaponType: "magic",
        baseRarity: "rare",
        baseStats: { ATK: 10, CRIT_CHANCE: 8, LIGHTNING_DAMAGE: 15 }
    },
    "Dragon Staff": {
        type: "weapon",
        weaponType: "magic",
        baseRarity: "legendary",
        baseStats: { ATK: 24, CRIT_CHANCE: 15, FIRE_DAMAGE: 25 }
    },
    "Demon Lord Staff": {
        type: "weapon",
        weaponType: "magic",
        baseRarity: "legendary",
        baseStats: { ATK: 26, CRIT_CHANCE: 18, FIRE_DAMAGE: 30 }
    },
    "Celestial Staff": {
        type: "weapon",
        weaponType: "magic",
        baseRarity: "legendary",
        baseStats: { ATK: 28, CRIT_CHANCE: 20, LIGHT_DAMAGE: 35 }
    },
    
    // === ARMOR & ACCESSORIES ===
    
    // Shields
    "Goblin Shield": {
        type: "shield",
        baseRarity: "common",
        baseStats: { DEF: 3, BLOCK_CHANCE: 8 }
    },
    "Slime Shield": {
        type: "shield",
        baseRarity: "common",
        baseStats: { DEF: 4, BLOCK_CHANCE: 10 }
    },
    
    // Helmets
    "Goblin Helmet": {
        type: "helmet",
        baseRarity: "common",
        baseStats: { DEF: 2, HEALTH: 8 }
    },
    "Bone Helmet": {
        type: "helmet",
        baseRarity: "uncommon",
        baseStats: { DEF: 3, HEALTH: 12 }
    },
    "Orc Helmet": {
        type: "helmet",
        baseRarity: "rare",
        baseStats: { DEF: 4, HEALTH: 15 }
    },
    
    // Chest Armor
    "Goblin Armor": {
        type: "chest",
        baseRarity: "common",
        baseStats: { DEF: 4, HEALTH: 15 }
    },
    "Bone Armor": {
        type: "chest",
        baseRarity: "uncommon",
        baseStats: { DEF: 6, HEALTH: 20 }
    },
    "Orc Armor": {
        type: "chest",
        baseRarity: "rare",
        baseStats: { DEF: 8, HEALTH: 25 }
    },
    "Wolf Hide Armor": {
        type: "chest",
        baseRarity: "uncommon",
        baseStats: { DEF: 6, HEALTH: 20, DODGE: 5 }
    },
    "Zombie Armor": {
        type: "chest",
        baseRarity: "uncommon",
        baseStats: { DEF: 5, HEALTH: 18, POISON_RESISTANCE: 10 }
    },
    "Silk Armor": {
        type: "chest",
        baseRarity: "rare",
        baseStats: { DEF: 8, HEALTH: 25, DODGE: 8 }
    },
    "Lizardman Scale Armor": {
        type: "chest",
        baseRarity: "rare",
        baseStats: { DEF: 10, HEALTH: 30, POISON_RESISTANCE: 15 }
    },
    "Dark Robe": {
        type: "chest",
        baseRarity: "rare",
        baseStats: { DEF: 7, HEALTH: 25, SHADOW_RESISTANCE: 20 }
    },
    "Dragon Scale Armor": {
        type: "chest",
        baseRarity: "legendary",
        baseStats: { DEF: 18, HEALTH: 60, FIRE_RESISTANCE: 25 }
    },
    
    // Gloves
    "Goblin Gloves": {
        type: "gloves",
        baseRarity: "common",
        baseStats: { DEF: 1, ATTACK_SPEED: 0.1 }
    },
    "Rat Hide Gloves": {
        type: "gloves",
        baseRarity: "common",
        baseStats: { DEF: 1, ATTACK_SPEED: 0.2 }
    },
    "Bone Gloves": {
        type: "gloves",
        baseRarity: "uncommon",
        baseStats: { DEF: 2, CRIT_CHANCE: 4 }
    },
    "Spider Gloves": {
        type: "gloves",
        baseRarity: "uncommon",
        baseStats: { DEF: 2, ATTACK_SPEED: 0.3 }
    },
    "Orc Gloves": {
        type: "gloves",
        baseRarity: "rare",
        baseStats: { DEF: 3, ATTACK_SPEED: 0.3 }
    },
    "Wolf Claw Gloves": {
        type: "gloves",
        baseRarity: "uncommon",
        baseStats: { DEF: 2, ATTACK_SPEED: 0.3 }
    },
    "Zombie Gloves": {
        type: "gloves",
        baseRarity: "uncommon",
        baseStats: { DEF: 2, POISON_DAMAGE: 3 }
    },
    
    // Rings
    "Goblin Ring": {
        type: "ring",
        baseRarity: "common",
        baseStats: { CRIT_CHANCE: 3, CRIT_DAMAGE: 5 }
    },
    "Rat Tail Ring": {
        type: "ring",
        baseRarity: "common",
        baseStats: { CRIT_CHANCE: 4, ATTACK_SPEED: 0.1 }
    },
    "Bone Ring": {
        type: "ring",
        baseRarity: "uncommon",
        baseStats: { CRIT_CHANCE: 5, CRIT_DAMAGE: 8 }
    },
    "Spider Ring": {
        type: "ring",
        baseRarity: "uncommon",
        baseStats: { CRIT_CHANCE: 6, POISON_DAMAGE: 5 }
    },
    "Orc Ring": {
        type: "ring",
        baseRarity: "rare",
        baseStats: { CRIT_CHANCE: 8, CRIT_DAMAGE: 12 }
    },
    "Wolf Fang Ring": {
        type: "ring",
        baseRarity: "uncommon",
        baseStats: { CRIT_CHANCE: 6, ATTACK_SPEED: 0.2 }
    },
    "Zombie Ring": {
        type: "ring",
        baseRarity: "uncommon",
        baseStats: { CRIT_CHANCE: 4, POISON_DAMAGE: 5 }
    },
    
    // Capes
    "Rat Pelt Cape": {
        type: "cape",
        baseRarity: "common",
        baseStats: { DEF: 2, DODGE: 5 }
    },
    "Wolf Pelt Cape": {
        type: "cape",
        baseRarity: "uncommon",
        baseStats: { DEF: 3, DODGE: 10 }
    },
    "Bat Wing Cloak": {
        type: "cape",
        baseRarity: "uncommon",
        baseStats: { DEF: 3, DODGE: 15, ATTACK_SPEED: 0.2 }
    },
    "Spirit Cloak": {
        type: "cape",
        baseRarity: "rare",
        baseStats: { DEF: 4, DODGE: 12, CRIT_CHANCE: 6 }
    },
    
    // Boots
    "Slime Boots": {
        type: "boots",
        baseRarity: "common",
        baseStats: { DEF: 2, DODGE: 8 }
    },
    "Bat Wing Boots": {
        type: "boots",
        baseRarity: "uncommon",
        baseStats: { DEF: 2, DODGE: 12 }
    },
    "Wolf Boots": {
        type: "boots",
        baseRarity: "uncommon",
        baseStats: { DEF: 2, DODGE: 8 }
    },
    
    // Amulets
    "Slime Amulet": {
        type: "amulet",
        baseRarity: "common",
        baseStats: { HEALTH: 10, MANA_REGEN: 1 }
    },
    "Bat Amulet": {
        type: "amulet",
        baseRarity: "uncommon",
        baseStats: { HEALTH: 12, ATTACK_SPEED: 0.2 }
    },
    "Zombie Amulet": {
        type: "amulet",
        baseRarity: "uncommon",
        baseStats: { HEALTH: 15, POISON_RESISTANCE: 15 }
    }
};

// Item Management Functions
export const getItemTemplate = (itemName) => {
    return EQUIPMENT_TEMPLATES[itemName] || null;
};

export const getAllItemNames = () => {
    return Object.keys(EQUIPMENT_TEMPLATES);
};

export const getItemsByType = (type) => {
    return Object.entries(EQUIPMENT_TEMPLATES)
        .filter(([name, template]) => template.type === type)
        .map(([name, template]) => ({ name, ...template }));
};

export const getItemsByRarity = (rarity) => {
    return Object.entries(EQUIPMENT_TEMPLATES)
        .filter(([name, template]) => template.baseRarity === rarity)
        .map(([name, template]) => ({ name, ...template }));
};

export const generateRandomLevel = (rarity) => {
    const range = ITEM_LEVEL_RANGES[rarity] || ITEM_LEVEL_RANGES.common;
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
};

export const addLevelToItem = (item) => {
    if (!item.level) {
        const rarity = item.rarity || item.baseRarity || 'common';
        return { ...item, level: generateRandomLevel(rarity) };
    }
    return item;
};

export const addLevelsToItems = (items) => {
    return items.map(addLevelToItem);
}; 