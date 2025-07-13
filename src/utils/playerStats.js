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

// Calculate skill buffs based on skill levels and SKILL_BUFFS
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

    // Import SKILL_BUFFS from Skills.jsx
    const SKILL_BUFFS = {
        stab: {
            10: "Critical hit chance +5%",
            25: "Critical hit chance +10%, Critical damage +15%",
            50: "Critical hit chance +15%, Critical damage +25%, Attack speed +10%",
            75: "Critical hit chance +20%, Critical damage +35%, Attack speed +15%, Bleed chance +25%",
            99: "⚡ ASSASSIN'S MASTERY: Critical hit chance +25%, Critical damage +50%, Attack speed +20%, Bleed chance +35%, Life steal +10%, INSTANT KILL chance +5%"
        },
        slash: {
            10: "Attack damage +10%",
            25: "Attack damage +20%, Armor penetration +15%",
            50: "Attack damage +30%, Armor penetration +25%, Bleed chance +20%",
            75: "Attack damage +40%, Armor penetration +35%, Bleed chance +30%, Attack speed +10%",
            99: "🗡️ BLADE MASTER: Attack damage +50%, Armor penetration +50%, Bleed chance +40%, Attack speed +15%, Life steal +15%, CLEAVE ATTACK (hits 3 enemies)"
        },
        crush: {
            10: "Stun chance +5%",
            25: "Stun chance +10%, Attack damage +15%",
            50: "Stun chance +15%, Attack damage +25%, Armor penetration +20%",
            75: "Stun chance +20%, Attack damage +35%, Armor penetration +30%, Critical chance +10%",
            99: "🔨 WARHAMMER LORD: Stun chance +25%, Attack damage +45%, Armor penetration +40%, Critical chance +15%, Life steal +20%, EARTHQUAKE AOE (stuns all enemies)"
        },
        archery: {
            10: "Critical chance +8%",
            25: "Critical chance +15%, Attack speed +10%",
            50: "Critical chance +20%, Attack speed +15%, Attack range +2",
            75: "Critical chance +25%, Attack speed +20%, Attack range +3, Dodge +15%",
            99: "🏹 ARCHER LEGEND: Critical chance +30%, Attack speed +25%, Attack range +4, Dodge +20%, Life steal +10%, RAIN OF ARROWS (hits all enemies)"
        },
        throwing: {
            10: "Attack range +1",
            25: "Attack range +2, Attack speed +10%",
            50: "Attack range +3, Attack speed +15%, Critical chance +10%",
            75: "Attack range +4, Attack speed +20%, Critical chance +15%, Dodge +10%",
            99: "🎯 MASTER THROWER: Attack range +5, Attack speed +25%, Critical chance +20%, Dodge +15%, Life steal +5%, BOOMERANG EFFECT (returns for double damage)"
        },
        lightning: {
            10: "Lightning damage +15%",
            25: "Lightning damage +25%, Stun chance +10%",
            50: "Lightning damage +35%, Stun chance +15%, Attack speed +10%",
            75: "Lightning damage +45%, Stun chance +20%, Attack speed +15%, Critical chance +10%",
            99: "⚡ THUNDER GOD: Lightning damage +60%, Stun chance +25%, Attack speed +20%, Critical chance +15%, Life steal +5%, CHAIN LIGHTNING (bounces to 5 enemies)"
        },
        fire: {
            10: "Fire damage +15%",
            25: "Fire damage +25%, Burn chance +20%",
            50: "Fire damage +35%, Burn chance +30%, Attack speed +10%",
            75: "Fire damage +45%, Burn chance +40%, Attack speed +15%, Critical chance +10%",
            99: "🔥 PHOENIX LORD: Fire damage +60%, Burn chance +50%, Attack speed +20%, Critical chance +15%, Life steal +10%, INFERNO BLAST (burns all enemies for 10 seconds)"
        },
        ice: {
            10: "Ice damage +15%",
            25: "Ice damage +25%, Freeze chance +10%",
            50: "Ice damage +35%, Freeze chance +15%, Attack speed +10%",
            75: "Ice damage +45%, Freeze chance +20%, Attack speed +15%, Critical chance +10%",
            99: "❄️ FROST KING: Ice damage +60%, Freeze chance +25%, Attack speed +20%, Critical chance +15%, Life steal +5%, BLIZZARD (freezes all enemies for 5 seconds)"
        },
        dodge: {
            10: "Dodge chance +5%",
            25: "Dodge chance +10%, Attack speed +5%",
            50: "Dodge chance +15%, Attack speed +10%, Critical chance +5%",
            75: "Dodge chance +20%, Attack speed +15%, Critical chance +10%, Counter attack +15%",
            99: "👻 GHOST WARRIOR: Dodge chance +25%, Attack speed +20%, Critical chance +15%, Counter attack +25%, Life steal +10%, PHASE SHIFT (dodges all attacks for 3 seconds)"
        },
        block: {
            10: "Block chance +8%",
            25: "Block chance +15%, Damage reduction +10%",
            50: "Block chance +20%, Damage reduction +20%, Counter attack +10%",
            75: "Block chance +25%, Damage reduction +30%, Counter attack +20%, Stun chance +10%",
            99: "🛡️ IMMORTAL GUARDIAN: Block chance +30%, Damage reduction +40%, Counter attack +30%, Stun chance +15%, Life steal +15%, INVINCIBILITY SHIELD (blocks all damage for 5 seconds)"
        },
        armor: {
            10: "Defense +15%",
            25: "Defense +25%, Health +10%",
            50: "Defense +35%, Health +20%, Damage reduction +10%",
            75: "Defense +45%, Health +30%, Damage reduction +20%, Block chance +10%",
            99: "⚔️ TITAN ARMOR: Defense +60%, Health +40%, Damage reduction +30%, Block chance +15%, Life regeneration +10%, ADAMANTINE SKIN (reflects 50% damage back)"
        },
        hp: {
            10: "Maximum health +20%",
            25: "Maximum health +35%, Health regeneration +10%",
            50: "Maximum health +50%, Health regeneration +20%, Auto-heal +15%",
            75: "Maximum health +65%, Health regeneration +30%, Auto-heal +25%, Damage reduction +10%",
            99: "💎 DIAMOND BODY: Maximum health +80%, Health regeneration +40%, Auto-heal +35%, Damage reduction +20%, Life steal +10%, IMMORTALITY (cannot die below 1 HP)"
        },
        critChance: {
            10: "Critical chance +8%",
            25: "Critical chance +15%, Critical damage +10%",
            50: "Critical chance +20%, Critical damage +20%, Attack speed +5%",
            75: "Critical chance +25%, Critical damage +30%, Attack speed +10%, Life steal +10%",
            99: "🎯 CRITICAL GOD: Critical chance +30%, Critical damage +40%, Attack speed +15%, Life steal +15%, Guaranteed crit +5%, DEATH MARK (next attack is 1000% damage)"
        },
        critDamage: {
            10: "Critical damage +15%",
            25: "Critical damage +25%, Critical chance +5%",
            50: "Critical damage +35%, Critical chance +10%, Attack speed +5%",
            75: "Critical damage +45%, Critical chance +15%, Attack speed +10%, Life steal +10%",
            99: "💥 DAMAGE OVERLORD: Critical damage +60%, Critical chance +20%, Attack speed +15%, Life steal +15%, Infinite crit +5%, NUCLEAR STRIKE (deals 9999 damage to all enemies)"
        }
    };

    // Helper function to apply SKILL_BUFFS bonuses
    const applySkillBuffBonuses = (skillName, level) => {
        if (!SKILL_BUFFS[skillName]) return;
        
        Object.entries(SKILL_BUFFS[skillName]).forEach(([reqLevel, description]) => {
            if (level >= parseInt(reqLevel)) {
                // Parse description and apply bonuses
                if (description.includes("Critical hit chance") || description.includes("Critical chance")) {
                    const match = description.match(/\+(\d+)%/);
                    if (match) {
                        skillBuffs.CRIT_CHANCE = (skillBuffs.CRIT_CHANCE || 0) + parseInt(match[1]);
                    }
                }
                if (description.includes("Critical damage")) {
                    const match = description.match(/\+(\d+)%/);
                    if (match) {
                        skillBuffs.CRIT_DAMAGE = (skillBuffs.CRIT_DAMAGE || 0) + parseInt(match[1]);
                    }
                }
                if (description.includes("Attack damage") || description.includes("damage +")) {
                    const match = description.match(/\+(\d+)%/);
                    if (match) {
                        skillBuffs.ATK = (skillBuffs.ATK || 0) + parseInt(match[1]);
                    }
                }
                if (description.includes("Attack speed")) {
                    const match = description.match(/\+(\d+)%/);
                    if (match) {
                        skillBuffs.ATTACK_SPEED = (skillBuffs.ATTACK_SPEED || 0) + parseInt(match[1]);
                    }
                }
                if (description.includes("Defense") || description.includes("Defence")) {
                    const match = description.match(/\+(\d+)%/);
                    if (match) {
                        skillBuffs.DEF = (skillBuffs.DEF || 0) + parseInt(match[1]);
                    }
                }
                if (description.includes("Health") || description.includes("health")) {
                    const match = description.match(/\+(\d+)%/);
                    if (match) {
                        skillBuffs.HEALTH = (skillBuffs.HEALTH || 0) + parseInt(match[1]);
                    }
                }
            }
        });
    };

    // Melee skills
    if (skillData.melee?.stab) {
        const stabLevel = getSkillLevel(skillData.melee.stab);
        skillBuffs.ACCURACY_BONUS = (skillBuffs.ACCURACY_BONUS || 0) + (stabLevel * 0.8); // +0.8% accuracy per level
        applySkillBuffBonuses('stab', stabLevel);
    }

    if (skillData.melee?.slash) {
        const slashLevel = getSkillLevel(skillData.melee.slash);
        skillBuffs.DAMAGE_RANGE_BONUS = (skillBuffs.DAMAGE_RANGE_BONUS || 0) + (slashLevel * 0.5); // +0.5 max damage per level
        applySkillBuffBonuses('slash', slashLevel);
    }

    if (skillData.melee?.crush) {
        const crushLevel = getSkillLevel(skillData.melee.crush);
        skillBuffs.CRIT_DAMAGE = (skillBuffs.CRIT_DAMAGE || 0) + (crushLevel * 2); // +2% crit damage per level
        applySkillBuffBonuses('crush', crushLevel);
    }

    // Ranged skills
    if (skillData.ranged?.archery) {
        const archeryLevel = getSkillLevel(skillData.ranged.archery);
        skillBuffs.CRIT_CHANCE = (skillBuffs.CRIT_CHANCE || 0) + (archeryLevel * 0.4); // +0.4% crit per level
        applySkillBuffBonuses('archery', archeryLevel);
    }

    if (skillData.ranged?.throwing) {
        const throwingLevel = getSkillLevel(skillData.ranged.throwing);
        skillBuffs.ATTACK_SPEED = (skillBuffs.ATTACK_SPEED || 0) + (throwingLevel * 0.05); // +0.05 attack speed per level
        applySkillBuffBonuses('throwing', throwingLevel);
    }

    // Magic skills
    if (skillData.magic?.lightning) {
        const lightningLevel = getSkillLevel(skillData.magic.lightning);
        skillBuffs.ATK = (skillBuffs.ATK || 0) + (lightningLevel * 0.4); // +0.4 ATK per level
        applySkillBuffBonuses('lightning', lightningLevel);
    }

    if (skillData.magic?.fire) {
        const fireLevel = getSkillLevel(skillData.magic.fire);
        skillBuffs.ATK = (skillBuffs.ATK || 0) + (fireLevel * 0.4); // +0.4 ATK per level
        applySkillBuffBonuses('fire', fireLevel);
    }

    if (skillData.magic?.ice) {
        const iceLevel = getSkillLevel(skillData.magic.ice);
        skillBuffs.ATK = (skillBuffs.ATK || 0) + (iceLevel * 0.4); // +0.4 ATK per level
        applySkillBuffBonuses('ice', iceLevel);
    }

    // Defense skills
    if (skillData.defence?.dodge) {
        const dodgeLevel = getSkillLevel(skillData.defence.dodge);
        skillBuffs.DEF = (skillBuffs.DEF || 0) + (dodgeLevel * 0.2); // +0.2 DEF per level
        applySkillBuffBonuses('dodge', dodgeLevel);
    }

    if (skillData.defence?.block) {
        const blockLevel = getSkillLevel(skillData.defence.block);
        skillBuffs.DEF = (skillBuffs.DEF || 0) + (blockLevel * 0.3); // +0.3 DEF per level
        applySkillBuffBonuses('block', blockLevel);
    }

    if (skillData.defence?.armor) {
        const armorLevel = getSkillLevel(skillData.defence.armor);
        skillBuffs.DEF = (skillBuffs.DEF || 0) + (armorLevel * 0.4); // +0.4 DEF per level
        skillBuffs.HEALTH = (skillBuffs.HEALTH || 0) + (armorLevel * 2); // +2 HP per level
        applySkillBuffBonuses('armor', armorLevel);
    }

    // Hitpool skills
    if (skillData.hitpool?.hp) {
        const hpLevel = getSkillLevel(skillData.hitpool.hp);
        skillBuffs.HEALTH = (skillBuffs.HEALTH || 0) + (hpLevel * 3); // +3 HP per level
        applySkillBuffBonuses('hp', hpLevel);
    }

    // Utility skills
    if (skillData.utility?.critChance) {
        const critChanceLevel = getSkillLevel(skillData.utility.critChance);
        skillBuffs.CRIT_CHANCE = (skillBuffs.CRIT_CHANCE || 0) + (critChanceLevel * 0.5); // +0.5% crit per level
        applySkillBuffBonuses('critChance', critChanceLevel);
    }

    if (skillData.utility?.critDamage) {
        const critDamageLevel = getSkillLevel(skillData.utility.critDamage);
        skillBuffs.CRIT_DAMAGE = (skillBuffs.CRIT_DAMAGE || 0) + (critDamageLevel * 1); // +1% crit damage per level
        applySkillBuffBonuses('critDamage', critDamageLevel);
    }

    return skillBuffs;
};

