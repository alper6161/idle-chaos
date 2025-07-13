// Skill Experience System
// Handles skill experience gain based on battle actions

import { INITIAL_SKILLS } from './constants.js';

// Skill experience requirements (XP needed for each level)
const SKILL_XP_REQUIREMENTS = {
    1: 0,
    2: 50,
    3: 100,
    4: 150,
    5: 200,
    6: 250,
    7: 300,
    8: 350,
    9: 400,
    10: 450,
    // ... continue for all levels up to 99
};

// Generate XP requirements for levels 11-99 (more reasonable progression)
for (let level = 11; level <= 99; level++) {
    SKILL_XP_REQUIREMENTS[level] = SKILL_XP_REQUIREMENTS[level - 1] + (level * 25);
}

// --- MIGRATION: Convert old skill data to new format if needed ---
function migrateSkillDataIfNeeded(skillData) {
    let migrated = false;
    const newData = {};
    Object.entries(skillData).forEach(([category, skills]) => {
        newData[category] = {};
        Object.entries(skills).forEach(([skillName, value]) => {
            if (typeof value === 'number') {
                // Old format: just level
                newData[category][skillName] = { level: value, xp: 0 };
                migrated = true;
            } else if (typeof value === 'object' && value !== null && 'level' in value && 'xp' in value) {
                newData[category][skillName] = value;
            }
        });
    });
    return migrated ? newData : skillData;
}

// Get current skill data from localStorage
export const getSkillData = () => {
    const saved = localStorage.getItem("gameData");
    let data = saved ? JSON.parse(saved) : INITIAL_SKILLS;
    data = migrateSkillDataIfNeeded(data);
    return data;
};

// Save skill data to localStorage
export const saveSkillData = (skillData) => {
    localStorage.setItem("gameData", JSON.stringify(skillData));
};

// Get skill level and XP
export const getSkillInfo = (skillName) => {
    const skillData = getSkillData();
    let skillLevel = 1;
    let skillXP = 0;
    let xpToNext = 0;
    Object.entries(skillData).forEach(([category, skills]) => {
        if (skills[skillName]) {
            skillLevel = skills[skillName].level;
            skillXP = skills[skillName].xp;
            const nextLevel = skillLevel + 1;
            const xpForNext = SKILL_XP_REQUIREMENTS[nextLevel] || 0;
            xpToNext = Math.max(0, xpForNext - skillXP);
        }
    });
    return {
        level: skillLevel,
        xp: skillXP,
        xpToNext: xpToNext
    };
};

// Add experience to a skill
export const addSkillExperience = (skillName, xpAmount) => {
    const skillData = getSkillData();
    let skillUpdated = false;
    Object.entries(skillData).forEach(([category, skills]) => {
        if (skills[skillName]) {
            let { level, xp } = skills[skillName];
            xp += xpAmount;
            let newLevel = level;
            // Level up as long as enough XP
            while (newLevel < 99 && xp >= (SKILL_XP_REQUIREMENTS[newLevel + 1] || Infinity)) {
                newLevel++;
            }
            if (newLevel !== level) {
                skillUpdated = true;
            }
            skills[skillName] = { level: newLevel, xp };
        }
    });
    saveSkillData(skillData);
    return skillUpdated;
};

// Battle action to skill mapping
const BATTLE_ACTION_SKILLS = {
    // Melee attacks
    'stab': ['stab', 'critChance'],
    'slash': ['slash', 'critDamage'],
    'crush': ['crush', 'critChance'],
    
    // Ranged attacks
    'archery': ['archery', 'critChance'],
    'throwing': ['throwing', 'critChance'],
    'poison': ['poison', 'critChance'],
    
    // Magic attacks
    'lightning': ['lightning', 'critChance'],
    'fire': ['fire', 'critChance'],
    'ice': ['ice', 'critChance'],
    
    // Defense actions
    'block': ['block', 'armor'],
    'dodge': ['dodge', 'armor'],
    'defend': ['armor', 'block', 'dodge'],
    
    // Utility actions
    'heal': ['heal', 'hp'],
    'buff': ['buff', 'energy'],
    
    // Passive gains
    'battle_participation': ['hp', 'armor'], // Every battle gives HP and armor experience
    'damage_taken': ['armor', 'block', 'dodge'], // Taking damage improves defense
    'damage_dealt': ['critChance', 'critDamage'] // Dealing damage improves offense
};

