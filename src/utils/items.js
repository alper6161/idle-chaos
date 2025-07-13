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
        baseStats: { ATK: 5, CRIT_CHANCE: 3 },
        allowedEnemies: ["goblin"]
    },
    "Rat Fang Dagger": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 4, CRIT_CHANCE: 8, ATTACK_SPEED: 0.3 },
        allowedEnemies: ["rat"]
    },
    "Bone Sword": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 8, CRIT_CHANCE: 5, CRIT_DAMAGE: 10 },
        allowedEnemies: ["skeleton"]
    },
    "Orc Axe": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 12, CRIT_DAMAGE: 15 },
        allowedEnemies: ["orc"]
    },
    "Spider Fang Blade": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 10, CRIT_CHANCE: 12, ATTACK_SPEED: 0.4 }
    },
    "Troll Club": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 15, CRIT_CHANCE: 8, CRIT_DAMAGE: 20 }
    },
    "Dragon Flame Sword": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 22, CRIT_CHANCE: 15, CRIT_DAMAGE: 35, FIRE_DAMAGE: 12 }
    },
    "Wolf Fang Dagger": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 7, CRIT_CHANCE: 10, ATTACK_SPEED: 0.3 },
        allowedEnemies: ["wolf"]
    },
    "Zombie Hand Dagger": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 6, CRIT_CHANCE: 8, POISON_DAMAGE: 5 }
    },
    "Bandit Dagger": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 9, CRIT_CHANCE: 15, ATTACK_SPEED: 0.4 }
    },
    "Lizardman Spear": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 11, CRIT_CHANCE: 8, ATTACK_SPEED: 0.3 }
    },
    "Bee Stinger Dagger": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 5, CRIT_CHANCE: 12, POISON_DAMAGE: 8 }
    },
    "Cultist Staff": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 8, CRIT_CHANCE: 6, SHADOW_DAMAGE: 10 }
    },
    "Gargoyle Claw": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 14, CRIT_CHANCE: 10, CRIT_DAMAGE: 18 }
    },
    "Harpy Talon": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 10, CRIT_CHANCE: 12, ATTACK_SPEED: 0.4 }
    },
    "Minotaur Axe": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 16, CRIT_CHANCE: 8, CRIT_DAMAGE: 25 }
    },
    "Wraith Blade": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 13, CRIT_CHANCE: 10, SHADOW_DAMAGE: 15 }
    },
    "Werewolf Claw": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 12, CRIT_CHANCE: 15, ATTACK_SPEED: 0.5 }
    },
    "Golem Fist": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 18, CRIT_CHANCE: 6, CRIT_DAMAGE: 20 }
    },
    "Vampire Fang": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 11, CRIT_CHANCE: 12, LIFE_STEAL: 8 }
    },
    "Chimera Claw": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 15, CRIT_CHANCE: 10, CRIT_DAMAGE: 22 }
    },
    "Hydra Fang": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 20, CRIT_CHANCE: 12, POISON_DAMAGE: 20 }
    },
    "Demon Blade": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 24, CRIT_CHANCE: 15, FIRE_DAMAGE: 18 }
    },
    "Lich Staff": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 18, CRIT_CHANCE: 12, SHADOW_DAMAGE: 25 }
    },
    "Manticore Stinger": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 22, CRIT_CHANCE: 18, POISON_DAMAGE: 30 }
    },
    "Demon Lord Blade": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 28, CRIT_CHANCE: 20, FIRE_DAMAGE: 25 }
    },
    "Void Scythe": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 30, CRIT_CHANCE: 25, SHADOW_DAMAGE: 35 }
    },
    "Celestial Blade": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 32, CRIT_CHANCE: 22, LIGHT_DAMAGE: 30 }
    },
    
    // Ranged Weapons
    "Rat Fang Bow": {
        type: "weapon",
        weaponType: "ranged",
        baseStats: { ATK: 6, CRIT_CHANCE: 5, ATTACK_SPEED: 0.2 }
    },
    "Bone Crossbow": {
        type: "weapon",
        weaponType: "ranged",
        baseStats: { ATK: 9, CRIT_CHANCE: 8, CRIT_DAMAGE: 12 }
    },
    "Spider Silk Bow": {
        type: "weapon",
        weaponType: "ranged",
        baseStats: { ATK: 12, CRIT_CHANCE: 10, ATTACK_SPEED: 0.3 }
    },
    "Orc Throwing Axe": {
        type: "weapon",
        weaponType: "ranged",
        baseStats: { ATK: 11, CRIT_DAMAGE: 18, ATTACK_SPEED: 0.4 }
    },
    "Bandit Bow": {
        type: "weapon",
        weaponType: "ranged",
        baseStats: { ATK: 10, CRIT_CHANCE: 12, ATTACK_SPEED: 0.3 }
    },
    "Spirit Hunter Bow": {
        type: "weapon",
        weaponType: "ranged",
        baseStats: { ATK: 25, CRIT_CHANCE: 18, ATTACK_SPEED: 0.4 }
    },
    "Dragon Bone Bow": {
        type: "weapon",
        weaponType: "ranged",
        baseStats: { ATK: 26, CRIT_CHANCE: 20, CRIT_DAMAGE: 40 }
    },
    "Demon Lord Bow": {
        type: "weapon",
        weaponType: "ranged",
        baseStats: { ATK: 28, CRIT_CHANCE: 22, FIRE_DAMAGE: 20 }
    },
    "Celestial Bow": {
        type: "weapon",
        weaponType: "ranged",
        baseStats: { ATK: 30, CRIT_CHANCE: 25, LIGHT_DAMAGE: 25 }
    },
    
    // Magic Weapons
    "Rat Fang Staff": {
        type: "weapon",
        weaponType: "magic",
        baseStats: { ATK: 5, CRIT_CHANCE: 6, MANA_REGEN: 2 }
    },
    "Bone Wand": {
        type: "weapon",
        weaponType: "magic",
        baseStats: { ATK: 7, CRIT_CHANCE: 8, SHADOW_DAMAGE: 8 }
    },
    "Spider Silk Staff": {
        type: "weapon",
        weaponType: "magic",
        baseStats: { ATK: 11, CRIT_CHANCE: 10, POISON_DAMAGE: 12 }
    },
    "Orc Shaman Staff": {
        type: "weapon",
        weaponType: "magic",
        baseStats: { ATK: 10, CRIT_CHANCE: 8, LIGHTNING_DAMAGE: 15 }
    },
    "Dragon Staff": {
        type: "weapon",
        weaponType: "magic",
        baseStats: { ATK: 24, CRIT_CHANCE: 15, FIRE_DAMAGE: 25 }
    },
    "Demon Lord Staff": {
        type: "weapon",
        weaponType: "magic",
        baseStats: { ATK: 26, CRIT_CHANCE: 18, FIRE_DAMAGE: 30 }
    },
    "Celestial Staff": {
        type: "weapon",
        weaponType: "magic",
        baseStats: { ATK: 28, CRIT_CHANCE: 20, LIGHT_DAMAGE: 35 }
    },
    
    // === ARMOR & ACCESSORIES ===
    
    // Shields
    "Goblin Shield": {
        type: "shield",
        baseStats: { DEF: 3, BLOCK_CHANCE: 8 }
    },
    "Slime Shield": {
        type: "shield",
        baseStats: { DEF: 4, BLOCK_CHANCE: 10 }
    },
    "Slime Armor": {
        type: "chest",
        baseStats: { DEF: 5, HEALTH: 18 }
    },
    
    // Helmets
    "Goblin Helmet": {
        type: "helmet",
        baseStats: { DEF: 2, HEALTH: 8 }
    },
    "Bone Helmet": {
        type: "helmet",
        baseStats: { DEF: 3, HEALTH: 12 }
    },
    "Orc Helmet": {
        type: "helmet",
        baseStats: { DEF: 4, HEALTH: 15 }
    },
    
    // Chest Armor
    "Goblin Armor": {
        type: "chest",
        baseStats: { DEF: 4, HEALTH: 15 }
    },
    "Bone Armor": {
        type: "chest",
        baseStats: { DEF: 6, HEALTH: 20 }
    },
    "Orc Armor": {
        type: "chest",
        baseStats: { DEF: 8, HEALTH: 25 }
    },
    "Wolf Hide Armor": {
        type: "chest",
        baseStats: { DEF: 6, HEALTH: 20, DODGE: 5 }
    },
    "Zombie Armor": {
        type: "chest",
        baseStats: { DEF: 5, HEALTH: 18, POISON_RESISTANCE: 10 }
    },
    "Silk Armor": {
        type: "chest",
        baseStats: { DEF: 8, HEALTH: 25, DODGE: 8 }
    },
    "Lizardman Scale Armor": {
        type: "chest",
        baseStats: { DEF: 10, HEALTH: 30, POISON_RESISTANCE: 15 }
    },
    "Dark Robe": {
        type: "chest",
        baseStats: { DEF: 7, HEALTH: 25, SHADOW_RESISTANCE: 20 }
    },
    "Dragon Scale Armor": {
        type: "chest",
        baseStats: { DEF: 18, HEALTH: 60, FIRE_RESISTANCE: 25 }
    },
    
    // Gloves
    "Goblin Gloves": {
        type: "gloves",
        baseStats: { DEF: 1, ATTACK_SPEED: 0.1 }
    },
    "Rat Hide Gloves": {
        type: "gloves",
        baseStats: { DEF: 1, ATTACK_SPEED: 0.2 }
    },
    "Bone Gloves": {
        type: "gloves",
        baseStats: { DEF: 2, CRIT_CHANCE: 4 }
    },
    "Spider Gloves": {
        type: "gloves",
        baseStats: { DEF: 2, ATTACK_SPEED: 0.3 }
    },
    "Orc Gloves": {
        type: "gloves",
        baseStats: { DEF: 3, ATTACK_SPEED: 0.3 }
    },
    "Wolf Claw Gloves": {
        type: "gloves",
        baseStats: { DEF: 2, ATTACK_SPEED: 0.3 }
    },
    "Zombie Gloves": {
        type: "gloves",
        baseStats: { DEF: 2, POISON_DAMAGE: 3 }
    },
    
    // Rings
    "Goblin Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 3, CRIT_DAMAGE: 5 }
    },
    "Rat Tail Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 4, ATTACK_SPEED: 0.1 }
    },
    "Bone Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 5, CRIT_DAMAGE: 8 }
    },
    "Spider Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 6, POISON_DAMAGE: 5 }
    },
    "Orc Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 8, CRIT_DAMAGE: 12 }
    },
    "Wolf Fang Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 6, ATTACK_SPEED: 0.2 }
    },
    "Zombie Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 4, POISON_DAMAGE: 5 }
    },
    
    // Capes
    "Rat Pelt Cape": {
        type: "cape",
        baseStats: { DEF: 2, DODGE: 5 }
    },
    "Wolf Pelt Cape": {
        type: "cape",
        baseStats: { DEF: 3, DODGE: 10 }
    },
    "Bat Wing Cloak": {
        type: "cape",
        baseStats: { DEF: 3, DODGE: 15, ATTACK_SPEED: 0.2 }
    },
    "Spirit Cloak": {
        type: "cape",
        baseStats: { DEF: 4, DODGE: 12, CRIT_CHANCE: 6 }
    },
    
    // Boots
    "Slime Boots": {
        type: "boots",
        baseStats: { DEF: 2, DODGE: 8 }
    },
    "Bat Wing Boots": {
        type: "boots",
        baseStats: { DEF: 2, DODGE: 12 }
    },
    "Wolf Boots": {
        type: "boots",
        baseStats: { DEF: 2, DODGE: 8 }
    },
    
    // Amulets
    "Slime Amulet": {
        type: "amulet",
        baseStats: { HEALTH: 10, MANA_REGEN: 1 }
    },
    "Bat Amulet": {
        type: "amulet",
        baseStats: { HEALTH: 12, ATTACK_SPEED: 0.2 }
    },
    "Zombie Amulet": {
        type: "amulet",
        baseStats: { HEALTH: 15, POISON_RESISTANCE: 15 }
    },
    
    // === MISSING ITEMS FROM ENEMIES ===
    
    // Bat Items
    "Bat Fang Dagger": {
        type: "weapon",
        weaponType: "melee",
        baseStats: { ATK: 6, CRIT_CHANCE: 10, ATTACK_SPEED: 0.3 }
    },
    
    // Bandit Items
    "Bandit Armor": {
        type: "chest",
        baseStats: { DEF: 9, HEALTH: 25, DODGE: 8 }
    },
    "Bandit Cape": {
        type: "cape",
        baseStats: { DEF: 4, DODGE: 15, CRIT_CHANCE: 5 }
    },
    "Bandit Gloves": {
        type: "gloves",
        baseStats: { DEF: 3, ATTACK_SPEED: 0.4, CRIT_CHANCE: 8 }
    },
    
    // Troll Items
    "Troll Armor": {
        type: "chest",
        baseStats: { DEF: 12, HEALTH: 35, POISON_RESISTANCE: 20 }
    },
    "Troll Gloves": {
        type: "gloves",
        baseStats: { DEF: 4, ATTACK_SPEED: 0.4, CRIT_CHANCE: 8 }
    },
    "Troll Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 12, CRIT_DAMAGE: 20, HEALTH: 15 }
    },
    "Troll Amulet": {
        type: "amulet",
        baseStats: { HEALTH: 25, POISON_RESISTANCE: 25, ATTACK_SPEED: 0.3 }
    },
    
    // Lizardman Items
    "Lizardman Gloves": {
        type: "gloves",
        baseStats: { DEF: 3, ATTACK_SPEED: 0.3, POISON_DAMAGE: 5 }
    },
    "Lizardman Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 8, POISON_DAMAGE: 8, HEALTH: 12 }
    },
    "Lizardman Amulet": {
        type: "amulet",
        baseStats: { HEALTH: 20, POISON_RESISTANCE: 20, ATTACK_SPEED: 0.2 }
    },
    
    // Bee Items
    "Bee Wing Cape": {
        type: "cape",
        baseStats: { DEF: 3, DODGE: 12, ATTACK_SPEED: 0.3 }
    },
    "Bee Gloves": {
        type: "gloves",
        baseStats: { DEF: 2, ATTACK_SPEED: 0.4, POISON_DAMAGE: 3 }
    },
    "Bee Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 6, POISON_DAMAGE: 6, ATTACK_SPEED: 0.2 }
    },
    "Bee Amulet": {
        type: "amulet",
        baseStats: { HEALTH: 15, POISON_DAMAGE: 5, ATTACK_SPEED: 0.3 }
    },
    
    // Cultist Items
    "Cultist Gloves": {
        type: "gloves",
        baseStats: { DEF: 3, SHADOW_DAMAGE: 5, CRIT_CHANCE: 6 }
    },
    "Cultist Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 8, SHADOW_DAMAGE: 8, HEALTH: 12 }
    },
    "Cultist Amulet": {
        type: "amulet",
        baseStats: { HEALTH: 20, SHADOW_RESISTANCE: 20, MANA_REGEN: 3 }
    },
    
    // Gargoyle Items
    "Gargoyle Armor": {
        type: "chest",
        baseStats: { DEF: 14, HEALTH: 40, STONE_RESISTANCE: 25 }
    },
    "Gargoyle Gloves": {
        type: "gloves",
        baseStats: { DEF: 4, ATTACK_SPEED: 0.4, CRIT_CHANCE: 10 }
    },
    "Gargoyle Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 12, CRIT_DAMAGE: 18, HEALTH: 18 }
    },
    "Gargoyle Amulet": {
        type: "amulet",
        baseStats: { HEALTH: 30, STONE_RESISTANCE: 30, DEF: 5 }
    },
    
    // Harpy Items
    "Harpy Wing Cape": {
        type: "cape",
        baseStats: { DEF: 4, DODGE: 18, ATTACK_SPEED: 0.4 }
    },
    "Harpy Gloves": {
        type: "gloves",
        baseStats: { DEF: 3, ATTACK_SPEED: 0.4, CRIT_CHANCE: 8 }
    },
    "Harpy Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 10, ATTACK_SPEED: 0.3, HEALTH: 15 }
    },
    "Harpy Amulet": {
        type: "amulet",
        baseStats: { HEALTH: 25, ATTACK_SPEED: 0.4, DODGE: 8 }
    },
    
    // Minotaur Items
    "Minotaur Armor": {
        type: "chest",
        baseStats: { DEF: 15, HEALTH: 45, CRIT_DAMAGE: 15 }
    },
    "Minotaur Gloves": {
        type: "gloves",
        baseStats: { DEF: 4, ATTACK_SPEED: 0.5, CRIT_CHANCE: 8 }
    },
    "Minotaur Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 12, CRIT_DAMAGE: 20, HEALTH: 20 }
    },
    "Minotaur Amulet": {
        type: "amulet",
        baseStats: { HEALTH: 35, CRIT_DAMAGE: 15, ATTACK_SPEED: 0.3 }
    },
    
    // Wraith Items
    "Wraith Armor": {
        type: "chest",
        baseStats: { DEF: 13, HEALTH: 35, SHADOW_RESISTANCE: 25 }
    },
    "Wraith Gloves": {
        type: "gloves",
        baseStats: { DEF: 4, SHADOW_DAMAGE: 8, CRIT_CHANCE: 8 }
    },
    "Wraith Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 10, SHADOW_DAMAGE: 10, HEALTH: 18 }
    },
    "Wraith Amulet": {
        type: "amulet",
        baseStats: { HEALTH: 30, SHADOW_RESISTANCE: 30, MANA_REGEN: 4 }
    },
    
    // Werewolf Items
    "Werewolf Armor": {
        type: "chest",
        baseStats: { DEF: 12, HEALTH: 40, ATTACK_SPEED: 0.3 }
    },
    "Werewolf Gloves": {
        type: "gloves",
        baseStats: { DEF: 4, ATTACK_SPEED: 0.5, CRIT_CHANCE: 10 }
    },
    "Werewolf Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 12, ATTACK_SPEED: 0.3, HEALTH: 18 }
    },
    
    // === REMAINING MISSING ITEMS ===
    
    // Golem Items
    "Golem Armor": {
        type: "chest",
        baseStats: { DEF: 16, HEALTH: 50, STONE_RESISTANCE: 30 }
    },
    "Golem Gloves": {
        type: "gloves",
        baseStats: { DEF: 5, ATTACK_SPEED: 0.4, CRIT_CHANCE: 10 }
    },
    "Golem Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 12, CRIT_DAMAGE: 20, HEALTH: 20 }
    },
    "Golem Amulet": {
        type: "amulet",
        baseStats: { HEALTH: 35, STONE_RESISTANCE: 35, DEF: 6 }
    },
    
    // Vampire Items
    "Vampire Armor": {
        type: "chest",
        baseStats: { DEF: 13, HEALTH: 40, LIFE_STEAL: 10 }
    },
    "Vampire Gloves": {
        type: "gloves",
        baseStats: { DEF: 4, ATTACK_SPEED: 0.4, LIFE_STEAL: 8 }
    },
    "Vampire Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 10, LIFE_STEAL: 8, HEALTH: 18 }
    },
    "Vampire Amulet": {
        type: "amulet",
        baseStats: { HEALTH: 30, LIFE_STEAL: 12, ATTACK_SPEED: 0.3 }
    },
    
    // Chimera Items
    "Chimera Armor": {
        type: "chest",
        baseStats: { DEF: 14, HEALTH: 45, FIRE_RESISTANCE: 20 }
    },
    "Chimera Gloves": {
        type: "gloves",
        baseStats: { DEF: 4, ATTACK_SPEED: 0.4, CRIT_CHANCE: 10 }
    },
    "Chimera Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 12, CRIT_DAMAGE: 20, HEALTH: 20 }
    },
    "Chimera Amulet": {
        type: "amulet",
        baseStats: { HEALTH: 35, FIRE_RESISTANCE: 25, ATTACK_SPEED: 0.3 }
    },
    
    // Hydra Items
    "Hydra Armor": {
        type: "chest",
        baseStats: { DEF: 18, HEALTH: 60, POISON_RESISTANCE: 30 }
    },
    "Hydra Gloves": {
        type: "gloves",
        baseStats: { DEF: 5, ATTACK_SPEED: 0.5, POISON_DAMAGE: 10 }
    },
    "Hydra Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 15, POISON_DAMAGE: 12, HEALTH: 25 }
    },
    "Hydra Amulet": {
        type: "amulet",
        baseStats: { HEALTH: 40, POISON_RESISTANCE: 35, ATTACK_SPEED: 0.4 }
    },
    
    // Demon Items
    "Demon Armor": {
        type: "chest",
        baseStats: { DEF: 20, HEALTH: 65, FIRE_RESISTANCE: 30 }
    },
    "Demon Gloves": {
        type: "gloves",
        baseStats: { DEF: 6, ATTACK_SPEED: 0.5, FIRE_DAMAGE: 12 }
    },
    "Demon Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 18, FIRE_DAMAGE: 15, HEALTH: 30 }
    },
    "Demon Amulet": {
        type: "amulet",
        baseStats: { HEALTH: 45, FIRE_RESISTANCE: 35, ATTACK_SPEED: 0.4 }
    },
    
    // Lich Items
    "Lich Armor": {
        type: "chest",
        baseStats: { DEF: 19, HEALTH: 60, SHADOW_RESISTANCE: 35 }
    },
    "Lich Gloves": {
        type: "gloves",
        baseStats: { DEF: 5, ATTACK_SPEED: 0.4, SHADOW_DAMAGE: 12 }
    },
    "Lich Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 15, SHADOW_DAMAGE: 15, HEALTH: 25 }
    },
    "Lich Amulet": {
        type: "amulet",
        baseStats: { HEALTH: 40, SHADOW_RESISTANCE: 40, MANA_REGEN: 5 }
    },
    
    // Manticore Items
    "Manticore Armor": {
        type: "chest",
        baseStats: { DEF: 21, HEALTH: 70, POISON_RESISTANCE: 25 }
    },
    "Manticore Gloves": {
        type: "gloves",
        baseStats: { DEF: 6, ATTACK_SPEED: 0.5, POISON_DAMAGE: 15 }
    },
    "Manticore Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 18, POISON_DAMAGE: 18, HEALTH: 30 }
    },
    "Manticore Amulet": {
        type: "amulet",
        baseStats: { HEALTH: 50, POISON_RESISTANCE: 30, ATTACK_SPEED: 0.4 }
    },
    
    // Dragon Items
    "Dragon Bone Staff": {
        type: "weapon",
        weaponType: "magic",
        baseStats: { ATK: 25, CRIT_CHANCE: 15, FIRE_DAMAGE: 30 }
    },
    "Spirit Mage Staff": {
        type: "weapon",
        weaponType: "magic",
        baseStats: { ATK: 27, CRIT_CHANCE: 18, LIGHT_DAMAGE: 35 }
    },
    "Dragon Gloves": {
        type: "gloves",
        baseStats: { DEF: 6, ATTACK_SPEED: 0.5, FIRE_DAMAGE: 15 }
    },
    "Dragon Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 20, FIRE_DAMAGE: 20, HEALTH: 35 }
    },
    "Dragon Amulet": {
        type: "amulet",
        baseStats: { HEALTH: 55, FIRE_RESISTANCE: 40, ATTACK_SPEED: 0.4 }
    },
    
    // Demon Lord Items
    "Demon Lord Armor": {
        type: "chest",
        baseStats: { DEF: 25, HEALTH: 80, FIRE_RESISTANCE: 40 }
    },
    "Demon Lord Gloves": {
        type: "gloves",
        baseStats: { DEF: 7, ATTACK_SPEED: 0.6, FIRE_DAMAGE: 20 }
    },
    "Demon Lord Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 22, FIRE_DAMAGE: 25, HEALTH: 40 }
    },
    "Demon Lord Amulet": {
        type: "amulet",
        baseStats: { HEALTH: 60, FIRE_RESISTANCE: 45, ATTACK_SPEED: 0.5 }
    },
    
    // Void Items
    "Void Armor": {
        type: "chest",
        baseStats: { DEF: 28, HEALTH: 90, SHADOW_RESISTANCE: 45 }
    },
    "Void Gloves": {
        type: "gloves",
        baseStats: { DEF: 8, ATTACK_SPEED: 0.6, SHADOW_DAMAGE: 25 }
    },
    "Void Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 25, SHADOW_DAMAGE: 30, HEALTH: 45 }
    },
    "Void Amulet": {
        type: "amulet",
        baseStats: { HEALTH: 70, SHADOW_RESISTANCE: 50, ATTACK_SPEED: 0.5 }
    },
    
    // Celestial Items
    "Celestial Armor": {
        type: "chest",
        baseStats: { DEF: 30, HEALTH: 100, LIGHT_RESISTANCE: 50 }
    },
    "Celestial Gloves": {
        type: "gloves",
        baseStats: { DEF: 8, ATTACK_SPEED: 0.6, LIGHT_DAMAGE: 25 }
    },
    "Celestial Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 25, LIGHT_DAMAGE: 30, HEALTH: 50 }
    },
    "Celestial Amulet": {
        type: "amulet",
        baseStats: { HEALTH: 75, LIGHT_RESISTANCE: 55, ATTACK_SPEED: 0.5 }
    },
    
    // Ghost Items
    "Ghost Gloves": {
        type: "gloves",
        baseStats: { DEF: 3, ATTACK_SPEED: 0.3, SHADOW_DAMAGE: 8 }
    },
    "Ghost Ring": {
        type: "ring",
        baseStats: { CRIT_CHANCE: 8, SHADOW_DAMAGE: 8, HEALTH: 15 }
    },
    "Ghost Amulet": {
        type: "amulet",
        baseStats: { HEALTH: 25, SHADOW_RESISTANCE: 25, MANA_REGEN: 3 }
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

export const generateRandomLevel = (rarity) => {
    const range = ITEM_LEVEL_RANGES[rarity] || ITEM_LEVEL_RANGES.common;
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
};

export const addLevelToItem = (item) => {
    if (!item.level) {
        const rarity = item.rarity || 'common';
        return { ...item, level: generateRandomLevel(rarity) };
    }
    return item;
};

export const addLevelsToItems = (items) => {
    return items.map(addLevelToItem);
}; 