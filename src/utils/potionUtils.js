import { POTION_TYPES } from './potions.js';

// Potion drop chances for different enemies
export const POTION_DROP_CHANCES = {
  // Easy enemies - lower tier potions
  goblin: { minor: 0.15, lesser: 0.05 },
  rat: { minor: 0.12, lesser: 0.08 },
  slime: { minor: 0.10, lesser: 0.10 },
  
  // Normal enemies - mid tier potions
  skeleton: { lesser: 0.15, greater: 0.05 },
  orc: { lesser: 0.12, greater: 0.08 },
  troll: { greater: 0.15, superior: 0.05 },
  
  // Hard enemies - high tier potions
  dragon: { superior: 0.20, major: 0.10 },
  ghost: { greater: 0.15, superior: 0.10 },
  spider: { superior: 0.18, major: 0.08 },
  
  // Boss enemies - best potions
  ancient_dragon: { major: 0.25, superior: 0.15 },
  archdemon: { major: 0.30, superior: 0.20 },
  void_reaper: { major: 0.35, superior: 0.25 }
};

// Function to get random potion drop
export const getRandomPotionDrop = (enemyId) => {
  const dropChances = POTION_DROP_CHANCES[enemyId];
  if (!dropChances) return null;
  
  const random = Math.random();
  let cumulativeChance = 0;
  
  for (const [potionId, chance] of Object.entries(dropChances)) {
    cumulativeChance += chance;
    if (random <= cumulativeChance) {
      // Fix: POTION_TYPES uses uppercase keys, but potionId is lowercase
      const potionTypeKey = potionId.toUpperCase();
      const potionType = POTION_TYPES[potionTypeKey];
      if (!potionType) return null;
      return {
        type: 'potion',
        id: potionId,
        name: potionType.name,
        healAmount: potionType.healAmount,
        color: potionType.color
      };
    }
  }
  
  return null;
};

// Function to get random potion for test button
export const getRandomTestPotion = () => {
  const potionIds = Object.keys(POTION_TYPES);
  const randomPotionId = potionIds[Math.floor(Math.random() * potionIds.length)];
  const potion = POTION_TYPES[randomPotionId];
  
  return {
    type: 'potion',
    id: potion.id, // Use potion.id instead of randomPotionId
    name: potion.name,
    healAmount: potion.healAmount,
    color: potion.color
  };
}; 