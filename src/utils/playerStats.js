import { getBuffedPlayerStats } from './buffUtils.js';
import { getSkillData } from './skillExperience.js';
import { SKILL_LEVEL_BONUSES } from './constants.js';

export const BASE_PLAYER_STATS = {
    ATK: 1,
    DEF: 1,
    MAGIC_RES: 1,
    HEALTH: 10,
    ATTACK_SPEED: 2.0,
};

const getSlotKey = (key, slotNumber) => `${key}_slot_${slotNumber}`;

const getCurrentSlot = () => {
    try {
        const currentSlot = localStorage.getItem('idle-chaos-current-slot');
        return currentSlot ? parseInt(currentSlot) : 1;
    } catch (error) {
        console.error('Error getting current slot:', error);
        return 1;
    }
};

const EQUIPPED_ITEMS_KEY = 'idle-chaos-equipped-items';

export const getEquippedItems = () => {
    try {
        const currentSlot = getCurrentSlot();
        const slotKey = getSlotKey(EQUIPPED_ITEMS_KEY, currentSlot);
        const stored = localStorage.getItem(slotKey);
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
                const key = stat === "HP" ? "HEALTH" : stat;
                totalStats[key] = (totalStats[key] || 0) + value;
            });
        }
    });

    return totalStats;
};

export const calculateSkillBuffs = () => {
    const skillData = getSkillData();
    const skillBuffs = {};

    const getSkillLevel = (skillObj) => {
        if (!skillObj) return 0;
        if (typeof skillObj === 'number') return skillObj;
        if (typeof skillObj === 'object' && skillObj.level !== undefined) return skillObj.level;
        return 0;
    };

    if (skillData.melee?.stab) {
        const stabLevel = getSkillLevel(skillData.melee.stab);
        skillBuffs.ACCURACY_BONUS = (skillBuffs.ACCURACY_BONUS || 0) + (stabLevel * 0.8);
    }

    if (skillData.melee?.slash) {
        const slashLevel = getSkillLevel(skillData.melee.slash);
        skillBuffs.DAMAGE_RANGE_BONUS = (skillBuffs.DAMAGE_RANGE_BONUS || 0) + (slashLevel * 0.5);
    }

    if (skillData.melee?.crush) {
        const crushLevel = getSkillLevel(skillData.melee.crush);
        skillBuffs.CRIT_DAMAGE = (skillBuffs.CRIT_DAMAGE || 0) + (crushLevel * 2);
    }

    if (skillData.ranged?.archery) {
        const archeryLevel = getSkillLevel(skillData.ranged.archery);
        skillBuffs.CRIT_CHANCE = (skillBuffs.CRIT_CHANCE || 0) + (archeryLevel * 0.4);
    }

    if (skillData.ranged?.throwing) {
        const throwingLevel = getSkillLevel(skillData.ranged.throwing);
        skillBuffs.ATTACK_SPEED = (skillBuffs.ATTACK_SPEED || 0) + (throwingLevel * 0.05);
    }

    if (skillData.magic?.lightning) {
        const lightningLevel = getSkillLevel(skillData.magic.lightning);
        skillBuffs.ATK = (skillBuffs.ATK || 0) + (lightningLevel * 0.4);
    }

    if (skillData.magic?.fire) {
        const fireLevel = getSkillLevel(skillData.magic.fire);
        skillBuffs.ATK = (skillBuffs.ATK || 0) + (fireLevel * 0.4);
    }

    if (skillData.magic?.ice) {
        const iceLevel = getSkillLevel(skillData.magic.ice);
        skillBuffs.ATK = (skillBuffs.ATK || 0) + (iceLevel * 0.4);
    }

    if (skillData.defence?.dodge) {
        const dodgeLevel = getSkillLevel(skillData.defence.dodge);
        skillBuffs.DEF = (skillBuffs.DEF || 0) + (dodgeLevel * 0.2);
    }

    if (skillData.defence?.block) {
        const blockLevel = getSkillLevel(skillData.defence.block);
        skillBuffs.DEF = (skillBuffs.DEF || 0) + (blockLevel * 0.3);
    }

    if (skillData.defence?.armor) {
        const armorLevel = getSkillLevel(skillData.defence.armor);
        skillBuffs.DEF = (skillBuffs.DEF || 0) + (armorLevel * 0.4);
        skillBuffs.HEALTH = (skillBuffs.HEALTH || 0) + (armorLevel * 2);
    }

    if (skillData.hitpool?.hp) {
        const hpLevel = getSkillLevel(skillData.hitpool.hp);
        skillBuffs.HEALTH = (skillBuffs.HEALTH || 0) + (hpLevel * 3);
    }

    if (skillData.holy?.critChance) {
        const critChanceLevel = getSkillLevel(skillData.holy.critChance);
        skillBuffs.CRIT_CHANCE = (skillBuffs.CRIT_CHANCE || 0) + (critChanceLevel * 0.5);
    }

    if (skillData.holy?.critDamage) {
        const critDamageLevel = getSkillLevel(skillData.holy.critDamage);
        skillBuffs.CRIT_DAMAGE = (skillBuffs.CRIT_DAMAGE || 0) + (critDamageLevel * 1);
    }

    return skillBuffs;
};

