// Player Stats Utility
// Calculates player stats based on equipped items and base stats

// Base player stats (without equipment)
export const BASE_PLAYER_STATS = {
    ATK: 10,
    DEF: 5,
    HEALTH: 100,
    ATTACK_SPEED: 2.5,
    CRIT_CHANCE: 5,
    CRIT_DAMAGE: 150
};

// Equipment storage key
const EQUIPPED_ITEMS_KEY = 'idle-chaos-equipped-items';

// Get equipped items from localStorage
export const getEquippedItems = () => {
    try {
        const stored = localStorage.getItem(EQUIPPED_ITEMS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error('Error loading equipped items:', error);
        return {};
    }
};

// Calculate total stats from equipped items
export const calculateEquipmentStats = () => {
    const equippedItems = getEquippedItems();
    const totalStats = {};
    
    Object.values(equippedItems).forEach(item => {
        if (item && item.stats) {
            Object.entries(item.stats).forEach(([stat, value]) => {
                totalStats[stat] = (totalStats[stat] || 0) + value;
            });
        }
    });
    
    return totalStats;
};

// Get final player stats (base + equipment)
export const getPlayerStats = () => {
    const equipmentStats = calculateEquipmentStats();
    const finalStats = { ...BASE_PLAYER_STATS };
    
    // Apply equipment bonuses
    Object.entries(equipmentStats).forEach(([stat, value]) => {
        if (finalStats.hasOwnProperty(stat)) {
            finalStats[stat] += value;
        }
    });
    
    // Ensure minimum values
    finalStats.ATK = Math.max(1, finalStats.ATK);
    finalStats.DEF = Math.max(1, finalStats.DEF);
    finalStats.HEALTH = Math.max(10, finalStats.HEALTH);
    finalStats.ATTACK_SPEED = Math.max(0.5, finalStats.ATTACK_SPEED);
    finalStats.CRIT_CHANCE = Math.max(0, Math.min(100, finalStats.CRIT_CHANCE));
    finalStats.CRIT_DAMAGE = Math.max(100, finalStats.CRIT_DAMAGE);
    
    return finalStats;
};

// Get equipment bonus stats only
export const getEquipmentBonuses = () => {
    const equipmentStats = calculateEquipmentStats();
    const bonuses = {};
    
    Object.entries(equipmentStats).forEach(([stat, value]) => {
        if (BASE_PLAYER_STATS.hasOwnProperty(stat)) {
            bonuses[stat] = value;
        }
    });
    
    return bonuses;
}; 