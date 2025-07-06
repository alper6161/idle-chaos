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
            { name: "Rusty Sword", chance: 0.3 },
            { name: "Gold Coin", chance: 0.5 },
            { name: "Goblin Ear", chance: 0.1 }
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
            { name: "Rat Tail", chance: 0.4 },
            { name: "Rotten Cheese", chance: 0.2 }
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
            { name: "Sticky Goo", chance: 0.5 },
            { name: "Slime Core", chance: 0.15 }
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
            { name: "Bone Sword", chance: 0.25 },
            { name: "Skeleton Skull", chance: 0.3 },
            { name: "Ancient Coin", chance: 0.4 }
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
            { name: "Orc Axe", chance: 0.2 },
            { name: "Tough Hide", chance: 0.4 },
            { name: "Berserker Rage", chance: 0.1 }
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
            { name: "Troll Club", chance: 0.15 },
            { name: "Troll Hide", chance: 0.3 },
            { name: "Troll Blood", chance: 0.2 }
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
            { name: "Dragon Scale", chance: 0.4 },
            { name: "Dragon Claw", chance: 0.2 },
            { name: "Dragon Breath", chance: 0.1 }
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
            { name: "Ectoplasm", chance: 0.5 },
            { name: "Soul Fragment", chance: 0.3 }
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
            { name: "Spider Silk", chance: 0.4 },
            { name: "Spider Venom", chance: 0.2 },
            { name: "Spider Leg", chance: 0.3 }
        ]
    }
};

// Rastgele düşman seçme fonksiyonu
export const getRandomEnemy = () => {
    const enemyKeys = Object.keys(enemies);
    const randomKey = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
    return enemies[randomKey];
};

// Belirli bir düşmanı ID ile alma
export const getEnemyById = (id) => Object.values(enemies).find(enemy => enemy.id === id);

export default enemies;
