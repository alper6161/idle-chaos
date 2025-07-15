/*
 * GOLD SYSTEM CONVERSION
 * ======================
 * 
 * All loot drops have been converted to a gold-based system where:
 * - Equipment items (weapons, armor) still drop as physical items
 * - All other items are converted to gold values based on their drop rates
 * 
 * GOLD VALUES BY DROP RATE:
 * - Rare items (10-15% chance): 18-25 gold
 * - Uncommon items (20-30% chance): 12-20 gold  
 * - Common items (40-50% chance): 5-10 gold
 * 
 * EQUIPMENT ITEMS (still drop as items):
 * - Rusty Sword (Goblin)
 * - Bone Sword (Skeleton)
 * - Orc Axe (Orc)
 * - Troll Club (Troll)
 * 
 * GOLD ITEMS (converted to gold):
 * - All consumables, crafting materials, and miscellaneous items
 * - Values balanced based on rarity and enemy strength
 */

const enemies = {
    // EASY ENEMIES (6) - Level 1-10
    GOBLIN: {
        id: "goblin",
        name: "Goblin",
        maxHp: 30,
        ATK: 8,
        DEF: 3,
        ATTACK_SPEED: 2,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/9/99/GoblinGreen.png/220px-GoblinGreen.png",
        drops: [
            { name: "Rusty Sword", chance: 0.15, type: "equipment" },
            { name: "Goblin Shield", chance: 0.12, type: "equipment" },
            { name: "Goblin Helmet", chance: 0.10, type: "equipment" },
            { name: "Goblin Armor", chance: 0.08, type: "equipment" },
            { name: "Goblin Gloves", chance: 0.06, type: "equipment" },
            { name: "Goblin Ring", chance: 0.05, type: "equipment" },
            { name: "Gold Coin", chance: 0.4, type: "gold", value: 3 },
            { name: "Goblin Ear", chance: 0.08, type: "gold", value: 12 }
        ]
    },
    RAT: {
        id: "rat",
        name: "Giant Rat",
        maxHp: 20,
        ATK: 6,
        DEF: 2,
        ATTACK_SPEED: 3,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/f/fc/GiantRat.png/220px-GiantRat.png",
        drops: [
            { name: "Rat Fang Dagger", chance: 0.12, type: "equipment" },
            { name: "Rat Fang Bow", chance: 0.10, type: "equipment" },
            { name: "Rat Hide Gloves", chance: 0.08, type: "equipment" },
            { name: "Rat Tail Ring", chance: 0.06, type: "equipment" },
            { name: "Rat Pelt Cape", chance: 0.05, type: "equipment" },
            { name: "Rat Tail", chance: 0.3, type: "gold", value: 5 },
            { name: "Rotten Cheese", chance: 0.15, type: "gold", value: 10 }
        ]
    },
    SLIME: {
        id: "slime",
        name: "Green Slime",
        maxHp: 25,
        ATK: 7,
        DEF: 4,
        ATTACK_SPEED: 2,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Green_slime_icon.png/240px-Green_slime_icon.png",
        drops: [
            { name: "Slime Shield", chance: 0.18, type: "equipment" },
            { name: "Slime Armor", chance: 0.15, type: "equipment" },
            { name: "Slime Boots", chance: 0.12, type: "equipment" },
            { name: "Slime Amulet", chance: 0.10, type: "equipment" },
            { name: "Sticky Goo", chance: 0.5, type: "gold", value: 6 },
            { name: "Slime Core", chance: 0.15, type: "gold", value: 22 }
        ]
    },
    SPIDER: {
        id: "spider",
        name: "Giant Spider",
        maxHp: 30,
        ATK: 9,
        DEF: 4,
        ATTACK_SPEED: 3,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Giant_spider.png/220px-Giant_spider.png",
        drops: [
            { name: "Spider Fang Blade", chance: 0.16, type: "equipment" },
            { name: "Spider Silk Bow", chance: 0.14, type: "equipment" },
            { name: "Spider Silk Staff", chance: 0.12, type: "equipment" },
            { name: "Silk Armor", chance: 0.10, type: "equipment" },
            { name: "Spider Gloves", chance: 0.08, type: "equipment" },
            { name: "Spider Ring", chance: 0.06, type: "equipment" },
            { name: "Spider Silk", chance: 0.4, type: "gold", value: 9 },
            { name: "Spider Venom", chance: 0.2, type: "gold", value: 16 },
            { name: "Spider Leg", chance: 0.3, type: "gold", value: 11 }
        ]
    },
    BAT: {
        id: "bat",
        name: "Cave Bat",
        maxHp: 18,
        ATK: 5,
        DEF: 1,
        ATTACK_SPEED: 4,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Bat_icon.png/220px-Bat_icon.png",
        drops: [
            { name: "Bat Wing Cloak", chance: 0.12, type: "equipment" },
            { name: "Bat Fang Dagger", chance: 0.10, type: "equipment" },
            { name: "Bat Wing Boots", chance: 0.08, type: "equipment" },
            { name: "Bat Amulet", chance: 0.06, type: "equipment" },
            { name: "Bat Fang", chance: 0.3, type: "gold", value: 7 },
            { name: "Bat Guano", chance: 0.4, type: "gold", value: 4 }
        ]
    },
    SKELETON: {
        id: "skeleton",
        name: "Skeleton Warrior",
        maxHp: 40,
        ATK: 12,
        DEF: 6,
        ATTACK_SPEED: 2,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Skeleton_warrior.png/220px-Skeleton_warrior.png",
        drops: [
            { name: "Bone Sword", chance: 0.25, type: "equipment" },
            { name: "Bone Crossbow", chance: 0.20, type: "equipment" },
            { name: "Bone Wand", chance: 0.18, type: "equipment" },
            { name: "Bone Helmet", chance: 0.15, type: "equipment" },
            { name: "Bone Armor", chance: 0.12, type: "equipment" },
            { name: "Bone Gloves", chance: 0.10, type: "equipment" },
            { name: "Bone Ring", chance: 0.08, type: "equipment" },
            { name: "Skeleton Skull", chance: 0.3, type: "gold", value: 10 },
            { name: "Ancient Coin", chance: 0.4, type: "gold", value: 7 }
        ]
    },

    // NORMAL ENEMIES (10) - Level 11-30
    ORC: {
        id: "orc",
        name: "Orc Berserker",
        maxHp: 50,
        ATK: 15,
        DEF: 8,
        ATTACK_SPEED: 1,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2c/Orc_warrior.png/220px-Orc_warrior.png",
        drops: [
            { name: "Orc Axe", chance: 0.2, type: "equipment" },
            { name: "Orc Throwing Axe", chance: 0.15, type: "equipment" },
            { name: "Orc Shaman Staff", chance: 0.12, type: "equipment" },
            { name: "Orc Helmet", chance: 0.10, type: "equipment" },
            { name: "Orc Armor", chance: 0.08, type: "equipment" },
            { name: "Orc Gloves", chance: 0.06, type: "equipment" },
            { name: "Orc Ring", chance: 0.05, type: "equipment" },
            { name: "Tough Hide", chance: 0.4, type: "gold", value: 12 },
            { name: "Berserker Rage", chance: 0.1, type: "gold", value: 25 }
        ]
    },
    WOLF: {
        id: "wolf",
        name: "Dire Wolf",
        maxHp: 45,
        ATK: 14,
        DEF: 5,
        ATTACK_SPEED: 3,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6c/Wolf_icon.png/220px-Wolf_icon.png",
        drops: [
            { name: "Wolf Fang Dagger", chance: 0.18, type: "equipment" },
            { name: "Wolf Hide Armor", chance: 0.15, type: "equipment" },
            { name: "Wolf Claw Gloves", chance: 0.12, type: "equipment" },
            { name: "Wolf Fang Ring", chance: 0.10, type: "equipment" },
            { name: "Wolf Pelt Cape", chance: 0.08, type: "equipment" },
            { name: "Wolf Boots", chance: 0.06, type: "equipment" },
            { name: "Wolf Fang", chance: 0.35, type: "gold", value: 11 },
            { name: "Wolf Pelt", chance: 0.25, type: "gold", value: 14 }
        ]
    },
    ZOMBIE: {
        id: "zombie",
        name: "Undead Zombie",
        maxHp: 55,
        ATK: 13,
        DEF: 7,
        ATTACK_SPEED: 1,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Zombie_icon.png/220px-Zombie_icon.png",
        drops: [
            { name: "Zombie Hand Dagger", chance: 0.16, type: "equipment" },
            { name: "Zombie Armor", chance: 0.12, type: "equipment" },
            { name: "Zombie Gloves", chance: 0.10, type: "equipment" },
            { name: "Zombie Ring", chance: 0.08, type: "equipment" },
            { name: "Zombie Amulet", chance: 0.06, type: "equipment" },
            { name: "Rotten Flesh", chance: 0.4, type: "gold", value: 8 },
            { name: "Zombie Brain", chance: 0.2, type: "gold", value: 18 }
        ]
    },
    BANDIT: {
        id: "bandit",
        name: "Desert Bandit",
        maxHp: 42,
        ATK: 16,
        DEF: 6,
        ATTACK_SPEED: 2,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Bandit_icon.png/220px-Bandit_icon.png",
        drops: [
            { name: "Bandit Dagger", chance: 0.2, type: "equipment" },
            { name: "Bandit Bow", chance: 0.15, type: "equipment" },
            { name: "Bandit Armor", chance: 0.12, type: "equipment" },
            { name: "Bandit Gloves", chance: 0.10, type: "equipment" },
            { name: "Bandit Ring", chance: 0.08, type: "equipment" },
            { name: "Bandit Cape", chance: 0.06, type: "equipment" },
            { name: "Stolen Gold", chance: 0.3, type: "gold", value: 15 },
            { name: "Bandit Mask", chance: 0.25, type: "gold", value: 12 }
        ]
    },
    TROLL: {
        id: "troll",
        name: "Cave Troll",
        maxHp: 80,
        ATK: 18,
        DEF: 12,
        ATTACK_SPEED: 1,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9c/Troll_warrior.png/220px-Troll_warrior.png",
        drops: [
            { name: "Troll Club", chance: 0.15, type: "equipment" },
            { name: "Troll Armor", chance: 0.12, type: "equipment" },
            { name: "Troll Gloves", chance: 0.10, type: "equipment" },
            { name: "Troll Ring", chance: 0.08, type: "equipment" },
            { name: "Troll Amulet", chance: 0.06, type: "equipment" },
            { name: "Troll Hide", chance: 0.3, type: "gold", value: 15 },
            { name: "Troll Blood", chance: 0.2, type: "gold", value: 20 }
        ]
    },
    LIZARDMAN: {
        id: "lizardman",
        name: "Swamp Lizardman",
        maxHp: 60,
        ATK: 17,
        DEF: 9,
        ATTACK_SPEED: 2,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Lizardman_icon.png/220px-Lizardman_icon.png",
        drops: [
            { name: "Lizardman Spear", chance: 0.18, type: "equipment" },
            { name: "Lizardman Scale Armor", chance: 0.14, type: "equipment" },
            { name: "Lizardman Gloves", chance: 0.12, type: "equipment" },
            { name: "Lizardman Ring", chance: 0.10, type: "equipment" },
            { name: "Lizardman Amulet", chance: 0.08, type: "equipment" },
            { name: "Lizard Scale", chance: 0.35, type: "gold", value: 13 },
            { name: "Lizard Tail", chance: 0.2, type: "gold", value: 19 }
        ]
    },
    GIANT_BEE: {
        id: "giant_bee",
        name: "Giant Bee",
        maxHp: 35,
        ATK: 11,
        DEF: 4,
        ATTACK_SPEED: 4,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3c/Bee_icon.png/220px-Bee_icon.png",
        drops: [
            { name: "Bee Stinger Dagger", chance: 0.16, type: "equipment" },
            { name: "Bee Wing Cape", chance: 0.12, type: "equipment" },
            { name: "Bee Gloves", chance: 0.10, type: "equipment" },
            { name: "Bee Ring", chance: 0.08, type: "equipment" },
            { name: "Bee Amulet", chance: 0.06, type: "equipment" },
            { name: "Honey", chance: 0.4, type: "gold", value: 10 },
            { name: "Bee Wax", chance: 0.3, type: "gold", value: 12 }
        ]
    },
    CULTIST: {
        id: "cultist",
        name: "Dark Cultist",
        maxHp: 48,
        ATK: 14,
        DEF: 8,
        ATTACK_SPEED: 2,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9c/Cultist_icon.png/220px-Cultist_icon.png",
        drops: [
            { name: "Cultist Staff", chance: 0.17, type: "equipment" },
            { name: "Dark Robe", chance: 0.13, type: "equipment" },
            { name: "Cultist Gloves", chance: 0.10, type: "equipment" },
            { name: "Cultist Ring", chance: 0.08, type: "equipment" },
            { name: "Cultist Amulet", chance: 0.06, type: "equipment" },
            { name: "Dark Essence", chance: 0.25, type: "gold", value: 16 },
            { name: "Cultist Mask", chance: 0.3, type: "gold", value: 11 }
        ]
    },
    GARGOYLE: {
        id: "gargoyle",
        name: "Stone Gargoyle",
        maxHp: 70,
        ATK: 19,
        DEF: 15,
        ATTACK_SPEED: 1,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Gargoyle_icon.png/220px-Gargoyle_icon.png",
        drops: [
            { name: "Gargoyle Claw", chance: 0.14, type: "equipment" },
            { name: "Gargoyle Armor", chance: 0.12, type: "equipment" },
            { name: "Gargoyle Gloves", chance: 0.10, type: "equipment" },
            { name: "Gargoyle Ring", chance: 0.08, type: "equipment" },
            { name: "Gargoyle Amulet", chance: 0.06, type: "equipment" },
            { name: "Stone Fragment", chance: 0.35, type: "gold", value: 14 },
            { name: "Ancient Stone", chance: 0.2, type: "gold", value: 22 }
        ]
    },
    HARPY: {
        id: "harpy",
        name: "Forest Harpy",
        maxHp: 52,
        ATK: 16,
        DEF: 7,
        ATTACK_SPEED: 3,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Harpy_icon.png/220px-Harpy_icon.png",
        drops: [
            { name: "Harpy Talon", chance: 0.16, type: "equipment" },
            { name: "Harpy Wing Cape", chance: 0.12, type: "equipment" },
            { name: "Harpy Gloves", chance: 0.10, type: "equipment" },
            { name: "Harpy Ring", chance: 0.08, type: "equipment" },
            { name: "Harpy Amulet", chance: 0.06, type: "equipment" },
            { name: "Harpy Feather", chance: 0.3, type: "gold", value: 13 },
            { name: "Harpy Wing", chance: 0.2, type: "gold", value: 18 }
        ]
    },

    // HARD ENEMIES (6) - Level 31-60
    MINOTAUR: {
        id: "minotaur",
        name: "Ancient Minotaur",
        maxHp: 100,
        ATK: 22,
        DEF: 16,
        ATTACK_SPEED: 1,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6c/Minotaur_icon.png/220px-Minotaur_icon.png",
        drops: [
            { name: "Minotaur Axe", chance: 0.12, type: "equipment" },
            { name: "Minotaur Armor", chance: 0.10, type: "equipment" },
            { name: "Minotaur Gloves", chance: 0.08, type: "equipment" },
            { name: "Minotaur Ring", chance: 0.06, type: "equipment" },
            { name: "Minotaur Amulet", chance: 0.05, type: "equipment" },
            { name: "Minotaur Hide", chance: 0.25, type: "gold", value: 18 },
            { name: "Minotaur Horn", chance: 0.15, type: "gold", value: 28 }
        ]
    },
    WRAITH: {
        id: "wraith",
        name: "Shadow Wraith",
        maxHp: 65,
        ATK: 20,
        DEF: 10,
        ATTACK_SPEED: 2,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Wraith_icon.png/220px-Wraith_icon.png",
        drops: [
            { name: "Wraith Blade", chance: 0.13, type: "equipment" },
            { name: "Wraith Armor", chance: 0.10, type: "equipment" },
            { name: "Wraith Gloves", chance: 0.08, type: "equipment" },
            { name: "Wraith Ring", chance: 0.06, type: "equipment" },
            { name: "Wraith Amulet", chance: 0.05, type: "equipment" },
            { name: "Shadow Essence", chance: 0.3, type: "gold", value: 20 },
            { name: "Soul Fragment", chance: 0.2, type: "gold", value: 25 }
        ]
    },
    WEREWOLF: {
        id: "werewolf",
        name: "Blood Moon Werewolf",
        maxHp: 85,
        ATK: 21,
        DEF: 12,
        ATTACK_SPEED: 2,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9c/Werewolf_icon.png/220px-Werewolf_icon.png",
        drops: [
            { name: "Werewolf Claw", chance: 0.14, type: "equipment" },
            { name: "Werewolf Armor", chance: 0.10, type: "equipment" },
            { name: "Werewolf Gloves", chance: 0.08, type: "equipment" },
            { name: "Werewolf Ring", chance: 0.06, type: "equipment" },
            { name: "Werewolf Amulet", chance: 0.05, type: "equipment" },
            { name: "Werewolf Fang", chance: 0.25, type: "gold", value: 19 },
            { name: "Silver Fur", chance: 0.2, type: "gold", value: 24 }
        ]
    },
    GOLEM: {
        id: "golem",
        name: "Iron Golem",
        maxHp: 120,
        ATK: 24,
        DEF: 20,
        ATTACK_SPEED: 1,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Golem_icon.png/220px-Golem_icon.png",
        drops: [
            { name: "Golem Fist", chance: 0.11, type: "equipment" },
            { name: "Golem Armor", chance: 0.10, type: "equipment" },
            { name: "Golem Gloves", chance: 0.08, type: "equipment" },
            { name: "Golem Ring", chance: 0.06, type: "equipment" },
            { name: "Golem Amulet", chance: 0.05, type: "equipment" },
            { name: "Iron Ore", chance: 0.3, type: "gold", value: 16 },
            { name: "Ancient Core", chance: 0.15, type: "gold", value: 30 }
        ]
    },
    VAMPIRE: {
        id: "vampire",
        name: "Ancient Vampire",
        maxHp: 90,
        ATK: 23,
        DEF: 14,
        ATTACK_SPEED: 2,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Vampire_icon.png/220px-Vampire_icon.png",
        drops: [
            { name: "Vampire Fang", chance: 0.12, type: "equipment" },
            { name: "Vampire Armor", chance: 0.10, type: "equipment" },
            { name: "Vampire Gloves", chance: 0.08, type: "equipment" },
            { name: "Vampire Ring", chance: 0.06, type: "equipment" },
            { name: "Vampire Amulet", chance: 0.05, type: "equipment" },
            { name: "Vampire Dust", chance: 0.25, type: "gold", value: 21 },
            { name: "Blood Crystal", chance: 0.18, type: "gold", value: 26 }
        ]
    },
    CHIMERA: {
        id: "chimera",
        name: "Three-Headed Chimera",
        maxHp: 110,
        ATK: 25,
        DEF: 18,
        ATTACK_SPEED: 1,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6c/Chimera_icon.png/220px-Chimera_icon.png",
        drops: [
            { name: "Chimera Claw", chance: 0.1, type: "equipment" },
            { name: "Chimera Armor", chance: 0.08, type: "equipment" },
            { name: "Chimera Gloves", chance: 0.06, type: "equipment" },
            { name: "Chimera Ring", chance: 0.05, type: "equipment" },
            { name: "Chimera Amulet", chance: 0.04, type: "equipment" },
            { name: "Chimera Hide", chance: 0.2, type: "gold", value: 22 },
            { name: "Chimera Heart", chance: 0.12, type: "gold", value: 35 }
        ]
    },

    // VERY HARD ENEMIES (4) - Level 61-80
    HYDRA: {
        id: "hydra",
        name: "Nine-Headed Hydra",
        maxHp: 150,
        ATK: 28,
        DEF: 22,
        ATTACK_SPEED: 1,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Hydra_icon.png/220px-Hydra_icon.png",
        drops: [
            { name: "Hydra Fang", chance: 0.08, type: "equipment" },
            { name: "Hydra Armor", chance: 0.06, type: "equipment" },
            { name: "Hydra Gloves", chance: 0.05, type: "equipment" },
            { name: "Hydra Ring", chance: 0.04, type: "equipment" },
            { name: "Hydra Amulet", chance: 0.03, type: "equipment" },
            { name: "Hydra Scale", chance: 0.18, type: "gold", value: 25 },
            { name: "Hydra Heart", chance: 0.1, type: "gold", value: 40 }
        ]
    },
    DEMON: {
        id: "demon",
        name: "Infernal Demon",
        maxHp: 130,
        ATK: 30,
        DEF: 20,
        ATTACK_SPEED: 2,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Demon_icon.png/220px-Demon_icon.png",
        drops: [
            { name: "Demon Blade", chance: 0.07, type: "equipment" },
            { name: "Demon Armor", chance: 0.06, type: "equipment" },
            { name: "Demon Gloves", chance: 0.05, type: "equipment" },
            { name: "Demon Ring", chance: 0.04, type: "equipment" },
            { name: "Demon Amulet", chance: 0.03, type: "equipment" },
            { name: "Demon Essence", chance: 0.15, type: "gold", value: 28 },
            { name: "Hellfire Crystal", chance: 0.08, type: "gold", value: 45 }
        ]
    },
    LICH: {
        id: "lich",
        name: "Death Lich",
        maxHp: 140,
        ATK: 32,
        DEF: 18,
        ATTACK_SPEED: 1,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6c/Lich_icon.png/220px-Lich_icon.png",
        drops: [
            { name: "Lich Staff", chance: 0.06, type: "equipment" },
            { name: "Lich Armor", chance: 0.05, type: "equipment" },
            { name: "Lich Gloves", chance: 0.04, type: "equipment" },
            { name: "Lich Ring", chance: 0.03, type: "equipment" },
            { name: "Lich Amulet", chance: 0.03, type: "equipment" },
            { name: "Soul Crystal", chance: 0.12, type: "gold", value: 30 },
            { name: "Death Essence", chance: 0.08, type: "gold", value: 42 }
        ]
    },
    MANTICORE: {
        id: "manticore",
        name: "Winged Manticore",
        maxHp: 160,
        ATK: 35,
        DEF: 25,
        ATTACK_SPEED: 1,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9c/Manticore_icon.png/220px-Manticore_icon.png",
        drops: [
            { name: "Manticore Stinger", chance: 0.05, type: "equipment" },
            { name: "Manticore Armor", chance: 0.04, type: "equipment" },
            { name: "Manticore Gloves", chance: 0.03, type: "equipment" },
            { name: "Manticore Ring", chance: 0.03, type: "equipment" },
            { name: "Manticore Amulet", chance: 0.02, type: "equipment" },
            { name: "Manticore Hide", chance: 0.15, type: "gold", value: 32 },
            { name: "Manticore Heart", chance: 0.08, type: "gold", value: 48 }
        ]
    },

    // IMPOSSIBLE ENEMIES (4) - Level 81-100
    ANCIENT_DRAGON: {
        id: "ancient_dragon",
        name: "Ancient Dragon",
        maxHp: 200,
        ATK: 40,
        DEF: 30,
        ATTACK_SPEED: 1,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Dragon_icon.png/220px-Dragon_icon.png",
        drops: [
            { name: "Dragon Flame Sword", chance: 0.08, type: "equipment" },
            { name: "Dragon Bone Bow", chance: 0.06, type: "equipment" },
            { name: "Dragon Bone Staff", chance: 0.05, type: "equipment" },
            { name: "Spirit Hunter Bow", chance: 0.03, type: "equipment" },
            { name: "Spirit Mage Staff", chance: 0.02, type: "equipment" },
            { name: "Dragon Scale Armor", chance: 0.05, type: "equipment" },
            { name: "Dragon Gloves", chance: 0.04, type: "equipment" },
            { name: "Dragon Ring", chance: 0.03, type: "equipment" },
            { name: "Dragon Amulet", chance: 0.02, type: "equipment" },
            { name: "Dragon Scale", chance: 0.4, type: "gold", value: 18 },
            { name: "Dragon Claw", chance: 0.2, type: "gold", value: 30 },
            { name: "Dragon Breath", chance: 0.1, type: "gold", value: 50 }
        ]
    },
    ARCHDEMON: {
        id: "archdemon",
        name: "Archdemon",
        maxHp: 250,
        ATK: 45,
        DEF: 35,
        ATTACK_SPEED: 1,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Demon_icon.png/220px-Demon_icon.png",
        drops: [
            { name: "Demon Lord Blade", chance: 0.04, type: "equipment" },
            { name: "Demon Lord Staff", chance: 0.03, type: "equipment" },
            { name: "Demon Lord Bow", chance: 0.03, type: "equipment" },
            { name: "Demon Lord Armor", chance: 0.02, type: "equipment" },
            { name: "Demon Lord Gloves", chance: 0.02, type: "equipment" },
            { name: "Demon Lord Ring", chance: 0.02, type: "equipment" },
            { name: "Demon Lord Amulet", chance: 0.01, type: "equipment" },
            { name: "Archdemon Essence", chance: 0.1, type: "gold", value: 35 },
            { name: "Hellfire Core", chance: 0.06, type: "gold", value: 55 }
        ]
    },
    VOID_REAPER: {
        id: "void_reaper",
        name: "Void Reaper",
        maxHp: 300,
        ATK: 50,
        DEF: 40,
        ATTACK_SPEED: 1,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Reaper_icon.png/220px-Reaper_icon.png",
        drops: [
            { name: "Void Scythe", chance: 0.03, type: "equipment" },
            { name: "Void Armor", chance: 0.02, type: "equipment" },
            { name: "Void Gloves", chance: 0.02, type: "equipment" },
            { name: "Void Ring", chance: 0.02, type: "equipment" },
            { name: "Void Amulet", chance: 0.01, type: "equipment" },
            { name: "Void Essence", chance: 0.08, type: "gold", value: 40 },
            { name: "Void Crystal", chance: 0.05, type: "gold", value: 60 }
        ]
    },
    CELESTIAL_SERAPH: {
        id: "celestial_seraph",
        name: "Celestial Seraph",
        maxHp: 350,
        ATK: 55,
        DEF: 45,
        ATTACK_SPEED: 1,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9c/Angel_icon.png/220px-Angel_icon.png",
        drops: [
            { name: "Celestial Blade", chance: 0.02, type: "equipment" },
            { name: "Celestial Staff", chance: 0.02, type: "equipment" },
            { name: "Celestial Bow", chance: 0.02, type: "equipment" },
            { name: "Celestial Armor", chance: 0.01, type: "equipment" },
            { name: "Celestial Gloves", chance: 0.01, type: "equipment" },
            { name: "Celestial Ring", chance: 0.01, type: "equipment" },
            { name: "Celestial Amulet", chance: 0.01, type: "equipment" },
            { name: "Celestial Essence", chance: 0.06, type: "gold", value: 45 },
            { name: "Divine Crystal", chance: 0.04, type: "gold", value: 70 }
        ]
    },

    // LEGACY ENEMIES (keeping for compatibility)
    GHOST: {
        id: "ghost",
        name: "Wandering Ghost",
        maxHp: 35,
        ATK: 10,
        DEF: 5,
        ATTACK_SPEED: 3,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3c/Ghost_icon.png/220px-Ghost_icon.png",
        drops: [
            { name: "Spirit Cloak", chance: 0.12, type: "equipment" },
            { name: "Ghost Gloves", chance: 0.10, type: "equipment" },
            { name: "Ghost Ring", chance: 0.08, type: "equipment" },
            { name: "Ghost Amulet", chance: 0.06, type: "equipment" },
            { name: "Ectoplasm", chance: 0.5, type: "gold", value: 8 },
            { name: "Soul Fragment", chance: 0.3, type: "gold", value: 14 }
        ]
    }
};

export const getRandomEnemy = () => {
    const enemyKeys = Object.keys(enemies);
    const randomKey = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
    return enemies[randomKey];
};

export const getEnemyById = (id) => Object.values(enemies).find(enemy => enemy.id === id);

export default enemies;
