export function getCombatStats(player, enemy) {
  // Updated calculation for new battle system
  const playerATK = player?.ATK || 10;
  const playerDEF = player?.DEF || 5;
  const enemyATK = enemy?.ATK || 8;
  const enemyDEF = enemy?.DEF || 3;

  // Hit chance calculation
  const calculateHitChance = (attackerATK, defenderDEF) => {
    const ratio = attackerATK / Math.max(defenderDEF, 1);
    let baseChance = 60;
    
    if (ratio >= 2) baseChance += 25;
    else if (ratio >= 1.5) baseChance += 15;
    else if (ratio >= 1) baseChance += 5;
    else if (ratio >= 0.5) baseChance -= 10;
    else baseChance -= 25;
    
    return Math.max(5, Math.min(95, baseChance));
  };

  // Hasar hesaplama
  const calculateDamage = (attackerATK, defenderDEF) => {
    let damage = attackerATK - (defenderDEF * 0.5);
    damage = Math.max(1, damage);
    return Math.floor(damage);
  };

  return {
    playerHitChance: calculateHitChance(playerATK, enemyDEF),
    playerHit: calculateDamage(playerATK, enemyDEF),
    enemyHitChance: calculateHitChance(enemyATK, playerDEF),
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
        goldItems.push({ name: drop.name, value: drop.value });
        totalGold += drop.value;
      }
    }
  });
  
  return {
    items: items,
    goldItems: goldItems,
    gold: totalGold
  };
}

export function saveLoot(loot) {
  const current = JSON.parse(localStorage.getItem("lootBag") || "[]");
  const updated = [...current, ...loot];
  localStorage.setItem("lootBag", JSON.stringify(updated));
}