// Calculate skill buffs based on selected attack type only
export const calculateSkillBuffsForAttackType = (selectedAttackType) => {
    const skillData = getSkillData();
    const skillBuffs = {};

    // Helper function to get skill level safely
    const getSkillLevel = (skillObj) => {
        if (!skillObj) return 0;
        if (typeof skillObj === 'number') return skillObj;
        if (typeof skillObj === 'object' && skillObj.level !== undefined) return skillObj.level;
        return 0;
    };

    // Import SKILL_BUFFS (same as above)
    const SKILL_BUFFS = {
        stab: {
            10: "Critical hit chance +5%",
            25: "Critical hit chance +10%, Critical damage +15%",
            50: "Critical hit chance +15%, Critical damage +25%, Attack speed +10%",
            75: "Critical hit chance +20%, Critical damage +35%, Attack speed +15%, Bleed chance +25%",
            99: "⚡ ASSASSIN'S MASTERY: Critical hit chance +25%, Critical damage +50%, Attack speed +20%, Bleed chance +35%, Life steal +10%, INSTANT KILL chance +5%"
        },
        slash: {
            10: "Attack damage +10%",
            25: "Attack damage +20%, Armor penetration +15%",
            50: "Attack damage +30%, Armor penetration +25%, Bleed chance +20%",
            75: "Attack damage +40%, Armor penetration +35%, Bleed chance +30%, Attack speed +10%",
            99: "🗡️ BLADE MASTER: Attack damage +50%, Armor penetration +50%, Bleed chance +40%, Attack speed +15%, Life steal +15%, CLEAVE ATTACK (hits 3 enemies)"
        },
        crush: {
            10: "Stun chance +5%",
            25: "Stun chance +10%, Attack damage +15%",
            50: "Stun chance +15%, Attack damage +25%, Armor penetration +20%",
            75: "Stun chance +20%, Attack damage +35%, Armor penetration +30%, Critical chance +10%",
            99: "🔨 WARHAMMER LORD: Stun chance +25%, Attack damage +45%, Armor penetration +40%, Critical chance +15%, Life steal +20%, EARTHQUAKE AOE (stuns all enemies)"
        },
        archery: {
            10: "Critical chance +8%",
            25: "Critical chance +15%, Attack speed +10%",
            50: "Critical chance +20%, Attack speed +15%, Attack range +2",
            75: "Critical chance +25%, Attack speed +20%, Attack range +3, Dodge +15%",
            99: "🏹 ARCHER LEGEND: Critical chance +30%, Attack speed +25%, Attack range +4, Dodge +20%, Life steal +10%, RAIN OF ARROWS (hits all enemies)"
        },
        throwing: {
            10: "Attack range +1",
            25: "Attack range +2, Attack speed +10%",
            50: "Attack range +3, Attack speed +15%, Critical chance +10%",
            75: "Attack range +4, Attack speed +20%, Critical chance +15%, Dodge +10%",
            99: "🎯 MASTER THROWER: Attack range +5, Attack speed +25%, Critical chance +20%, Dodge +15%, Life steal +5%, BOOMERANG EFFECT (returns for double damage)"
        },
        lightning: {
            10: "Lightning damage +15%",
            25: "Lightning damage +25%, Stun chance +10%",
            50: "Lightning damage +35%, Stun chance +15%, Attack speed +10%",
            75: "Lightning damage +45%, Stun chance +20%, Attack speed +15%, Critical chance +10%",
            99: "⚡ THUNDER GOD: Lightning damage +60%, Stun chance +25%, Attack speed +20%, Critical chance +15%, Life steal +5%, CHAIN LIGHTNING (bounces to 5 enemies)"
        },
        fire: {
            10: "Fire damage +15%",
            25: "Fire damage +25%, Burn chance +20%",
            50: "Fire damage +35%, Burn chance +30%, Attack speed +10%",
            75: "Fire damage +45%, Burn chance +40%, Attack speed +15%, Critical chance +10%",
            99: "🔥 PHOENIX LORD: Fire damage +60%, Burn chance +50%, Attack speed +20%, Critical chance +15%, Life steal +10%, INFERNO BLAST (burns all enemies for 10 seconds)"
        },
        ice: {
            10: "Ice damage +15%",
            25: "Ice damage +25%, Freeze chance +10%",
            50: "Ice damage +35%, Freeze chance +15%, Attack speed +10%",
            75: "Ice damage +45%, Freeze chance +20%, Attack speed +15%, Critical chance +10%",
            99: "❄️ FROST KING: Ice damage +60%, Freeze chance +25%, Attack speed +20%, Critical chance +15%, Life steal +5%, BLIZZARD (freezes all enemies for 5 seconds)"
        },
        dodge: {
            10: "Dodge chance +5%",
            25: "Dodge chance +10%, Attack speed +5%",
            50: "Dodge chance +15%, Attack speed +10%, Critical chance +5%",
            75: "Dodge chance +20%, Attack speed +15%, Critical chance +10%, Counter attack +15%",
            99: "👻 GHOST WARRIOR: Dodge chance +25%, Attack speed +20%, Critical chance +15%, Counter attack +25%, Life steal +10%, PHASE SHIFT (dodges all attacks for 3 seconds)"
        },
        block: {
            10: "Block chance +8%",
            25: "Block chance +15%, Damage reduction +10%",
            50: "Block chance +20%, Damage reduction +20%, Counter attack +10%",
            75: "Block chance +25%, Damage reduction +30%, Counter attack +20%, Stun chance +10%",
            99: "🛡️ IMMORTAL GUARDIAN: Block chance +30%, Damage reduction +40%, Counter attack +30%, Stun chance +15%, Life steal +15%, INVINCIBILITY SHIELD (blocks all damage for 5 seconds)"
        },
        armor: {
            10: "Defense +15%",
            25: "Defense +25%, Health +10%",
            50: "Defense +35%, Health +20%, Damage reduction +10%",
            75: "Defense +45%, Health +30%, Damage reduction +20%, Block chance +10%",
            99: "⚔️ TITAN ARMOR: Defense +60%, Health +40%, Damage reduction +30%, Block chance +15%, Life regeneration +10%, ADAMANTINE SKIN (reflects 50% damage back)"
        },
        hp: {
            10: "Maximum health +20%",
            25: "Maximum health +35%, Health regeneration +10%",
            50: "Maximum health +50%, Health regeneration +20%, Auto-heal +15%",
            75: "Maximum health +65%, Health regeneration +30%, Auto-heal +25%, Damage reduction +10%",
            99: "💎 DIAMOND BODY: Maximum health +80%, Health regeneration +40%, Auto-heal +35%, Damage reduction +20%, Life steal +10%, IMMORTALITY (cannot die below 1 HP)"
        },
        critChance: {
            10: "Critical chance +8%",
            25: "Critical chance +15%, Critical damage +10%",
            50: "Critical chance +20%, Critical damage +20%, Attack speed +5%",
            75: "Critical chance +25%, Critical damage +30%, Attack speed +10%, Life steal +10%",
            99: "🎯 CRITICAL GOD: Critical chance +30%, Critical damage +40%, Attack speed +15%, Life steal +15%, Guaranteed crit +5%, DEATH MARK (next attack is 1000% damage)"
        },
        critDamage: {
            10: "Critical damage +15%",
            25: "Critical damage +25%, Critical chance +5%",
            50: "Critical damage +35%, Critical chance +10%, Attack speed +5%",
            75: "Critical damage +45%, Critical chance +15%, Attack speed +10%, Life steal +10%",
            99: "💥 DAMAGE OVERLORD: Critical damage +60%, Critical chance +20%, Attack speed +15%, Life steal +15%, Infinite crit +5%, NUCLEAR STRIKE (deals 9999 damage to all enemies)"
        }
    };

    // Helper function to apply SKILL_BUFFS bonuses
    const applySkillBuffBonuses = (skillName, level) => {
        if (!SKILL_BUFFS[skillName]) return;
        
        Object.entries(SKILL_BUFFS[skillName]).forEach(([reqLevel, description]) => {
            if (level >= parseInt(reqLevel)) {
                // Parse description and apply bonuses
                if (description.includes("Critical hit chance") || description.includes("Critical chance")) {
                    const match = description.match(/\+(\d+)%/);
                    if (match) {
                        skillBuffs.CRIT_CHANCE = (skillBuffs.CRIT_CHANCE || 0) + parseInt(match[1]);
                    }
                }
                if (description.includes("Critical damage")) {
                    const match = description.match(/\+(\d+)%/);
                    if (match) {
                        skillBuffs.CRIT_DAMAGE = (skillBuffs.CRIT_DAMAGE || 0) + parseInt(match[1]);
                    }
                }
                if (description.includes("Attack damage") || description.includes("damage +")) {
                    const match = description.match(/\+(\d+)%/);
                    if (match) {
                        skillBuffs.ATK = (skillBuffs.ATK || 0) + parseInt(match[1]);
                    }
                }
                if (description.includes("Attack speed")) {
                    const match = description.match(/\+(\d+)%/);
                    if (match) {
                        skillBuffs.ATTACK_SPEED = (skillBuffs.ATTACK_SPEED || 0) + parseInt(match[1]);
                    }
                }
                if (description.includes("Defense") || description.includes("Defence")) {
                    const match = description.match(/\+(\d+)%/);
                    if (match) {
                        skillBuffs.DEF = (skillBuffs.DEF || 0) + parseInt(match[1]);
                    }
                }
                if (description.includes("Health") || description.includes("health")) {
                    const match = description.match(/\+(\d+)%/);
                    if (match) {
                        skillBuffs.HEALTH = (skillBuffs.HEALTH || 0) + parseInt(match[1]);
                    }
                }
            }
        });
    };

    // Only apply the bonus for the selected attack type
    switch (selectedAttackType) {
        case 'stab':
            if (skillData.melee?.stab) {
                const stabLevel = getSkillLevel(skillData.melee.stab);
                skillBuffs.ACCURACY_BONUS = stabLevel * 0.8; // +0.8% accuracy per level
                applySkillBuffBonuses('stab', stabLevel);
            }
            break;
        case 'slash':
            if (skillData.melee?.slash) {
                const slashLevel = getSkillLevel(skillData.melee.slash);
                skillBuffs.DAMAGE_RANGE_BONUS = slashLevel * 0.5; // +0.5 max damage per level
                applySkillBuffBonuses('slash', slashLevel);
            }
            break;
        case 'crush':
            if (skillData.melee?.crush) {
                const crushLevel = getSkillLevel(skillData.melee.crush);
                skillBuffs.CRIT_DAMAGE = crushLevel * 2; // +2% crit damage per level
                applySkillBuffBonuses('crush', crushLevel);
            }
            break;
        case 'archery':
            if (skillData.ranged?.archery) {
                const archeryLevel = getSkillLevel(skillData.ranged.archery);
                skillBuffs.CRIT_CHANCE = archeryLevel * 0.4; // +0.4% crit per level
                applySkillBuffBonuses('archery', archeryLevel);
            }
            break;
        case 'throwing':
            if (skillData.ranged?.throwing) {
                const throwingLevel = getSkillLevel(skillData.ranged.throwing);
                skillBuffs.ATTACK_SPEED = throwingLevel * 0.05; // +0.05 attack speed per level
                applySkillBuffBonuses('throwing', throwingLevel);
            }
            break;
        case 'lightning':
            if (skillData.magic?.lightning) {
                const lightningLevel = getSkillLevel(skillData.magic.lightning);
                skillBuffs.ATK = lightningLevel * 0.4; // +0.4 ATK per level
                applySkillBuffBonuses('lightning', lightningLevel);
            }
            break;
        case 'fire':
            if (skillData.magic?.fire) {
                const fireLevel = getSkillLevel(skillData.magic.fire);
                skillBuffs.ATK = fireLevel * 0.4; // +0.4 ATK per level
                applySkillBuffBonuses('fire', fireLevel);
            }
            break;
        case 'ice':
            if (skillData.magic?.ice) {
                const iceLevel = getSkillLevel(skillData.magic.ice);
                skillBuffs.ATK = iceLevel * 0.4; // +0.4 ATK per level
                applySkillBuffBonuses('ice', iceLevel);
            }
            break;
    }

    // Defense skills are always active (not attack type specific)
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

    // Hitpool skills are always active
    if (skillData.hitpool?.hp) {
        const hpLevel = getSkillLevel(skillData.hitpool.hp);
        skillBuffs.HEALTH = (skillBuffs.HEALTH || 0) + (hpLevel * 3); // +3 HP per level
    }

    // Utility skills are always active (but only for specific attack types)
    // critChance skill is for archery only
    if (selectedAttackType === 'archery' && skillData.utility?.critChance) {
        const critChanceLevel = getSkillLevel(skillData.utility.critChance);
        skillBuffs.CRIT_CHANCE = (skillBuffs.CRIT_CHANCE || 0) + (critChanceLevel * 0.5); // +0.5% crit per level
    }

    // critDamage skill is for crush only
    if (selectedAttackType === 'crush' && skillData.utility?.critDamage) {
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