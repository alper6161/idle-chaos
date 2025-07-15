import { getAutoPotionSettings, saveAutoPotionSettings } from './potions.js';

// Buff Utility Functions
// Manages active buffs purchased from the store and provides multipliers

// Helper function to get slot-specific key
const getSlotKey = (key, slotNumber) => `${key}_slot_${slotNumber}`;

// Get current slot number
const getCurrentSlot = () => {
    try {
        const currentSlot = localStorage.getItem('idle-chaos-current-slot');
        return currentSlot ? parseInt(currentSlot) : 1;
    } catch (error) {
        console.error('Error getting current slot:', error);
        return 1;
    }
};

export const getActiveBuffs = () => {
    try {
        const currentSlot = getCurrentSlot();
        const slotKey = getSlotKey('activeBuffs', currentSlot);
        const savedBuffs = localStorage.getItem(slotKey);
        if (!savedBuffs) return {};
        
        const buffs = JSON.parse(savedBuffs);
        
        // Filter out expired buffs
        const validBuffs = {};
        Object.entries(buffs).forEach(([key, buff]) => {
            if (buff.expiresAt > Date.now()) {
                validBuffs[key] = buff;
            }
        });
        
        // Update localStorage with valid buffs only
        if (Object.keys(validBuffs).length !== Object.keys(buffs).length) {
            localStorage.setItem(slotKey, JSON.stringify(validBuffs));
        }
        
        return validBuffs;
    } catch (error) {
        console.error('Error loading active buffs:', error);
        return {};
    }
};

export const hasActiveBuff = (buffType) => {
    const activeBuffs = getActiveBuffs();
    return Object.values(activeBuffs).some(buff => buff.type === buffType);
};

export const getBuffMultiplier = (buffType) => {
    const activeBuffs = getActiveBuffs();
    const buff = Object.values(activeBuffs).find(buff => buff.type === buffType);
    
    if (!buff) return 1;
    
    switch(buffType) {
        case 'gold':
            return 3; // +200% = 3x multiplier
        case 'experience':
            return 2; // +100% = 2x multiplier
        case 'damage':
            return 1.5; // +50% = 1.5x multiplier
        case 'critical':
            return 25; // +25% critical chance (flat addition)
        case 'speed':
            return 1.3; // +30% = 1.3x multiplier
        default:
            return 1;
    }
};

export const applyGoldMultiplier = (goldAmount) => {
    const multiplier = getBuffMultiplier('gold');
    return Math.floor(goldAmount * multiplier);
};

export const applyExperienceMultiplier = (expAmount) => {
    const multiplier = getBuffMultiplier('experience');
    return Math.floor(expAmount * multiplier);
};

export const applyDamageMultiplier = (damage) => {
    const multiplier = getBuffMultiplier('damage');
    return Math.floor(damage * multiplier);
};

export const applyCriticalChanceBonus = (baseCritChance) => {
    const bonus = hasActiveBuff('critical') ? getBuffMultiplier('critical') : 0;
    return Math.min(100, baseCritChance + bonus); // Cap at 100%
};

export const applySpeedMultiplier = (speed) => {
    const multiplier = getBuffMultiplier('speed');
    return speed * multiplier;
};

export const getBuffedPlayerStats = (baseStats) => {
    const buffedStats = { ...baseStats };
    
    // Apply damage buff
    if (hasActiveBuff('damage')) {
        buffedStats.ATK = Math.floor(buffedStats.ATK * getBuffMultiplier('damage'));
    }
    
    // Apply critical chance buff
    if (hasActiveBuff('critical')) {
        buffedStats.CRIT_CHANCE = applyCriticalChanceBonus(buffedStats.CRIT_CHANCE);
    }
    
    // Apply speed buff
    if (hasActiveBuff('speed')) {
        buffedStats.ATTACK_SPEED = applySpeedMultiplier(buffedStats.ATTACK_SPEED);
    }
    
    return buffedStats;
};

export const getActiveBuffsInfo = () => {
    const activeBuffs = getActiveBuffs();
    const buffsInfo = [];
    
    Object.entries(activeBuffs).forEach(([key, buff]) => {
        const remaining = Math.max(0, buff.expiresAt - Date.now());
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        
        buffsInfo.push({
            id: key,
            name: buff.name,
            type: buff.type,
            color: buff.color,
            timeRemaining: `${minutes}:${seconds.toString().padStart(2, '0')}`,
            expiresAt: buff.expiresAt
        });
    });
    
    return buffsInfo;
}; 

// Auto Potion Buff Handler
export const handleAutoPotionBuff = (buff) => {
    if (buff.id === 'auto_potion') {
        // Enable auto potion when buff is activated
        const autoPotionSettings = getAutoPotionSettings();
        autoPotionSettings.enabled = true;
        saveAutoPotionSettings(autoPotionSettings);
        
        return {
            type: 'auto_potion',
            enabled: true,
            threshold: 40
        };
    }
    return null;
};

// Get active auto potion status
export const getActiveAutoPotion = () => {
    const activeBuffs = getActiveBuffs();
    const autoPotionBuff = activeBuffs.find(buff => buff.id === 'auto_potion');
    
    if (autoPotionBuff) {
        return {
            enabled: true,
            threshold: 40,
            expiresAt: autoPotionBuff.expiresAt
        };
    }
    
    return {
        enabled: false,
        threshold: 40,
        expiresAt: null
    };
}; 