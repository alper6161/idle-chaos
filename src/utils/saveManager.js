// Save Manager for Multiple Save Slots
const SAVE_SLOTS_KEY = 'idle-chaos-save-slots';
const CURRENT_SLOT_KEY = 'idle-chaos-current-slot';

// Helper function to get slot-specific key
const getSlotKey = (key, slotNumber) => `${key}_slot_${slotNumber}`;

// Save slot structure
const createEmptySlot = (slotNumber) => ({
    slotNumber,
    name: `Save ${slotNumber}`,
    createdAt: new Date().toISOString(),
    lastPlayed: null,
    hasData: false,
    data: null
});

// Get all save slots
export const getSaveSlots = () => {
    try {
        const stored = localStorage.getItem(SAVE_SLOTS_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        
        // Initialize with 3 empty slots
        const slots = {
            1: createEmptySlot(1),
            2: createEmptySlot(2),
            3: createEmptySlot(3)
        };
        
        localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots));
        return slots;
    } catch (error) {
        console.error('Error loading save slots:', error);
        return {
            1: createEmptySlot(1),
            2: createEmptySlot(2),
            3: createEmptySlot(3)
        };
    }
};

// Save data to a specific slot
export const saveToSlot = (slotNumber, gameData) => {
    try {
        const slots = getSaveSlots();
        const slot = slots[slotNumber];
        
        slot.name = slot.name || `Save ${slotNumber}`;
        slot.lastPlayed = new Date().toISOString();
        slot.hasData = true;
        slot.data = gameData;
        
        slots[slotNumber] = slot;
        localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots));
        
        // Set as current slot
        localStorage.setItem(CURRENT_SLOT_KEY, slotNumber.toString());
        
        return true;
    } catch (error) {
        console.error('Error saving to slot:', error);
        return false;
    }
};

// Load data from a specific slot
export const loadFromSlot = (slotNumber) => {
    try {
        const slots = getSaveSlots();
        const slot = slots[slotNumber];
        
        if (!slot || !slot.hasData) {
            return null;
        }
        
        // Set as current slot
        localStorage.setItem(CURRENT_SLOT_KEY, slotNumber.toString());
        
        // Clear current localStorage data first
        const keys = [
            'playerHealth', 'playerGold', 'playerLevel', 'playerXP',
            'inventory', 'equippedItems', 'lootBag', 'potions',
            'autoPotionSettings', 'skillLevels', 'skillXP',
            'achievements', 'unlockedEnemies', 'gameData',
            'idle-chaos-pets', 'idle-chaos-inventory'
        ];
        
        // Clear achievement keys for all slots
        for (let i = 1; i <= 3; i++) {
            keys.push(`idle-chaos-achievements-slot-${i}`);
        }
        
        // Clear slot-specific keys for all slots
        for (let i = 1; i <= 3; i++) {
            keys.push(`idle-chaos-potions_slot_${i}`);
            keys.push(`idle-chaos-auto-potion_slot_${i}`);
            keys.push(`activeBuffs_slot_${i}`);
            keys.push(`lootBag_slot_${i}`);
            keys.push(`idle-chaos-equipped-items_slot_${i}`);
            keys.push(`idle-chaos-inventory_slot_${i}`);
            keys.push(`idle-chaos-pets_slot_${i}`);
            keys.push(`gameData_slot_${i}`);
            keys.push(`playerHealth_slot_${i}`);
            keys.push(`playerGold_slot_${i}`);
            keys.push(`selectedCharacter_slot_${i}`);
        }
        
        keys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        // Load all game data from the slot
        if (slot.data) {
            Object.keys(slot.data).forEach(key => {
                localStorage.setItem(key, JSON.stringify(slot.data[key]));
            });
        }
        
        return slot.data;
    } catch (error) {
        console.error('Error loading from slot:', error);
        return null;
    }
};

// Delete a save slot
export const deleteSlot = (slotNumber) => {
    try {
        const slots = getSaveSlots();
        slots[slotNumber] = createEmptySlot(slotNumber);
        localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots));
        return true;
    } catch (error) {
        console.error('Error deleting slot:', error);
        return false;
    }
};

// Get current active slot
export const getCurrentSlot = () => {
    try {
        const currentSlot = localStorage.getItem(CURRENT_SLOT_KEY);
        return currentSlot ? parseInt(currentSlot) : 1;
    } catch (error) {
        console.error('Error getting current slot:', error);
        return 1;
    }
};

// Save current game state to current slot
export const saveCurrentGame = () => {
    try {
        const currentSlot = getCurrentSlot();
        const gameData = {};
        
        // Collect all localStorage data
        const keys = [
            'playerHealth', 'playerGold', 'playerLevel', 'playerXP',
            'inventory', 'equippedItems', 'lootBag', 'potions',
            'autoPotionSettings', 'skillLevels', 'skillXP',
            'achievements', 'unlockedEnemies', 'gameData',
            'idle-chaos-pets', 'idle-chaos-inventory'
        ];
        
        // Add achievement keys for all slots
        for (let i = 1; i <= 3; i++) {
            keys.push(`idle-chaos-achievements-slot-${i}`);
        }
        
        // Add slot-specific keys for all slots
        for (let i = 1; i <= 3; i++) {
            keys.push(`idle-chaos-potions_slot_${i}`);
            keys.push(`idle-chaos-auto-potion_slot_${i}`);
            keys.push(`activeBuffs_slot_${i}`);
            keys.push(`lootBag_slot_${i}`);
            keys.push(`idle-chaos-equipped-items_slot_${i}`);
            keys.push(`idle-chaos-inventory_slot_${i}`);
            keys.push(`idle-chaos-pets_slot_${i}`);
            keys.push(`gameData_slot_${i}`);
            keys.push(`playerHealth_slot_${i}`);
            keys.push(`playerGold_slot_${i}`);
            keys.push(`selectedCharacter_slot_${i}`);
        }
        
        keys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value !== null) {
                try {
                    gameData[key] = JSON.parse(value);
                } catch {
                    gameData[key] = value;
                }
            }
        });
        
        return saveToSlot(currentSlot, gameData);
    } catch (error) {
        console.error('Error saving current game:', error);
        return false;
    }
};

// Rename a save slot
export const renameSlot = (slotNumber, newName) => {
    try {
        const slots = getSaveSlots();
        if (slots[slotNumber]) {
            slots[slotNumber].name = newName;
            localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error renaming slot:', error);
        return false;
    }
};

// Check if a slot has data
export const hasSlotData = (slotNumber) => {
    const slots = getSaveSlots();
    return slots[slotNumber]?.hasData || false;
};

// Get slot info
export const getSlotInfo = (slotNumber) => {
    const slots = getSaveSlots();
    return slots[slotNumber] || createEmptySlot(slotNumber);
}; 