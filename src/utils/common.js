import { MAGIC_TYPES, MELEE_TYPES, RANGED_TYPES, CHARACTER_CATEGORIES } from './constants.js';

export const getSkillIcon = (skill) => `/images/skills/${skill}.png`;

export const getEnemyIcon = (enemyId) => {
    const iconMap = {
        // Existing enemies
        goblin: "/images/enemies/goblin.png",
        rat: "/images/enemies/rat.png",
        slime: "/images/enemies/slime.png",
        skeleton: "/images/enemies/skeleton.png",
        orc: "/images/enemies/orc.png",
        troll: "/images/enemies/troll.png",
        dragon: "/images/enemies/dragon.png",
        ghost: "/images/enemies/ghost.png",
        spider: "/images/enemies/spider.png",
        
        // New Easy enemies
        bat: "/images/enemies/bat.png",
        
        // New Normal enemies
        wolf: "/images/enemies/wolf.png",
        zombie: "/images/enemies/zombie.png",
        bandit: "/images/enemies/bandit.png",
        lizardman: "/images/enemies/lizardman.png",
        giant_bee: "/images/enemies/giant_bee.png",
        cultist: "/images/enemies/cultist.png",
        gargoyle: "/images/enemies/gargoyle.png",
        harpy: "/images/enemies/harpy.png",
        
        // New Hard enemies
        minotaur: "/images/enemies/minotaur.png",
        wraith: "/images/enemies/wraith.png",
        werewolf: "/images/enemies/werewolf.png",
        golem: "/images/enemies/golem.png",
        vampire: "/images/enemies/vampire.png",
        chimera: "/images/enemies/chimera.png",
        
        // New Very Hard enemies
        hydra: "/images/enemies/hydra.png",
        demon: "/images/enemies/demon.png",
        lich: "/images/enemies/lich.png",
        manticore: "/images/enemies/manticore.png",
        
        // New Impossible enemies
        ancient_dragon: "/images/enemies/ancient_dragon.png",
        archdemon: "/images/enemies/archdemon.png",
        void_reaper: "/images/enemies/void_reaper.png",
        celestial_seraph: "/images/enemies/celestial_seraph.png"
    };
    
    return iconMap[enemyId] || "/images/enemies/goblin.png"; // Default fallback
};

export const getEnemyInitial = (enemyName) => enemyName ? enemyName.charAt(0).toUpperCase() : '?';

export const getCharacterIcon = (character) => `/images/characters/${character}.png`;

export const getCharacterName = (character) => {
    const names = {
        warrior: 'WARRIOR',
        ranger: 'RANGER',
        wizard: 'WIZARD',
        cleric: 'CLERIC'
    };
    return names[character] || 'WARRIOR';
};

// Attack type to character category mapping using constants
export const getCategoryByAttackType = (attackType) => {
    if (MELEE_TYPES.includes(attackType)) return CHARACTER_CATEGORIES.WARRIOR;
    if (RANGED_TYPES.includes(attackType)) return CHARACTER_CATEGORIES.RANGER;
    if (MAGIC_TYPES.includes(attackType)) return CHARACTER_CATEGORIES.WIZARD;
    
    return CHARACTER_CATEGORIES.WARRIOR; // Default to warrior
};

export const SYSTEM_COLORS = {
  BACKGROUND: {
    PRIMARY: '#2a2a4a',
    SECONDARY: '#3a3a5a',
    TERTIARY: '#4a4a6a',
    CARD: '#3a3a5a',
    CARD_DARK: '#2a2a4a'
  },
  
  BORDER: {
    PRIMARY: '#4a4a6a',
    SECONDARY: '#6a6a8a',
    DARK: '#000000'
  },
  
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
  
  ATTACK_BAR: {
    START: '#f97316',
    END: '#ea580c'
  },
  
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
  
  TEXT: {
    PRIMARY: '#e0e0e0',
    SECONDARY: '#4ecdc4',
    SUCCESS: '#96ceb4',
    WARNING: '#ffa502',
    ERROR: '#ff6b6b'
  },
  
  COMBAT_LOG: {
    PLAYER_ATTACK: '#96ceb4',
    ENEMY_ATTACK: '#ff6b6b',
    MISS: '#ffa502',
    DEFEAT: '#ff6b6b'
  },
  
  BUTTON: {
    PRIMARY: '#4a4a6a',
    SECONDARY: '#3a3a5a',
    HOVER: '#5a5a7a',
    TEXT: '#e0e0e0'
  },
  
  GRADIENT: {
    PLAYER_HP: 'linear-gradient(90deg, #4ade80 0%, #22c55e 100%)',
    ENEMY_HP: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
    ATTACK_BAR: 'linear-gradient(90deg, #f97316 0%, #ea580c 100%)',
    BACKGROUND: 'linear-gradient(135deg, #2a2a4a 0%, #3a3a5a 50%, #4a4a6a 100%)',
    CARD: 'linear-gradient(145deg, #3a3a5a 0%, #2a2a4a 100%)'
  }
};