// Calculate XP based on battle action
export const calculateBattleActionXP = (action, damage = 0, isCritical = false, isHit = true) => {
    let baseXP = 0;
    
    switch (action) {
        case 'stab':
            baseXP = 10;
            if (isCritical) baseXP += 15;
            if (damage > 0) baseXP += Math.floor(damage / 2);
            break;
            
        case 'slash':
            baseXP = 12;
            if (isCritical) baseXP += 20;
            if (damage > 0) baseXP += Math.floor(damage / 1.5);
            break;
            
        case 'crush':
            baseXP = 15;
            if (isCritical) baseXP += 25;
            if (damage > 0) baseXP += Math.floor(damage / 1.2);
            break;
            
        case 'archery':
            baseXP = 8;
            if (isCritical) baseXP += 12;
            if (damage > 0) baseXP += Math.floor(damage / 2.5);
            break;
            
        case 'throwing':
            baseXP = 6;
            if (isCritical) baseXP += 10;
            if (damage > 0) baseXP += Math.floor(damage / 3);
            break;
            
        case 'lightning':
            baseXP = 10;
            if (isCritical) baseXP += 15;
            if (damage > 0) baseXP += Math.floor(damage / 2);
            break;
            
        case 'fire':
            baseXP = 10;
            if (isCritical) baseXP += 15;
            if (damage > 0) baseXP += Math.floor(damage / 2);
            break;
            
        case 'ice':
            baseXP = 10;
            if (isCritical) baseXP += 15;
            if (damage > 0) baseXP += Math.floor(damage / 2);
            break;
            
        case 'block':
            baseXP = 8;
            break;
            
        case 'dodge':
            baseXP = 10; // More XP for dodging
            break;
            
        case 'defend':
            baseXP = 8; // More XP for defending
            break;
            
        case 'battle_participation':
            baseXP = 5; // More XP for participating in battle (HP and armor)
            break;
            
        case 'damage_taken':
            baseXP = Math.floor(damage / 2); // More XP for taking damage (armor, block, dodge)
            break;
            
        case 'damage_dealt':
            baseXP = Math.floor(damage / 4); // XP based on damage dealt
            break;
            
        default:
            baseXP = 5;
    }
    
    return Math.max(1, baseXP); // Minimum 1 XP
};

// Award XP for battle actions
export const awardBattleActionXP = (action, damage = 0, isCritical = false, isHit = true) => {
    const xpAmount = calculateBattleActionXP(action, damage, isCritical, isHit);
    const skillsToAward = BATTLE_ACTION_SKILLS[action] || [];
    
    let leveledUp = false;
    
    skillsToAward.forEach(skillName => {
        const didLevelUp = addSkillExperience(skillName, xpAmount);
        if (didLevelUp) {
            leveledUp = true;
        }
    });
    
    return {
        xpAwarded: xpAmount,
        skillsAwarded: skillsToAward,
        leveledUp: leveledUp
    };
};

// Determine attack type based on equipped weapon
export const getAttackTypeFromWeapon = (equippedWeapon) => {
    if (!equippedWeapon) {
        return 'stab'; // Default attack
    }
    
    const weaponName = equippedWeapon.name.toLowerCase();
    
    // Melee weapons
    if (weaponName.includes('sword') || weaponName.includes('dagger') || weaponName.includes('blade')) {
        return 'stab';
    } 
    
    if (weaponName.includes('axe') || weaponName.includes('cleaver')) {
        return 'slash';
    } 
    
    if (weaponName.includes('hammer') || weaponName.includes('club') || weaponName.includes('mace')) {
        return 'crush';
    }
    
    // Ranged weapons
    if (weaponName.includes('bow') || weaponName.includes('arrow')) {
        return 'archery';
    } 
    
    if (weaponName.includes('throwing') || weaponName.includes('knife')) {
        return 'throwing';
    }
    
    // Magic weapons
    if (weaponName.includes('staff') || weaponName.includes('wand')) {
        // Magic weapons - determine by weapon stats
        if (equippedWeapon.stats?.FIRE_DAMAGE) {
            return 'fire';
        }
        if (equippedWeapon.stats?.LIGHTNING_DAMAGE) {
            return 'lightning';
        }
        if (equippedWeapon.stats?.ICE_DAMAGE) {
            return 'ice';
        }
        return 'lightning'; // Default magic
    }
    
    // Special cases for specific weapons
    if (weaponName.includes('rusty sword') || weaponName.includes('bone sword')) {
        return 'stab';
    }
    
    if (weaponName.includes('orc axe')) {
        return 'slash';
    }
    
    if (weaponName.includes('troll club')) {
        return 'crush';
    }
    
    if (weaponName.includes('dragon flame sword')) {
        return 'fire';
    }
    
    return 'stab'; // Default
};