export const calculateSkillBuffsForAttackType = (selectedAttackType) => {
    const skillData = getSkillData();
    const skillBuffs = {};

    const getSkillLevel = (skillObj) => {
        if (!skillObj) return 0;
        if (typeof skillObj === 'number') return skillObj;
        if (typeof skillObj === 'object' && skillObj.level !== undefined) return skillObj.level;
        return 0;
    };

    const calculateSkillLevelBonus = (skillName) => {
        const skillBonus = SKILL_LEVEL_BONUSES[skillName];
        if (!skillBonus) return { ATK: 0, MIN_DAMAGE: 0, MAX_DAMAGE: 0 };

        let skillLevel = 0;
        Object.values(skillData).forEach(category => {
            if (category[skillName]) {
                skillLevel = getSkillLevel(category[skillName]);
            }
        });

        return {
            ATK: skillBonus.ATK * skillLevel,
            MIN_DAMAGE: skillBonus.MIN_DAMAGE * skillLevel,
            MAX_DAMAGE: skillBonus.MAX_DAMAGE * skillLevel
        };
    };

    switch (selectedAttackType) {
        case 'stab':
            if (skillData.melee?.stab) {
                const stabBonus = calculateSkillLevelBonus('stab');
                skillBuffs.ATK = (skillBuffs.ATK || 0) + stabBonus.ATK;
                skillBuffs.MIN_DAMAGE = (skillBuffs.MIN_DAMAGE || 0) + stabBonus.MIN_DAMAGE;
                skillBuffs.MAX_DAMAGE = (skillBuffs.MAX_DAMAGE || 0) + stabBonus.MAX_DAMAGE;
            }
            break;
        case 'slash':
            if (skillData.melee?.slash) {
                const slashBonus = calculateSkillLevelBonus('slash');
                skillBuffs.ATK = (skillBuffs.ATK || 0) + slashBonus.ATK;
                skillBuffs.MIN_DAMAGE = (skillBuffs.MIN_DAMAGE || 0) + slashBonus.MIN_DAMAGE;
                skillBuffs.MAX_DAMAGE = (skillBuffs.MAX_DAMAGE || 0) + slashBonus.MAX_DAMAGE;
            }
            break;
        case 'crush':
            if (skillData.melee?.crush) {
                const crushBonus = calculateSkillLevelBonus('crush');
                skillBuffs.ATK = (skillBuffs.ATK || 0) + crushBonus.ATK;
                skillBuffs.MIN_DAMAGE = (skillBuffs.MIN_DAMAGE || 0) + crushBonus.MIN_DAMAGE;
                skillBuffs.MAX_DAMAGE = (skillBuffs.MAX_DAMAGE || 0) + crushBonus.MAX_DAMAGE;
            }
            break;
        case 'archery':
            if (skillData.ranged?.archery) {
                const archeryBonus = calculateSkillLevelBonus('archery');
                skillBuffs.ATK = (skillBuffs.ATK || 0) + archeryBonus.ATK;
                skillBuffs.MIN_DAMAGE = (skillBuffs.MIN_DAMAGE || 0) + archeryBonus.MIN_DAMAGE;
                skillBuffs.MAX_DAMAGE = (skillBuffs.MAX_DAMAGE || 0) + archeryBonus.MAX_DAMAGE;
            }
            break;
        case 'throwing':
            if (skillData.ranged?.throwing) {
                const throwingBonus = calculateSkillLevelBonus('throwing');
                skillBuffs.ATK = (skillBuffs.ATK || 0) + throwingBonus.ATK;
                skillBuffs.MIN_DAMAGE = (skillBuffs.MIN_DAMAGE || 0) + throwingBonus.MIN_DAMAGE;
                skillBuffs.MAX_DAMAGE = (skillBuffs.MAX_DAMAGE || 0) + throwingBonus.MAX_DAMAGE;
            }
            break;
        case 'lightning':
            if (skillData.magic?.lightning) {
                const lightningBonus = calculateSkillLevelBonus('lightning');
                skillBuffs.ATK = (skillBuffs.ATK || 0) + lightningBonus.ATK;
                skillBuffs.MIN_DAMAGE = (skillBuffs.MIN_DAMAGE || 0) + lightningBonus.MIN_DAMAGE;
                skillBuffs.MAX_DAMAGE = (skillBuffs.MAX_DAMAGE || 0) + lightningBonus.MAX_DAMAGE;
            }
            break;
        case 'fire':
            if (skillData.magic?.fire) {
                const fireBonus = calculateSkillLevelBonus('fire');
                skillBuffs.ATK = (skillBuffs.ATK || 0) + fireBonus.ATK;
                skillBuffs.MIN_DAMAGE = (skillBuffs.MIN_DAMAGE || 0) + fireBonus.MIN_DAMAGE;
                skillBuffs.MAX_DAMAGE = (skillBuffs.MAX_DAMAGE || 0) + fireBonus.MAX_DAMAGE;
            }
            break;
        case 'ice':
            if (skillData.magic?.ice) {
                const iceBonus = calculateSkillLevelBonus('ice');
                skillBuffs.ATK = (skillBuffs.ATK || 0) + iceBonus.ATK;
                skillBuffs.MIN_DAMAGE = (skillBuffs.MIN_DAMAGE || 0) + iceBonus.MIN_DAMAGE;
                skillBuffs.MAX_DAMAGE = (skillBuffs.MAX_DAMAGE || 0) + iceBonus.MAX_DAMAGE;
            }
            break;
    }

    if (skillData.defence?.dodge) {
        const dodgeLevel = getSkillLevel(skillData.defence.dodge);
        skillBuffs.DEF = (skillBuffs.DEF || 0) + (dodgeLevel * 0.2);
    }

    if (skillData.defence?.block) {
        const blockLevel = getSkillLevel(skillData.defence.block);
        skillBuffs.DEF = (skillBuffs.DEF || 0) + (blockLevel * 0.3);
    }

    if (skillData.defence?.armor) {
        const armorLevel = getSkillLevel(skillData.defence.armor);
        skillBuffs.DEF = (skillBuffs.DEF || 0) + (armorLevel * 0.4);
        skillBuffs.HEALTH = (skillBuffs.HEALTH || 0) + (armorLevel * 2);
    }

    if (skillData.hitpool?.hp) {
        const hpLevel = getSkillLevel(skillData.hitpool.hp);
        skillBuffs.HEALTH = (skillBuffs.HEALTH || 0) + (hpLevel * 3);
    }

    if (selectedAttackType === 'archery' && skillData.holy?.critChance) {
        const critChanceLevel = getSkillLevel(skillData.holy.critChance);
        skillBuffs.CRIT_CHANCE = (skillBuffs.CRIT_CHANCE || 0) + (critChanceLevel * 0.5);
    }

    if (selectedAttackType === 'crush' && skillData.holy?.critDamage) {
        const critDamageLevel = getSkillLevel(skillData.holy.critDamage);
        skillBuffs.CRIT_DAMAGE = (skillBuffs.CRIT_DAMAGE || 0) + (critDamageLevel * 1);
    }

    return skillBuffs;
};