// New battle function - based on ATK, DEF, HEALTH, ATTACK_SPEED, CRIT_CHANCE, CRIT_DAMAGE values
export function battle(player, enemy) {
  // Create copies of fighters (to preserve original values)
  const playerFighter = {
    ATK: player.ATK || 10,
    DEF: player.DEF || 5,
    HEALTH: player.HEALTH || 100,
    maxHealth: player.HEALTH || 100,
    ATTACK_SPEED: player.ATTACK_SPEED || 2.0,
    CRIT_CHANCE: player.CRIT_CHANCE || 5, // 5% base crit chance
    CRIT_DAMAGE: player.CRIT_DAMAGE || 150 // 150% base crit damage
  };
  
  const enemyFighter = {
    ATK: enemy.ATK || 8,
    DEF: enemy.DEF || 3,
    HEALTH: enemy.HEALTH || 80,
    maxHealth: enemy.HEALTH || 80,
    ATTACK_SPEED: enemy.ATTACK_SPEED || 1.5,
    CRIT_CHANCE: enemy.CRIT_CHANCE || 3, // 3% base crit chance
    CRIT_DAMAGE: enemy.CRIT_DAMAGE || 120 // 120% base crit damage
  };

  const battleLog = [];
  let playerProgress = 0;
  let enemyProgress = 0;
  let time = 0;

  // Battle loop - continues until one dies
  while (playerFighter.HEALTH > 0 && enemyFighter.HEALTH > 0) {
    // Player attack progress - progress should fill faster as ATTACK_SPEED increases
    playerProgress += (playerFighter.ATTACK_SPEED * 2);
    
    // Enemy attack progress - progress should fill faster as ATTACK_SPEED increases
    enemyProgress += (enemyFighter.ATTACK_SPEED * 2);
    
    // Player attack
    if (playerProgress >= 100) {
      const playerHitChance = calculateHitChance(playerFighter.ATK, enemyFighter.DEF);
      const playerHitRoll = Math.random() * 100;
      
      if (playerHitRoll <= playerHitChance) {
        // Crit hit check
        const critRoll = Math.random() * 100;
        const isCrit = critRoll <= playerFighter.CRIT_CHANCE;
        
        let damage = calculateDamage(playerFighter.ATK, enemyFighter.DEF);
        
        if (isCrit) {
          damage = Math.floor(damage * (playerFighter.CRIT_DAMAGE / 100));
          battleLog.push({
            type: 'player_crit',
            damage: damage,
            enemyHealth: enemyFighter.HEALTH,
            enemyMaxHealth: enemyFighter.maxHealth,
            message: `Player CRITICAL HIT for ${damage} damage!`
          });
        } else {
          battleLog.push({
            type: 'player_attack',
            damage: damage,
            enemyHealth: enemyFighter.HEALTH,
            enemyMaxHealth: enemyFighter.maxHealth,
            message: `Player hits for ${damage} damage!`
          });
        }
        
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

    // If enemy dies, battle ends
    if (enemyFighter.HEALTH <= 0) {
      battleLog.push({
        type: 'enemy_defeated',
        message: "Enemy defeated! Player wins!"
      });
      break;
    }

    // Enemy attack
    if (enemyProgress >= 100) {
      const enemyHitChance = calculateHitChance(enemyFighter.ATK, playerFighter.DEF);
      const enemyHitRoll = Math.random() * 100;
      
      if (enemyHitRoll <= enemyHitChance) {
        // Crit hit check
        const critRoll = Math.random() * 100;
        const isCrit = critRoll <= enemyFighter.CRIT_CHANCE;
        
        let damage = calculateDamage(enemyFighter.ATK, playerFighter.DEF);
        
        if (isCrit) {
          damage = Math.floor(damage * (enemyFighter.CRIT_DAMAGE / 100));
          battleLog.push({
            type: 'enemy_crit',
            damage: damage,
            playerHealth: playerFighter.HEALTH,
            playerMaxHealth: playerFighter.maxHealth,
            message: `Enemy CRITICAL HIT for ${damage} damage!`
          });
        } else {
          battleLog.push({
            type: 'enemy_attack',
            damage: damage,
            playerHealth: playerFighter.HEALTH,
            playerMaxHealth: playerFighter.maxHealth,
            message: `Enemy hits for ${damage} damage!`
          });
        }
        
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

    // If player dies, battle ends
    if (playerFighter.HEALTH <= 0) {
      battleLog.push({
        type: 'player_defeated',
        message: "Player defeated! Enemy wins!"
      });
      break;
    }

    time += 0.1;
  }

  return {
    winner: playerFighter.HEALTH > 0 ? 'player' : 'enemy',
    playerFinalHealth: playerFighter.HEALTH,
    enemyFinalHealth: enemyFighter.HEALTH,
    battleTime: time,
    battleLog: battleLog
  };
}

// Hit chance calculation function
function calculateHitChance(attackerATK, defenderDEF) {
  // Calculate hit chance based on ATK/DEF ratio
  const ratio = attackerATK / Math.max(defenderDEF, 1);
  
  // Base hit chance starts at 60%
  let baseChance = 60;
  
  // Bonus/penalty based on ATK/DEF ratio
  if (ratio >= 2) {
    baseChance += 25; // Very strong attack
  } else if (ratio >= 1.5) {
    baseChance += 15; // Strong attack
  } else if (ratio >= 1) {
    baseChance += 5; // Normal attack
  } else if (ratio >= 0.5) {
    baseChance -= 10; // Weak attack
  } else {
    baseChance -= 25; // Very weak attack
  }
  
  // Limit hit chance between 5% and 95%
  return Math.max(5, Math.min(95, baseChance));
}

// Damage calculation function
function calculateDamage(attackerATK, defenderDEF) {
  // Base damage: ATK - (DEF * 0.5)
  let damage = attackerATK - (defenderDEF * 0.5);
  
  // Guarantee minimum 1 damage
  damage = Math.max(1, damage);
  
  // Add random variation (10%)
  const variation = damage * 0.1;
  damage += (Math.random() - 0.5) * variation;
  
  return Math.floor(damage);
}