// Get equipped weapon from localStorage
export const getEquippedWeapon = () => {
    const equippedItems = JSON.parse(localStorage.getItem("equippedItems") || "{}");
    return equippedItems.weapon || null;
};

// Get weapon type from equipped weapon
export const getWeaponType = (equippedWeapon) => {
    if (!equippedWeapon) {
        return 'melee'; // Default to melee
    }
    
    const weaponName = equippedWeapon.name.toLowerCase();
    
    // Melee weapons
    if (weaponName.includes('sword') || weaponName.includes('dagger') || weaponName.includes('blade') ||
        weaponName.includes('axe') || weaponName.includes('cleaver') || weaponName.includes('hammer') || 
        weaponName.includes('club') || weaponName.includes('mace') || weaponName.includes('rusty sword') || 
        weaponName.includes('bone sword') || weaponName.includes('orc axe') || weaponName.includes('troll club')) {
        return 'melee';
    }
    
    // Ranged weapons
    if (weaponName.includes('bow') || weaponName.includes('arrow') || weaponName.includes('throwing') || 
        weaponName.includes('knife')) {
        return 'ranged';
    }
    
    // Magic weapons
    if (weaponName.includes('staff') || weaponName.includes('wand') || weaponName.includes('dragon flame sword')) {
        return 'magic';
    }
    
    return 'melee'; // Default
};

// Get available attack types based on weapon type
export const getAvailableAttackTypes = (weaponType) => {
    switch (weaponType) {
        case 'melee':
            return [
                { type: 'stab', name: 'Stab', icon: '🗡️', description: '🗡️ Stab: +XP to Stab skill (Accuracy/Crit Chance)' },
                { type: 'slash', name: 'Slash', icon: '⚔️', description: '⚔️ Slash: +XP to Slash skill (Max Damage Bonus)' },
                { type: 'crush', name: 'Crush', icon: '🔨', description: '🔨 Crush: +XP to Crush skill (Crit Damage)' }
            ];
        case 'ranged':
            return [
                { type: 'archery', name: 'Archery', icon: '🏹', description: '🏹 Archery: +XP to Archery skill (Crit Chance)' },
                { type: 'throwing', name: 'Throwing', icon: '🎯', description: '🎯 Throwing: +XP to Throwing skill (Attack Speed)' },
                { type: 'poison', name: 'Poison', icon: '☠️', description: '☠️ Poison: +XP to Poison skill (Damage over Time)' }
            ];
        case 'magic':
            return [
                { type: 'lightning', name: 'Lightning', icon: '⚡', description: '⚡ Lightning: +XP to Lightning skill (+Attack Power)' },
                { type: 'fire', name: 'Fire', icon: '🔥', description: '🔥 Fire: +XP to Fire skill (+Attack Power)' },
                { type: 'ice', name: 'Ice', icon: '❄️', description: '❄️ Ice: +XP to Ice skill (+Attack Power)' }
            ];
        default:
            return [
                { type: 'stab', name: 'Stab', icon: '🗡️', description: '🗡️ Stab: +XP to Stab skill (Accuracy/Crit Chance)' },
                { type: 'slash', name: 'Slash', icon: '⚔️', description: '⚔️ Slash: +XP to Slash skill (Max Damage Bonus)' },
                { type: 'crush', name: 'Crush', icon: '🔨', description: '🔨 Crush: +XP to Crush skill (Crit Damage)' }
            ];
    }
};

// Debug function to test skill leveling
export const debugSkillLeveling = (skillName) => {
    const skillInfo = getSkillInfo(skillName);
    console.log(`🔍 Debug - ${skillName}:`, skillInfo);
    
    // Test adding XP
    const testXP = 50;
    const leveledUp = addSkillExperience(skillName, testXP);
    const newSkillInfo = getSkillInfo(skillName);
    
    console.log(`🔍 Debug - Added ${testXP} XP to ${skillName}:`, {
        leveledUp,
        oldLevel: skillInfo.level,
        newLevel: newSkillInfo.level,
        oldXP: skillInfo.xp,
        newXP: newSkillInfo.xp
    });
    
    return { leveledUp, oldLevel: skillInfo.level, newLevel: newSkillInfo.level };
};

// Debug function to check XP requirements
export const debugXPRequirements = () => {
    console.log('🔍 XP Requirements for first 10 levels:');
    for (let level = 1; level <= 10; level++) {
        let totalXP = 0;
        for (let l = 1; l <= level; l++) {
            totalXP += SKILL_XP_REQUIREMENTS[l] || 0;
        }
        console.log(`Level ${level}: ${totalXP} total XP needed`);
    }
}; 