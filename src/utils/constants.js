export const INITIAL_SKILLS = {
    melee: {
        stab: { level: 1, xp: 0 },
        slash: { level: 1, xp: 0 },
        crush: { level: 1, xp: 0 }
    },
    ranged: {
        archery: { level: 1, xp: 0 },
        throwing: { level: 1, xp: 0 },
        poison: { level: 1, xp: 0 }
    },
    magic: {
        lightning: { level: 1, xp: 0 },
        fire: { level: 1, xp: 0 },
        ice: { level: 1, xp: 0 }
    },
    defense: {
        block: { level: 1, xp: 0 },
        dodge: { level: 1, xp: 0 },
        armor: { level: 1, xp: 0 }
    },
    utility: {
        heal: { level: 1, xp: 0 },
        buff: { level: 1, xp: 0 },
        hp: { level: 1, xp: 0 },
        energy: { level: 1, xp: 0 }
    },
    advanced: {
        lifeSteal: { level: 1, xp: 0 },
        counterAttack: { level: 1, xp: 0 },
        doubleAttack: { level: 1, xp: 0 },
        critChance: { level: 1, xp: 0 },
        critDamage: { level: 1, xp: 0 },
        attackSpeed: { level: 1, xp: 0 }
    }
};

// Skill level artışları - Her skill level atladığında etki edecek değerler
export const SKILL_LEVEL_BONUSES = {
    // Melee Skills
    stab: {
        ATK: 0.5,           // Her level için +0.5 ATK
        MIN_DAMAGE: 0.3,     // Her level için +0.3 min damage
        MAX_DAMAGE: 0.5      // Her level için +0.5 max damage
    },
    slash: {
        ATK: 0.8,           // Her level için +0.8 ATK
        MIN_DAMAGE: 0.5,     // Her level için +0.5 min damage
        MAX_DAMAGE: 0.8      // Her level için +0.8 max damage
    },
    crush: {
        ATK: 1.0,           // Her level için +1.0 ATK
        MIN_DAMAGE: 0.7,     // Her level için +0.7 min damage
        MAX_DAMAGE: 1.0      // Her level için +1.0 max damage
    },
    
    // Ranged Skills
    archery: {
        ATK: 0.6,           // Her level için +0.6 ATK
        MIN_DAMAGE: 0.4,     // Her level için +0.4 min damage
        MAX_DAMAGE: 0.6      // Her level için +0.6 max damage
    },
    throwing: {
        ATK: 0.4,           // Her level için +0.4 ATK
        MIN_DAMAGE: 0.3,     // Her level için +0.3 min damage
        MAX_DAMAGE: 0.4      // Her level için +0.4 max damage
    },
    poison: {
        ATK: 0.5,           // Her level için +0.5 ATK
        MIN_DAMAGE: 0.4,     // Her level için +0.4 min damage
        MAX_DAMAGE: 0.5      // Her level için +0.5 max damage
    },
    
    // Magic Skills
    lightning: {
        ATK: 0.7,           // Her level için +0.7 ATK
        MIN_DAMAGE: 0.5,     // Her level için +0.5 min damage
        MAX_DAMAGE: 0.7      // Her level için +0.7 max damage
    },
    fire: {
        ATK: 0.8,           // Her level için +0.8 ATK
        MIN_DAMAGE: 0.6,     // Her level için +0.6 min damage
        MAX_DAMAGE: 0.8      // Her level için +0.8 max damage
    },
    ice: {
        ATK: 0.6,           // Her level için +0.6 ATK
        MIN_DAMAGE: 0.4,     // Her level için +0.4 min damage
        MAX_DAMAGE: 0.6      // Her level için +0.6 max damage
    },
    
    // Defense Skills (Bu skill'ler attack değerlerini etkilemez)
    block: {
        ATK: 0,             // Defense skill'leri attack değerlerini etkilemez
        MIN_DAMAGE: 0,
        MAX_DAMAGE: 0
    },
    dodge: {
        ATK: 0,
        MIN_DAMAGE: 0,
        MAX_DAMAGE: 0
    },
    armor: {
        ATK: 0,
        MIN_DAMAGE: 0,
        MAX_DAMAGE: 0
    },
    
    // Utility Skills (Bu skill'ler attack değerlerini etkilemez)
    heal: {
        ATK: 0,
        MIN_DAMAGE: 0,
        MAX_DAMAGE: 0
    },
    buff: {
        ATK: 0,
        MIN_DAMAGE: 0,
        MAX_DAMAGE: 0
    },
    hp: {
        ATK: 0,
        MIN_DAMAGE: 0,
        MAX_DAMAGE: 0
    },
    energy: {
        ATK: 0,
        MIN_DAMAGE: 0,
        MAX_DAMAGE: 0
    },
    
    // Advanced Skills
    lifeSteal: {
        ATK: 0.3,           // Her level için +0.3 ATK
        MIN_DAMAGE: 0.2,     // Her level için +0.2 min damage
        MAX_DAMAGE: 0.3      // Her level için +0.3 max damage
    },
    counterAttack: {
        ATK: 0.4,           // Her level için +0.4 ATK
        MIN_DAMAGE: 0.3,     // Her level için +0.3 min damage
        MAX_DAMAGE: 0.4      // Her level için +0.4 max damage
    },
    doubleAttack: {
        ATK: 0.5,           // Her level için +0.5 ATK
        MIN_DAMAGE: 0.4,     // Her level için +0.4 min damage
        MAX_DAMAGE: 0.5      // Her level için +0.5 max damage
    },
    critChance: {
        ATK: 0.2,           // Her level için +0.2 ATK
        MIN_DAMAGE: 0.1,     // Her level için +0.1 min damage
        MAX_DAMAGE: 0.2      // Her level için +0.2 max damage
    },
    critDamage: {
        ATK: 0.3,           // Her level için +0.3 ATK
        MIN_DAMAGE: 0.2,     // Her level için +0.2 min damage
        MAX_DAMAGE: 0.3      // Her level için +0.3 max damage
    },
    attackSpeed: {
        ATK: 0.2,           // Her level için +0.2 ATK
        MIN_DAMAGE: 0.1,     // Her level için +0.1 min damage
        MAX_DAMAGE: 0.2      // Her level için +0.2 max damage
    }
};