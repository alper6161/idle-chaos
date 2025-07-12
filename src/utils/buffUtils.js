// Buff Utility Functions
// Manages active buffs purchased from the store and provides multipliers

export const getActiveBuffs = () => {
    try {
        const savedBuffs = localStorage.getItem('activeBuffs');
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
            localStorage.setItem('activeBuffs', JSON.stringify(validBuffs));
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
        case 'drop_rate':
            return 1.5; // +50% = 1.5x multiplier
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

export const applyDropRateMultiplier = (dropChance) => {
    const multiplier = getBuffMultiplier('drop_rate');
    return Math.min(1, dropChance * multiplier); // Cap at 100%
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