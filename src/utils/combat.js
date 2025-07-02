export function getCombatStats(player, enemy) {
  // Basit örnek hesaplama
  const acc = player?.melee?.acc || 0;
  const str = player?.melee?.str || 0;

  return {
    playerHitChance: Math.min(95, acc * 2),
    playerHit: Math.floor(str * 1.5),
    enemyHitChance: 40,
    enemyHit: 2
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
