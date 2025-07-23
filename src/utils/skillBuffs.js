// Skill buffs data - what buffs each skill provides at different levels
export const SKILL_BUFFS = {
    // Melee skills
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
    // Ranged skills
    throwing: {
        10: "Attack range +1",
        25: "Attack range +2, Attack speed +10%",
        50: "Attack range +3, Attack speed +15%, Critical chance +10%",
        75: "Attack range +4, Attack speed +20%, Critical chance +15%, Dodge +10%",
        99: "🎯 MASTER THROWER: Attack range +5, Attack speed +25%, Critical chance +20%, Dodge +15%, Life steal +5%, BOOMERANG EFFECT (returns for double damage)"
    },
    archery: {
        10: "Critical chance +8%",
        25: "Critical chance +15%, Attack speed +10%",
        50: "Critical chance +20%, Attack speed +15%, Attack range +2",
        75: "Critical chance +25%, Attack speed +20%, Attack range +3, Dodge +15%",
        99: "🏹 ARCHER LEGEND: Critical chance +30%, Attack speed +25%, Attack range +4, Dodge +20%, Life steal +10%, RAIN OF ARROWS (hits all enemies)"
    },
    // Magic skills
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
    // Prayer skills
    heal: {
        10: "Healing +20%",
        25: "Healing +35%, Mana regeneration +10%",
        50: "Healing +50%, Mana regeneration +20%, Auto-heal chance +15%",
        75: "Healing +65%, Mana regeneration +30%, Auto-heal chance +25%, Critical heal chance +20%",
        99: "✨ DIVINE HEALER: Healing +80%, Mana regeneration +40%, Auto-heal chance +35%, Critical heal chance +30%, Life regeneration +10%, RESURRECTION (revives once per battle)"
    },
    buff: {
        10: "Buff duration +20%",
        25: "Buff duration +35%, Buff strength +15%",
        50: "Buff duration +50%, Buff strength +25%, Auto-buff chance +20%",
        75: "Buff duration +65%, Buff strength +35%, Auto-buff chance +30%, Multiple buffs +2",
        99: "🌟 BUFF MASTER: Buff duration +80%, Buff strength +50%, Auto-buff chance +40%, Multiple buffs +3, Permanent buffs +1, DIVINE BLESSING (all stats +100% for 30 seconds)"
    },
    debuff: {
        10: "Debuff duration +20%",
        25: "Debuff duration +35%, Debuff strength +15%",
        50: "Debuff duration +50%, Debuff strength +25%, Auto-debuff chance +20%",
        75: "Debuff duration +65%, Debuff strength +35%, Auto-debuff chance +30%, Multiple debuffs +2",
        99: "💀 DEBUFF MASTER: Debuff duration +80%, Debuff strength +50%, Auto-debuff chance +40%, Multiple debuffs +3, Permanent debuffs +1, CURSE OF DOOM (all enemy stats -50% for 30 seconds)"
    },
    shadow: {
        10: "Shadow damage +15%",
        25: "Shadow damage +25%, Fear chance +10%",
        50: "Shadow damage +35%, Fear chance +15%, Attack speed +10%",
        75: "Shadow damage +45%, Fear chance +20%, Attack speed +15%, Critical chance +10%",
        99: "🌑 SHADOW LORD: Shadow damage +60%, Fear chance +25%, Attack speed +20%, Critical chance +15%, Life steal +10%, VOID BLAST (sends enemies to shadow realm)"
    },
    // Defense skills
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
    // Holy skills
    hp: {
        10: "Maximum health +20%",
        25: "Maximum health +35%, Health regeneration +10%",
        50: "Maximum health +50%, Health regeneration +20%, Auto-heal +15%",
        75: "Maximum health +65%, Health regeneration +30%, Auto-heal +25%, Damage reduction +10%",
        99: "💎 DIAMOND BODY: Maximum health +80%, Health regeneration +40%, Auto-heal +35%, Damage reduction +20%, Life steal +10%, IMMORTALITY (cannot die below 1 HP)"
    },
    energyShield: {
        10: "Maximum energy +20%",
        25: "Maximum energy +35%, Energy regeneration +15%",
        50: "Maximum energy +50%, Energy regeneration +25%, Auto-energy +20%",
        75: "Maximum energy +65%, Energy regeneration +35%, Auto-energy +30%, Skill cooldown -10%",
        99: "⚡ INFINITE POWER: Maximum energy +80%, Energy regeneration +50%, Auto-energy +40%, Skill cooldown -20%, Infinite energy +5%, TIME STOP (freezes enemy for 3 seconds)"
    },
    // Advanced skills
    lifeSteal: {
        10: "Life steal +5%",
        25: "Life steal +10%, Critical chance +5%",
        50: "Life steal +15%, Critical chance +10%, Attack speed +5%",
        75: "Life steal +20%, Critical chance +15%, Attack speed +10%, Health regeneration +10%",
        99: "🩸 VAMPIRE LORD: Life steal +25%, Critical chance +20%, Attack speed +15%, Health regeneration +20%, Infinite life steal +5%, BLOOD RITUAL (steals 50% of enemy max HP)"
    },
    counterAttack: {
        10: "Counter attack chance +10%",
        25: "Counter attack chance +20%, Counter damage +15%",
        50: "Counter attack chance +30%, Counter damage +25%, Stun chance +10%",
        75: "Counter attack chance +40%, Counter damage +35%, Stun chance +15%, Critical chance +10%",
        99: "⚔️ COUNTER MASTER: Counter attack chance +50%, Counter damage +50%, Stun chance +20%, Critical chance +15%, Life steal +10%, REVERSE TIME (reverses last enemy attack)"
    },
    doubleAttack: {
        10: "Double attack chance +5%",
        25: "Double attack chance +10%, Attack speed +10%",
        50: "Double attack chance +15%, Attack speed +15%, Critical chance +10%",
        75: "Double attack chance +20%, Attack speed +20%, Critical chance +15%, Life steal +10%",
        99: "⚡ SPEED DEMON: Double attack chance +25%, Attack speed +25%, Critical chance +20%, Life steal +15%, Triple attack +5%, LIGHTNING STRIKE (attacks 10 times instantly)"
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
    },
    attackSpeed: {
        10: "Attack speed +10%",
        25: "Attack speed +20%, Critical chance +5%",
        50: "Attack speed +30%, Critical chance +10%, Life steal +5%",
        75: "Attack speed +40%, Critical chance +15%, Life steal +10%, Double attack +10%",
        99: "⚡ SPEED GOD: Attack speed +50%, Critical chance +20%, Life steal +15%, Double attack +20%, Triple attack +10%, TIME WARP (attacks 100 times in 1 second)"
    }
}; 