export const saveGame = (game) => {
  const gameData = JSON.stringify(game);
  localStorage.setItem('gameData', gameData);
}

export const getSkillIcon = (skill) => `/images/skills/${skill}.png`;

export const getEnemyIcon = (enemy) => `/images/enemies/${enemy}.png`;

// Get first letter of enemy name
export const getEnemyInitial = (enemyName) => enemyName.charAt(0).toUpperCase();

export const getCharacterIcon = (character) => `/images/characters/${character}.png`;

// Get name based on character type
export const getCharacterName = (character) => {
    const names = {
        warrior: 'WARRIOR',
        ranger: 'RANGER',
        wizard: 'WIZARD',
        cleric: 'CLERIC'
    };
    return names[character] || 'WARRIOR';
};

// System colors - All color definitions are collected here
export const SYSTEM_COLORS = {
  // Background colors
  BACKGROUND: {
    PRIMARY: '#2a2a4a',
    SECONDARY: '#3a3a5a',
    TERTIARY: '#4a4a6a',
    CARD: '#3a3a5a',
    CARD_DARK: '#2a2a4a'
  },
  
  // Border colors
  BORDER: {
    PRIMARY: '#4a4a6a',
    SECONDARY: '#6a6a8a',
    DARK: '#000000'
  },
  
  // HP Bar colors
  HP_BAR: {
    PLAYER: {
      START: '#4ade80',
      END: '#22c55e'
    },
    ENEMY: {
      START: '#ef4444',
      END: '#dc2626'
    }
  },
  
  // Attack Bar colors
  ATTACK_BAR: {
    START: '#f97316',
    END: '#ea580c'
  },
  
  // Damage Display colors
  DAMAGE_DISPLAY: {
    PLAYER: {
      PRIMARY: '#22c55e',
      SECONDARY: '#16a34a'
    },
    ENEMY: {
      PRIMARY: '#ef4444',
      SECONDARY: '#dc2626'
    }
  },
  
  // Text colors
  TEXT: {
    PRIMARY: '#e0e0e0',
    SECONDARY: '#4ecdc4',
    SUCCESS: '#96ceb4',
    WARNING: '#ffa502',
    ERROR: '#ff6b6b'
  },
  
  // Combat Log colors
  COMBAT_LOG: {
    PLAYER_ATTACK: '#96ceb4',
    ENEMY_ATTACK: '#ff6b6b',
    MISS: '#ffa502',
    DEFEAT: '#ff6b6b'
  },
  
  // Button colors
  BUTTON: {
    PRIMARY: '#4a4a6a',
    SECONDARY: '#3a3a5a',
    HOVER: '#5a5a7a',
    TEXT: '#e0e0e0'
  },
  
  // Gradient colors
  GRADIENT: {
    PLAYER_HP: 'linear-gradient(90deg, #4ade80 0%, #22c55e 100%)',
    ENEMY_HP: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
    ATTACK_BAR: 'linear-gradient(90deg, #f97316 0%, #ea580c 100%)',
    BACKGROUND: 'linear-gradient(135deg, #2a2a4a 0%, #3a3a5a 50%, #4a4a6a 100%)',
    CARD: 'linear-gradient(145deg, #3a3a5a 0%, #2a2a4a 100%)'
  }
};