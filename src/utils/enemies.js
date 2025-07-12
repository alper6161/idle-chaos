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
    GOBLIN: {
        id: "goblin",
        name: "Goblin",
        maxHp: 30,
        ATK: 8,
        DEF: 3,
        ATTACK_SPEED: 2,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/9/99/GoblinGreen.png/220px-GoblinGreen.png",
        drops: [
            { name: "Rusty Sword", chance: 0.3, type: "equipment" },
            { name: "Gold Coin", chance: 0.5, type: "gold", value: 5 },
            { name: "Goblin Ear", chance: 0.1, type: "gold", value: 18 }
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
            { name: "Rat Tail", chance: 0.4, type: "gold", value: 8 },
            { name: "Rotten Cheese", chance: 0.2, type: "gold", value: 15 }
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
            { name: "Sticky Goo", chance: 0.5, type: "gold", value: 6 },
            { name: "Slime Core", chance: 0.15, type: "gold", value: 22 }
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
            { name: "Skeleton Skull", chance: 0.3, type: "gold", value: 10 },
            { name: "Ancient Coin", chance: 0.4, type: "gold", value: 7 }
        ]
    },
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
            { name: "Tough Hide", chance: 0.4, type: "gold", value: 12 },
            { name: "Berserker Rage", chance: 0.1, type: "gold", value: 25 }
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
            { name: "Troll Hide", chance: 0.3, type: "gold", value: 15 },
            { name: "Troll Blood", chance: 0.2, type: "gold", value: 20 }
        ]
    },
    DRAGON: {
        id: "dragon",
        name: "Young Dragon",
        maxHp: 120,
        ATK: 25,
        DEF: 15,
        ATTACK_SPEED: 1,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Dragon_icon.png/220px-Dragon_icon.png",
        drops: [
            { name: "Dragon Scale", chance: 0.4, type: "gold", value: 18 },
            { name: "Dragon Claw", chance: 0.2, type: "gold", value: 30 },
            { name: "Dragon Breath", chance: 0.1, type: "gold", value: 50 }
        ]
    },
    GHOST: {
        id: "ghost",
        name: "Wandering Ghost",
        maxHp: 35,
        ATK: 10,
        DEF: 5,
        ATTACK_SPEED: 3,
        portrait: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3c/Ghost_icon.png/220px-Ghost_icon.png",
        drops: [
            { name: "Ectoplasm", chance: 0.5, type: "gold", value: 8 },
            { name: "Soul Fragment", chance: 0.3, type: "gold", value: 14 }
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
            { name: "Spider Silk", chance: 0.4, type: "gold", value: 9 },
            { name: "Spider Venom", chance: 0.2, type: "gold", value: 16 },
            { name: "Spider Leg", chance: 0.3, type: "gold", value: 11 }
        ]
    }
};

// Function to select random enemy
export const getRandomEnemy = () => {
    const enemyKeys = Object.keys(enemies);
    const randomKey = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
    return enemies[randomKey];
};

// Get specific enemy by ID
export const getEnemyById = (id) => Object.values(enemies).find(enemy => enemy.id === id);

export default enemies;
