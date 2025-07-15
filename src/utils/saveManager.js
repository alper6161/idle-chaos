// Save Manager for Multiple Save Slots

const SAVE_SLOTS_KEY = 'idle-chaos-save-slots';
const CURRENT_SLOT_KEY = 'idle-chaos-current-slot';

const getSlotKey = (key, slotNumber) => `${key}_slot_${slotNumber}`;

const createEmptySlot = (slotNumber) => ({
    slotNumber,
    name: `Save ${slotNumber}`,
    createdAt: new Date().toISOString(),
    lastPlayed: null,
    hasData: false,
    data: null
});

export const getSaveSlots = () => {
    try {
        const stored = localStorage.getItem(SAVE_SLOTS_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        
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
        
        localStorage.setItem(CURRENT_SLOT_KEY, slotNumber.toString());
        
        return true;
    } catch (error) {
        console.error('Error saving to slot:', error);
        return false;
    }
};

export const loadFromSlot = (slotNumber) => {
    try {
        const slots = getSaveSlots();
        const slot = slots[slotNumber];
        
        if (!slot || !slot.hasData) {
            return null;
        }
        
        localStorage.setItem(CURRENT_SLOT_KEY, slotNumber.toString());
        
        const keys = [
            'playerHealth', 'playerGold', 'playerLevel', 'playerXP',
            'inventory', 'equippedItems', 'lootBag', 'potions',
            'autoPotionSettings', 'skillLevels', 'skillXP',
            'achievements', 'unlockedEnemies', 'gameData',
            'idle-chaos-pets', 'idle-chaos-inventory'
        ];
        
        for (let i = 1; i <= 3; i++) {
            keys.push(`idle-chaos-achievements-slot-${i}`);
        }
        
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

export const getCurrentSlot = () => {
    try {
        const currentSlot = localStorage.getItem(CURRENT_SLOT_KEY);
        return currentSlot ? parseInt(currentSlot) : 1;
    } catch (error) {
        console.error('Error getting current slot:', error);
        return 1;
    }
};

export const saveCurrentGame = () => {
    try {
        const currentSlot = getCurrentSlot();
        const gameData = {};
        
        const keys = [
            'playerHealth', 'playerGold', 'playerLevel', 'playerXP',
            'inventory', 'equippedItems', 'lootBag', 'potions',
            'autoPotionSettings', 'skillLevels', 'skillXP',
            'achievements', 'unlockedEnemies', 'gameData',
            'idle-chaos-pets', 'idle-chaos-inventory'
        ];
        
        for (let i = 1; i <= 3; i++) {
            keys.push(`idle-chaos-achievements-slot-${i}`);
        }
        
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

export const hasSlotData = (slotNumber) => {
    const slots = getSaveSlots();
    return slots[slotNumber]?.hasData || false;
};

export const getSlotInfo = (slotNumber) => {
    const slots = getSaveSlots();
    return slots[slotNumber] || createEmptySlot(slotNumber);
}; 