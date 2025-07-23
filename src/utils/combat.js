// Combat System

import { applyGoldMultiplier, applyDamageMultiplier } from './buffUtils.js';
import { MAGIC_TYPES, MELEE_TYPES, RANGED_TYPES, ATTACK_TYPES } from './constants.js';
import { calculateAccuracy } from './battleUtils.jsx';

export function getCombatStats(player, enemy) {
  const playerATK = player?.ATK || 10;
  const playerDEF = player?.DEF || 5;
  const enemyATK = enemy?.ATK || 8;
  const enemyDEF = enemy?.DEF || 3;

  const calculateDamage = (attackerATK, defenderDEF) => {
    let damage = attackerATK - (defenderDEF * 0.5);
    damage = Math.max(1, damage);
    return Math.floor(damage);
  };

  return {
    playerHitChance: calculateAccuracy(playerATK, enemyDEF),
    playerHit: calculateDamage(playerATK, enemyDEF),
    enemyHitChance: calculateAccuracy(enemyATK, playerDEF),
    enemyHit: calculateDamage(enemyATK, playerDEF),
    playerATK: playerATK,
    playerDEF: playerDEF,
    enemyATK: enemyATK,
    enemyDEF: enemyDEF
  };
}

export function getLootDrop(drops) {
  const items = [];
  const goldItems = [];
  let totalGold = 0;
  
  drops.forEach(drop => {
    if (Math.random() < drop.chance) {
      if (drop.type === "equipment") {
        items.push(drop.name);
      } else if (drop.type === "gold") {
        const buffedValue = applyGoldMultiplier(drop.value);
        goldItems.push({ name: drop.name, value: buffedValue });
        totalGold += buffedValue;
      }
    }
  });
  
  return {
    items: items,
    goldItems: goldItems,
    gold: totalGold
  };
}

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

export function saveLoot(loot) {
  const currentSlot = getCurrentSlot();
  const slotKey = getSlotKey("lootBag", currentSlot);
  const current = JSON.parse(localStorage.getItem(slotKey) || "[]");
  const updated = [...current, ...loot];
  localStorage.setItem(slotKey, JSON.stringify(updated));
}

