// Gold Management System
// Handles gold state, persistence, and calculations

// Initial gold amount
export const INITIAL_GOLD = 50;

// Get gold from localStorage
export const getGold = () => {
    const savedGold = localStorage.getItem("playerGold");
    return savedGold ? parseInt(savedGold) : INITIAL_GOLD;
};

// Save gold to localStorage
export const saveGold = (amount) => {
    localStorage.setItem("playerGold", amount.toString());
};

// Add gold to player's current amount
export const addGold = (amount) => {
    const currentGold = getGold();
    const newGold = currentGold + amount;
    saveGold(newGold);
    return newGold;
};

// Subtract gold from player's current amount
export const subtractGold = (amount) => {
    const currentGold = getGold();
    const newGold = Math.max(0, currentGold - amount);
    saveGold(newGold);
    return newGold;
};

// Check if player has enough gold
export const hasEnoughGold = (amount) => {
    return getGold() >= amount;
};

// Format gold display with commas
export const formatGold = (amount) => {
    return new Intl.NumberFormat().format(amount);
}; 