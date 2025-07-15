// Game Constants

export const INITIAL_GOLD = 100;

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
        hp: { level: 1, xp: 0 },
        energyShield: { level: 1, xp: 0 },
        block: { level: 1, xp: 0 },
        dodge: { level: 1, xp: 0 },
        armor: { level: 1, xp: 0 }
    },
    utility: {
        heal: { level: 1, xp: 0 },
        buff: { level: 1, xp: 0 },
        debuff: { level: 1, xp: 0 }
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

export const SKILL_LEVEL_BONUSES = {
    stab: {
        ATK: 0.5,
        MIN_DAMAGE: 0.3,
        MAX_DAMAGE: 0.5
    },
    slash: {
        ATK: 0.8,
        MIN_DAMAGE: 0.5,
        MAX_DAMAGE: 0.8
    },
    crush: {
        ATK: 1.0,
        MIN_DAMAGE: 0.7,
        MAX_DAMAGE: 1.0
    },
    
    archery: {
        ATK: 0.6,
        MIN_DAMAGE: 0.4,
        MAX_DAMAGE: 0.6
    },
    throwing: {
        ATK: 0.4,
        MIN_DAMAGE: 0.3,
        MAX_DAMAGE: 0.4
    },
    poison: {
        ATK: 0.5,
        MIN_DAMAGE: 0.4,
        MAX_DAMAGE: 0.5
    },
    
    lightning: {
        ATK: 0.7,
        MIN_DAMAGE: 0.5,
        MAX_DAMAGE: 0.7
    },
    fire: {
        ATK: 0.8,
        MIN_DAMAGE: 0.6,
        MAX_DAMAGE: 0.8
    },
    ice: {
        ATK: 0.6,
        MIN_DAMAGE: 0.4,
        MAX_DAMAGE: 0.6
    },
    
    block: {
        ATK: 0,
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
    lifeSteal: {
        ATK: 0.3,
        MIN_DAMAGE: 0.2,
        MAX_DAMAGE: 0.3
    },
    counterAttack: {
        ATK: 0.4,
        MIN_DAMAGE: 0.3,
        MAX_DAMAGE: 0.4
    },
    doubleAttack: {
        ATK: 0.5,
        MIN_DAMAGE: 0.4,
        MAX_DAMAGE: 0.5
    },
    critChance: {
        ATK: 0.2,
        MIN_DAMAGE: 0.1,
        MAX_DAMAGE: 0.2
    },
    critDamage: {
        ATK: 0.3,
        MIN_DAMAGE: 0.2,
        MAX_DAMAGE: 0.3
    },
    attackSpeed: {
        ATK: 0.2,
        MIN_DAMAGE: 0.1,
        MAX_DAMAGE: 0.2
    }
};