export function battle(player, enemy) {
  const playerFighter = {
    ATK: player.ATK || 10,
    DEF: player.DEF || 5,
    HEALTH: player.HEALTH || 100,
    maxHealth: player.HEALTH || 100,
    ATTACK_SPEED: player.ATTACK_SPEED || 2.0,
    ATTACK_TYPE: player.ATTACK_TYPE || 'melee',
  };
  const enemyFighter = {
    ATK: enemy.ATK || 8,
    DEF: enemy.DEF || 3,
    HEALTH: enemy.HEALTH || 80,
    maxHealth: enemy.HEALTH || 80,
    ATTACK_SPEED: enemy.ATTACK_SPEED || 1.5,
    ATTACK_TYPE: enemy.ATTACK_TYPE || 'melee',
  };

  const battleLog = [];
  let playerProgress = 0;
  let enemyProgress = 0;
  let time = 0;

  function getAccuracy(attacker, defender) {
    if (MAGIC_TYPES.includes(attacker.ATTACK_TYPE)) return 100;
    const skill = attacker.ATK;
    const defense = defender.DEF;
    return calculateAccuracy(skill, defense);
  }

  function calculateDamage(attacker, defender) {
    // Determine attack type
    const type = attacker.ATTACK_TYPE;
    // For magic, use skill level for the specific type
    if (MAGIC_TYPES.includes(type)) {
      // Example: attacker[type + '_LEVEL'] or attacker[type] or attacker.ATK
      // For now, fallback to ATK as skill level
      const skill = attacker[type?.toUpperCase() + '_LEVEL'] || attacker.ATK;
      const magicRes = defender.MAGIC_RES || 0;
      // Category-specific base ranges
      let min = 1, max = 5;
      if (type === 'lightning') { min = 1; max = 10; }
      if (type === 'fire') { min = 3; max = 4; }
      if (type === 'ice') { min = 2; max = 6; }
      if (skill === magicRes) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      } else if (skill > magicRes) {
        // Skill üstünse max artır
        const bonus = Math.min(10, (skill - magicRes) * 2);
        return Math.floor(Math.random() * ((max + bonus) - min + 1)) + min;
      } else {
        // Magic res üstünse min azalt
        const penalty = Math.min(min - 1, (magicRes - skill));
        const newMin = Math.max(1, min - penalty);
        return Math.floor(Math.random() * (max - newMin + 1)) + newMin;
      }
    }
    // Melee/Range: skill vs DEF
    const skill = attacker.ATK;
    const defense = defender.DEF;
    let min = 1, max = 5;
    if (skill === defense) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    } else if (skill > defense) {
      const bonus = Math.min(10, (skill - defense) * 2);
      return Math.floor(Math.random() * ((max + bonus) - min + 1)) + min;
    } else {
      const penalty = Math.min(min - 1, (defense - skill));
      const newMin = Math.max(1, min - penalty);
      return Math.floor(Math.random() * (max - newMin + 1)) + newMin;
    }
  }

  while (playerFighter.HEALTH > 0 && enemyFighter.HEALTH > 0) {
    playerProgress += (playerFighter.ATTACK_SPEED * 2);
    enemyProgress += (enemyFighter.ATTACK_SPEED * 2);

    if (playerProgress >= 100) {
      const playerAccuracy = getAccuracy(playerFighter, enemyFighter);
      const playerHitRoll = Math.random() * 100;
      if (playerHitRoll <= playerAccuracy) {
        let damage = calculateDamage(playerFighter, enemyFighter);
        battleLog.push({
          type: 'player_attack',
          damage: damage,
          enemyHealth: enemyFighter.HEALTH,
          enemyMaxHealth: enemyFighter.maxHealth,
          message: `Player hits for ${damage} damage!`
        });
        enemyFighter.HEALTH = Math.max(0, enemyFighter.HEALTH - damage);
      } else {
        battleLog.push({
          type: 'player_miss',
          damage: 0,
          enemyHealth: enemyFighter.HEALTH,
          enemyMaxHealth: enemyFighter.maxHealth,
          message: `Player misses!`
        });
      }
      playerProgress = 0;
    }

    if (enemyFighter.HEALTH <= 0) {
      battleLog.push({
        type: 'enemy_defeated',
        message: 'Enemy defeated! Player wins!'
      });
      break;
    }

    if (enemyProgress >= 100) {
      const enemyAccuracy = getAccuracy(enemyFighter, playerFighter);
      const enemyHitRoll = Math.random() * 100;
      if (enemyHitRoll <= enemyAccuracy) {
        let damage = calculateDamage(enemyFighter, playerFighter);
        battleLog.push({
          type: 'enemy_attack',
          damage: damage,
          playerHealth: playerFighter.HEALTH,
          playerMaxHealth: playerFighter.maxHealth,
          message: `Enemy hits for ${damage} damage!`
        });
        playerFighter.HEALTH = Math.max(0, playerFighter.HEALTH - damage);
      } else {
        battleLog.push({
          type: 'enemy_miss',
          damage: 0,
          playerHealth: playerFighter.HEALTH,
          playerMaxHealth: playerFighter.maxHealth,
          message: `Enemy misses!`
        });
      }
      enemyProgress = 0;
    }

    if (playerFighter.HEALTH <= 0) {
      battleLog.push({
        type: 'player_defeated',
        message: 'Player defeated! Enemy wins!'
      });
      break;
    }
    time++;
  }

  return {
    winner: playerFighter.HEALTH > 0 ? 'player' : 'enemy',
    playerFinalHealth: playerFighter.HEALTH,
    enemyFinalHealth: enemyFighter.HEALTH,
    battleTime: time,
    battleLog: battleLog
  };
}
