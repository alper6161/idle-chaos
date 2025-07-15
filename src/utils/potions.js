// Potion System
export const POTION_TYPES = {
    MINOR: {
        id: 'minor',
        name: 'Minor Health Potion',
        healAmount: 25,
        price: 50,
        color: '#4ade80',
        description: 'Restores 25 HP'
    },
    LESSER: {
        id: 'lesser',
        name: 'Lesser Health Potion',
        healAmount: 50,
        price: 100,
        color: '#22c55e',
        description: 'Restores 50 HP'
    },
    GREATER: {
        id: 'greater',
        name: 'Greater Health Potion',
        healAmount: 100,
        price: 200,
        color: '#16a34a',
        description: 'Restores 100 HP'
    },
    SUPERIOR: {
        id: 'superior',
        name: 'Superior Health Potion',
        healAmount: 200,
        price: 400,
        color: '#15803d',
        description: 'Restores 200 HP'
    },
    MAJOR: {
        id: 'major',
        name: 'Major Health Potion',
        healAmount: 500,
        price: 800,
        color: '#166534',
        description: 'Restores 500 HP'
    }
};

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

const POTIONS_STORAGE_KEY = 'idle-chaos-potions';
const AUTO_POTION_STORAGE_KEY = 'idle-chaos-auto-potion';

// Load potions from localStorage
export const getPotions = () => {
    try {
        const currentSlot = getCurrentSlot();
        const slotKey = getSlotKey(POTIONS_STORAGE_KEY, currentSlot);
        const stored = localStorage.getItem(slotKey);
        return stored ? JSON.parse(stored) : {
            minor: 0,
            lesser: 0,
            greater: 0,
            superior: 0,
            major: 0
        };
    } catch (error) {
        console.error('Error loading potions:', error);
        return {
            minor: 0,
            lesser: 0,
            greater: 0,
            superior: 0,
            major: 0
        };
    }
};

// Save potions to localStorage
export const savePotions = (potions) => {
    try {
        const currentSlot = getCurrentSlot();
        const slotKey = getSlotKey(POTIONS_STORAGE_KEY, currentSlot);
        localStorage.setItem(slotKey, JSON.stringify(potions));
    } catch (error) {
        console.error('Error saving potions:', error);
    }
};

// Add potions to inventory
export const addPotions = (potionType, amount) => {
    const potions = getPotions();
    potions[potionType] = (potions[potionType] || 0) + amount;
    savePotions(potions);
    return potions;
};

// Use a potion
export const usePotion = (potionType) => {
    const potions = getPotions();
    if (potions[potionType] > 0) {
        potions[potionType]--;
        savePotions(potions);
        return {
            success: true,
            healAmount: POTION_TYPES[potionType.toUpperCase()].healAmount,
            remainingPotions: potions
        };
    }
    return { success: false, healAmount: 0, remainingPotions: potions };
};

// Get auto potion settings
export const getAutoPotionSettings = () => {
    try {
        const currentSlot = getCurrentSlot();
        const slotKey = getSlotKey(AUTO_POTION_STORAGE_KEY, currentSlot);
        const stored = localStorage.getItem(slotKey);
        return stored ? JSON.parse(stored) : {
            enabled: false,
            threshold: 40, // HP percentage
            priority: ['major', 'superior', 'greater', 'lesser', 'minor'] // Use best potions first
        };
    } catch (error) {
        console.error('Error loading auto potion settings:', error);
        return {
            enabled: false,
            threshold: 40,
            priority: ['major', 'superior', 'greater', 'lesser', 'minor']
        };
    }
};

// Save auto potion settings
export const saveAutoPotionSettings = (settings) => {
    try {
        const currentSlot = getCurrentSlot();
        const slotKey = getSlotKey(AUTO_POTION_STORAGE_KEY, currentSlot);
        localStorage.setItem(slotKey, JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving auto potion settings:', error);
    }
};

// Check if auto potion should be used
export const shouldUseAutoPotion = (currentHP, maxHP) => {
    const settings = getAutoPotionSettings();
    if (!settings.enabled) return null;
    
    const hpPercentage = (currentHP / maxHP) * 100;
    if (hpPercentage <= settings.threshold) {
        const potions = getPotions();
        
        // Find the best available potion
        for (const potionType of settings.priority) {
            if (potions[potionType] > 0) {
                return potionType;
            }
        }
    }
    
    return null;
};

// Get total potion count
export const getTotalPotions = () => {
    const potions = getPotions();
    return Object.values(potions).reduce((total, count) => total + count, 0);
};

// Get potion count by type
export const getPotionCount = (potionType) => {
    const potions = getPotions();
    return potions[potionType] || 0;
}; 