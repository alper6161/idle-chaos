export function getCombatStats(player, enemy) {
  // Yeni savaş sistemi için güncellenmiş hesaplama
  const playerATK = player?.ATK || 10;
  const playerDEF = player?.DEF || 5;
  const enemyATK = enemy?.ATK || 8;
  const enemyDEF = enemy?.DEF || 3;

  // Vurma ihtimali hesaplama
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
  const looted = [];
  drops.forEach(drop => {
    if (Math.random() < drop.chance) {
      looted.push(drop.name);
    }
  });
  return looted;
}

export function saveLoot(loot) {
  const current = JSON.parse(localStorage.getItem("lootBag") || "[]");
  const updated = [...current, ...loot];
  localStorage.setItem("lootBag", JSON.stringify(updated));
}

// Yeni savaş fonksiyonu - ATK, DEF, HEALTH, ATTACK_SPEED, CRIT_CHANCE, CRIT_DAMAGE değerlerine göre
export function battle(player, enemy) {
  // Savaşçıların kopyalarını oluştur (orijinal değerleri korumak için)
  const playerFighter = {
    ATK: player.ATK || 10,
    DEF: player.DEF || 5,
    HEALTH: player.HEALTH || 100,
    maxHealth: player.HEALTH || 100,
    ATTACK_SPEED: player.ATTACK_SPEED || 2.0,
    CRIT_CHANCE: player.CRIT_CHANCE || 5, // %5 temel crit chance
    CRIT_DAMAGE: player.CRIT_DAMAGE || 150 // %150 temel crit damage
  };
  
  const enemyFighter = {
    ATK: enemy.ATK || 8,
    DEF: enemy.DEF || 3,
    HEALTH: enemy.HEALTH || 80,
    maxHealth: enemy.HEALTH || 80,
    ATTACK_SPEED: enemy.ATTACK_SPEED || 1.5,
    CRIT_CHANCE: enemy.CRIT_CHANCE || 3, // %3 temel crit chance
    CRIT_DAMAGE: enemy.CRIT_DAMAGE || 120 // %120 temel crit damage
  };

  const battleLog = [];
  let playerProgress = 0;
  let enemyProgress = 0;
  let time = 0;

  // Savaş döngüsü - birisi ölene kadar devam eder
  while (playerFighter.HEALTH > 0 && enemyFighter.HEALTH > 0) {
    // Oyuncu saldırı progress'i - ATTACK_SPEED arttıkça progress daha hızlı dolmalı
    playerProgress += (playerFighter.ATTACK_SPEED * 2);
    
    // Düşman saldırı progress'i - ATTACK_SPEED arttıkça progress daha hızlı dolmalı
    enemyProgress += (enemyFighter.ATTACK_SPEED * 2);
    
    // Oyuncu saldırısı
    if (playerProgress >= 100) {
      const playerHitChance = calculateHitChance(playerFighter.ATK, enemyFighter.DEF);
      const playerHitRoll = Math.random() * 100;
      
      if (playerHitRoll <= playerHitChance) {
        // Crit hit kontrolü
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

    // Düşman öldüyse savaş biter
    if (enemyFighter.HEALTH <= 0) {
      battleLog.push({
        type: 'enemy_defeated',
        message: "Enemy defeated! Player wins!"
      });
      break;
    }

    // Düşman saldırısı
    if (enemyProgress >= 100) {
      const enemyHitChance = calculateHitChance(enemyFighter.ATK, playerFighter.DEF);
      const enemyHitRoll = Math.random() * 100;
      
      if (enemyHitRoll <= enemyHitChance) {
        // Crit hit kontrolü
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

    // Oyuncu öldüyse savaş biter
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

// Vurma ihtimali hesaplama fonksiyonu
function calculateHitChance(attackerATK, defenderDEF) {
  // ATK/DEF oranına göre vurma ihtimali hesaplama
  const ratio = attackerATK / Math.max(defenderDEF, 1);
  
  // Temel vurma ihtimali %60'tan başlar
  let baseChance = 60;
  
  // ATK/DEF oranına göre bonus/penalty
  if (ratio >= 2) {
    baseChance += 25; // Çok güçlü saldırı
  } else if (ratio >= 1.5) {
    baseChance += 15; // Güçlü saldırı
  } else if (ratio >= 1) {
    baseChance += 5; // Normal saldırı
  } else if (ratio >= 0.5) {
    baseChance -= 10; // Zayıf saldırı
  } else {
    baseChance -= 25; // Çok zayıf saldırı
  }
  
  // Vurma ihtimali %5 ile %95 arasında sınırla
  return Math.max(5, Math.min(95, baseChance));
}

// Hasar hesaplama fonksiyonu
function calculateDamage(attackerATK, defenderDEF) {
  // Temel hasar: ATK - (DEF * 0.5)
  let damage = attackerATK - (defenderDEF * 0.5);
  
  // Minimum 1 hasar garantisi
  damage = Math.max(1, damage);
  
  // Rastgele varyasyon ekle (%10)
  const variation = damage * 0.1;
  damage += (Math.random() - 0.5) * variation;
  
  return Math.floor(damage);
}
