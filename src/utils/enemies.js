const enemies = {
    GOBLIN: {
        id: "goblin",
        name: "Goblin",
        maxHp: 30,
        attackSpeed: 2.5,
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
        maxHp: 15,
        attackSpeed: 3.0,
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
        attackSpeed: 2.8,
        portrait: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Green_slime_icon.png/240px-Green_slime_icon.png",
        drops: [
            { name: "Sticky Goo", chance: 0.5 },
            { name: "Slime Core", chance: 0.15 }
        ]
    }
};

export default enemies;
