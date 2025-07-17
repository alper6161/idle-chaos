// Skill Experience System

import { INITIAL_SKILLS } from './constants.js';
import { applyExperienceMultiplier } from './buffUtils.js';

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
};

for (let level = 11; level <= 99; level++) {
    SKILL_XP_REQUIREMENTS[level] = SKILL_XP_REQUIREMENTS[level - 1] + (level * 25);
}

function migrateSkillDataIfNeeded(skillData) {
    let migrated = false;
    const newData = {};
    Object.entries(skillData).forEach(([category, skills]) => {
        newData[category] = {};
        Object.entries(skills).forEach(([skillName, value]) => {
            if (typeof value === 'number') {
                newData[category][skillName] = { level: value, xp: 0 };
                migrated = true;
            } else if (typeof value === 'object' && value !== null && 'level' in value && 'xp' in value) {
                newData[category][skillName] = value;
            }
        });
    });
    return migrated ? newData : skillData;
}

export const getSkillData = () => {
    try {
        const currentSlot = localStorage.getItem('idle-chaos-current-slot');
        const slotNumber = currentSlot ? parseInt(currentSlot) : 1;
        const slotKey = `skillData_slot_${slotNumber}`;
        
        const saved = localStorage.getItem(slotKey);
        let data = saved ? JSON.parse(saved) : INITIAL_SKILLS;
        data = migrateSkillDataIfNeeded(data);
        
        return data;
    } catch (error) {
        console.error('Error getting skill data:', error);
        return INITIAL_SKILLS;
    }
};

export const saveSkillData = (skillData) => {
    try {
        const currentSlot = localStorage.getItem('idle-chaos-current-slot');
        const slotNumber = currentSlot ? parseInt(currentSlot) : 1;
        const slotKey = `skillData_slot_${slotNumber}`;
        localStorage.setItem(slotKey, JSON.stringify(skillData));
    } catch (error) {
        console.error('Error saving skill data:', error);
    }
};

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

export const addSkillExperience = (skillName, xpAmount) => {
    
    const skillData = getSkillData();
    
    let skillUpdated = false;
    Object.entries(skillData).forEach(([category, skills]) => {
        if (skills[skillName]) {
            let { level, xp } = skills[skillName];
            
            xp += xpAmount;
            let newLevel = level;
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

const BATTLE_ACTION_SKILLS = {
    'stab': ['stab', 'critChance'],
    'slash': ['slash', 'critDamage'],
    'crush': ['crush', 'critChance'],
    
    'archery': ['archery', 'critChance'],
    'throwing': ['throwing', 'attackSpeed'],
    'poison': ['poison', 'lifeSteal'],
    
    'lightning': ['lightning', 'critDamage'],
    'fire': ['fire', 'critDamage'],
    'ice': ['ice', 'critDamage'],
    
    'block': ['block', 'armor'],
    'dodge': ['dodge', 'armor'],
    'defend': ['armor', 'block', 'dodge'],
    
    'heal': ['heal', 'hp'],
    'buff': ['buff', 'energyShield'],
    'debuff': ['debuff'],
    
    'battle_participation': ['hp', 'armor'],
    'damage_taken': ['armor', 'block', 'dodge'],
    'damage_dealt': ['critChance', 'critDamage']
};

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
            baseXP = 10;
            break;
            
        case 'defend':
            baseXP = 8;
            break;
            
        case 'battle_participation':
            baseXP = 5;
            break;
            
        case 'damage_taken':
            baseXP = Math.floor(damage / 2);
            break;
            
        case 'damage_dealt':
            baseXP = Math.floor(damage / 4);
            break;
            
        default:
            baseXP = 5;
    }
    
    return Math.max(1, baseXP);
};

export const awardBattleActionXP = (action, damage = 0, isCritical = false, isHit = true) => {
    const baseXP = calculateBattleActionXP(action, damage, isCritical, isHit);
    const xpAmount = applyExperienceMultiplier(baseXP);
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

export const getAttackTypeFromWeapon = (equippedWeapon) => {
    if (!equippedWeapon) {
        return 'stab';
    }
    
    const weaponName = equippedWeapon.name.toLowerCase();
    
    if (weaponName.includes('sword') || weaponName.includes('dagger') || weaponName.includes('blade')) {
        return 'stab';
    } 
    
    if (weaponName.includes('axe') || weaponName.includes('cleaver')) {
        return 'slash';
    } 
    
    if (weaponName.includes('hammer') || weaponName.includes('club') || weaponName.includes('mace')) {
        return 'crush';
    }
    
    if (weaponName.includes('bow') || weaponName.includes('arrow')) {
        return 'archery';
    } 
    
    if (weaponName.includes('throwing') || weaponName.includes('knife')) {
        return 'throwing';
    }
    
    if (weaponName.includes('staff') || weaponName.includes('wand')) {
        if (equippedWeapon.stats?.FIRE_DAMAGE) {
            return 'fire';
        }
        if (equippedWeapon.stats?.LIGHTNING_DAMAGE) {
            return 'lightning';
        }
        if (equippedWeapon.stats?.ICE_DAMAGE) {
            return 'ice';
        }
        return 'lightning';
    }
    
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
    
    return 'stab';
};

export const getEquippedWeapon = () => {
    try {
        const currentSlot = localStorage.getItem('idle-chaos-current-slot');
        const slotNumber = currentSlot ? parseInt(currentSlot) : 1;
        const slotKey = `equippedItems_slot_${slotNumber}`;
        const equippedItems = JSON.parse(localStorage.getItem(slotKey) || "{}");
        return equippedItems.weapon || null;
    } catch (error) {
        console.error('Error getting equipped weapon:', error);
        return null;
    }
};

export const getWeaponType = (equippedWeapon) => {
    if (!equippedWeapon) {
        return 'melee';
    }
    
    if (equippedWeapon.weaponType) {
        return equippedWeapon.weaponType;
    }
    
    const weaponName = equippedWeapon.name.toLowerCase();
    
    if (weaponName.includes('sword') || weaponName.includes('dagger') || weaponName.includes('blade') ||
        weaponName.includes('axe') || weaponName.includes('cleaver') || weaponName.includes('hammer') || 
        weaponName.includes('club') || weaponName.includes('mace') || weaponName.includes('rusty sword') || 
        weaponName.includes('bone sword') || weaponName.includes('orc axe') || weaponName.includes('troll club')) {
        return 'melee';
    }
    
    if (weaponName.includes('bow') || weaponName.includes('arrow') || weaponName.includes('throwing') || 
        weaponName.includes('knife')) {
        return 'ranged';
    }
    
    if (weaponName.includes('staff') || weaponName.includes('wand') || weaponName.includes('dragon flame sword')) {
        return 'magic';
    }
    
    return 'melee';
};

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

 

export const initializeSkillDataForCurrentSlot = () => {
    try {
        const currentSlot = localStorage.getItem('idle-chaos-current-slot');
        const slotNumber = currentSlot ? parseInt(currentSlot) : 1;
        const slotKey = `skillData_slot_${slotNumber}`;
        
        // Check if skill data already exists
        const existing = localStorage.getItem(slotKey);
        if (!existing) {
            localStorage.setItem(slotKey, JSON.stringify(INITIAL_SKILLS));
        }
    } catch (error) {
        console.error('Error initializing skill data:', error);
    }
}; 