export const getPlayerStats = () => {
    const equipmentStats = calculateEquipmentStats();
    const skillBuffs = calculateSkillBuffs();
    const finalStats = { ...BASE_PLAYER_STATS };

    Object.entries(equipmentStats).forEach(([stat, value]) => {
        if (finalStats.hasOwnProperty(stat)) {
            finalStats[stat] += value;
        }
    });

    Object.entries(skillBuffs).forEach(([stat, value]) => {
        if (finalStats.hasOwnProperty(stat)) {
            finalStats[stat] += value;
        }
    });

    finalStats.ATK = Math.max(1, finalStats.ATK);
    finalStats.DEF = Math.max(1, finalStats.DEF);
    finalStats.HEALTH = Math.max(10, finalStats.HEALTH);
    finalStats.ATTACK_SPEED = Math.max(0.5, finalStats.ATTACK_SPEED);
    finalStats.CRIT_CHANCE = Math.max(0, Math.min(100, finalStats.CRIT_CHANCE));
    finalStats.CRIT_DAMAGE = Math.max(100, finalStats.CRIT_DAMAGE);

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

    Object.entries(equipmentStats).forEach(([stat, value]) => {
        if (BASE_PLAYER_STATS.hasOwnProperty(stat)) {
            bonuses[stat] = (bonuses[stat] || 0) + value;
        }
    });

    Object.entries(skillBuffs).forEach(([stat, value]) => {
        if (BASE_PLAYER_STATS.hasOwnProperty(stat)) {
            bonuses[stat] = (bonuses[stat] || 0) + value;
        }
    });

    return bonuses;
};