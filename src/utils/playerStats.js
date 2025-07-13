import { getBuffedPlayerStats } from './buffUtils.js';
import { getSkillData } from './skillExperience.js';

export const BASE_PLAYER_STATS = {
    ATK: 10,
    DEF: 5,
    HEALTH: 100,
    ATTACK_SPEED: 2.5,
    CRIT_CHANCE: 5,
    CRIT_DAMAGE: 150
};

const EQUIPPED_ITEMS_KEY = 'idle-chaos-equipped-items';

export const getEquippedItems = () => {
    try {
        const stored = localStorage.getItem(EQUIPPED_ITEMS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error('Error loading equipped items:', error);
        return {};
    }
};

export const calculateEquipmentStats = () => {
    const equippedItems = getEquippedItems();
    const totalStats = {};

    Object.values(equippedItems).forEach(item => {
        if (item && item.stats) {
            Object.entries(item.stats).forEach(([stat, value]) => {
                // HP'yi HEALTH olarak da ekle
                const key = stat === "HP" ? "HEALTH" : stat;
                totalStats[key] = (totalStats[key] || 0) + value;
            });
        }
    });

    return totalStats;
};

// Calculate skill buffs based on skill levels
export const calculateSkillBuffs = () => {
    const skillData = getSkillData();
    const skillBuffs = {};

    // Helper function to get skill level safely
    const getSkillLevel = (skillObj) => {
        if (!skillObj) return 0;
        if (typeof skillObj === 'number') return skillObj;
        if (typeof skillObj === 'object' && skillObj.level !== undefined) return skillObj.level;
        return 0;
    };

    // Melee skills
    if (skillData.melee?.stab) {
        const stabLevel = getSkillLevel(skillData.melee.stab);
        skillBuffs.ACCURACY_BONUS = (skillBuffs.ACCURACY_BONUS || 0) + (stabLevel * 0.8); // +0.8% accuracy per level
    }

    if (skillData.melee?.slash) {
        const slashLevel = getSkillLevel(skillData.melee.slash);
        skillBuffs.DAMAGE_RANGE_BONUS = (skillBuffs.DAMAGE_RANGE_BONUS || 0) + (slashLevel * 0.5); // +0.5 max damage per level
    }

    if (skillData.melee?.crush) {
        const crushLevel = getSkillLevel(skillData.melee.crush);
        skillBuffs.CRIT_DAMAGE = (skillBuffs.CRIT_DAMAGE || 0) + (crushLevel * 2); // +2% crit damage per level
    }

    // Ranged skills
    if (skillData.ranged?.archery) {
        const archeryLevel = getSkillLevel(skillData.ranged.archery);
        skillBuffs.CRIT_CHANCE = (skillBuffs.CRIT_CHANCE || 0) + (archeryLevel * 0.4); // +0.4% crit per level
    }

    if (skillData.ranged?.throwing) {
        const throwingLevel = getSkillLevel(skillData.ranged.throwing);
        skillBuffs.ATTACK_SPEED = (skillBuffs.ATTACK_SPEED || 0) + (throwingLevel * 0.05); // +0.05 attack speed per level
    }

    // Magic skills
    if (skillData.magic?.lightning) {
        const lightningLevel = getSkillLevel(skillData.magic.lightning);
        skillBuffs.ATK = (skillBuffs.ATK || 0) + (lightningLevel * 0.4); // +0.4 ATK per level
    }

    if (skillData.magic?.fire) {
        const fireLevel = getSkillLevel(skillData.magic.fire);
        skillBuffs.ATK = (skillBuffs.ATK || 0) + (fireLevel * 0.4); // +0.4 ATK per level
    }

    if (skillData.magic?.ice) {
        const iceLevel = getSkillLevel(skillData.magic.ice);
        skillBuffs.ATK = (skillBuffs.ATK || 0) + (iceLevel * 0.4); // +0.4 ATK per level
    }

    // Defense skills
    if (skillData.defence?.dodge) {
        const dodgeLevel = getSkillLevel(skillData.defence.dodge);
        skillBuffs.DEF = (skillBuffs.DEF || 0) + (dodgeLevel * 0.2); // +0.2 DEF per level
    }

    if (skillData.defence?.block) {
        const blockLevel = getSkillLevel(skillData.defence.block);
        skillBuffs.DEF = (skillBuffs.DEF || 0) + (blockLevel * 0.3); // +0.3 DEF per level
    }

    if (skillData.defence?.armor) {
        const armorLevel = getSkillLevel(skillData.defence.armor);
        skillBuffs.DEF = (skillBuffs.DEF || 0) + (armorLevel * 0.4); // +0.4 DEF per level
        skillBuffs.HEALTH = (skillBuffs.HEALTH || 0) + (armorLevel * 2); // +2 HP per level
    }

    // Hitpool skills
    if (skillData.hitpool?.hp) {
        const hpLevel = getSkillLevel(skillData.hitpool.hp);
        skillBuffs.HEALTH = (skillBuffs.HEALTH || 0) + (hpLevel * 3); // +3 HP per level
    }

    // Utility skills
    if (skillData.utility?.critChance) {
        const critChanceLevel = getSkillLevel(skillData.utility.critChance);
        skillBuffs.CRIT_CHANCE = (skillBuffs.CRIT_CHANCE || 0) + (critChanceLevel * 0.5); // +0.5% crit per level
    }

    if (skillData.utility?.critDamage) {
        const critDamageLevel = getSkillLevel(skillData.utility.critDamage);
        skillBuffs.CRIT_DAMAGE = (skillBuffs.CRIT_DAMAGE || 0) + (critDamageLevel * 1); // +1% crit damage per level
    }

    return skillBuffs;
};

export const getPlayerStats = () => {
    const equipmentStats = calculateEquipmentStats();
    const skillBuffs = calculateSkillBuffs();
    const finalStats = { ...BASE_PLAYER_STATS };

    // Apply equipment stats
    Object.entries(equipmentStats).forEach(([stat, value]) => {
        if (finalStats.hasOwnProperty(stat)) {
            finalStats[stat] += value;
        }
    });

    // Apply skill buffs
    Object.entries(skillBuffs).forEach(([stat, value]) => {
        if (finalStats.hasOwnProperty(stat)) {
            finalStats[stat] += value;
        }
    });

    // Skill buffs are applied silently - no need to log every time

    // Apply minimum/maximum limits
    finalStats.ATK = Math.max(1, finalStats.ATK);
    finalStats.DEF = Math.max(1, finalStats.DEF);
    finalStats.HEALTH = Math.max(10, finalStats.HEALTH);
    finalStats.ATTACK_SPEED = Math.max(0.5, finalStats.ATTACK_SPEED);
    finalStats.CRIT_CHANCE = Math.max(0, Math.min(100, finalStats.CRIT_CHANCE));
    finalStats.CRIT_DAMAGE = Math.max(100, finalStats.CRIT_DAMAGE);

    // Apply store buffs
    try {
        return getBuffedPlayerStats(finalStats);
    } catch (error) {
        console.error('Error applying buffs:', error);
        return finalStats;
    }
};

export const getEquipmentBonuses = () => {
    const equipmentStats = calculateEquipmentStats();
    const skillBuffs = calculateSkillBuffs();
    const bonuses = {};

    // Equipment bonuses
    Object.entries(equipmentStats).forEach(([stat, value]) => {
        if (BASE_PLAYER_STATS.hasOwnProperty(stat)) {
            bonuses[stat] = (bonuses[stat] || 0) + value;
        }
    });

    // Skill bonuses
    Object.entries(skillBuffs).forEach(([stat, value]) => {
        if (BASE_PLAYER_STATS.hasOwnProperty(stat)) {
            bonuses[stat] = (bonuses[stat] || 0) + value;
        }
    });

    return bonuses;
};