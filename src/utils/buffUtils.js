import { getAutoPotionSettings, saveAutoPotionSettings } from './potions.js';

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

export const getActiveBuffs = () => {
    try {
        const currentSlot = getCurrentSlot();
        const slotKey = getSlotKey('activeBuffs', currentSlot);
        const savedBuffs = localStorage.getItem(slotKey);
        if (!savedBuffs) return {};
        
        const buffs = JSON.parse(savedBuffs);
        
        const validBuffs = {};
        Object.entries(buffs).forEach(([key, buff]) => {
            if (buff.expiresAt > Date.now()) {
                validBuffs[key] = buff;
            }
        });
        
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
            return 3;
        case 'experience':
            return 2;
        case 'damage':
            return 1.5;
        case 'critical':
            return 25;
        case 'speed':
            return 1.3;
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
    return Math.min(100, baseCritChance + bonus);
};

export const applySpeedMultiplier = (speed) => {
    const multiplier = getBuffMultiplier('speed');
    return speed * multiplier;
};

export const getBuffedPlayerStats = (baseStats) => {
    const buffedStats = { ...baseStats };
    
    if (hasActiveBuff('damage')) {
        buffedStats.ATK = Math.floor(buffedStats.ATK * getBuffMultiplier('damage'));
    }
    
    if (hasActiveBuff('critical')) {
        buffedStats.CRIT_CHANCE = applyCriticalChanceBonus(buffedStats.CRIT_CHANCE);
    }
    
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

export const handleAutoPotionBuff = (buff) => {
    if (buff.id === 'auto_potion') {
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