export const INITIAL_GOLD = 50;

export const getGold = () => {
    const savedGold = localStorage.getItem("playerGold");
    return savedGold ? parseInt(savedGold) : INITIAL_GOLD;
};

export const saveGold = (amount) => {
    localStorage.setItem("playerGold", amount.toString());
};

export const addGold = (amount) => {
    const currentGold = getGold();
    const newGold = currentGold + amount;
    saveGold(newGold);
    return newGold;
};

export const subtractGold = (amount) => {
    const currentGold = getGold();
    const newGold = Math.max(0, currentGold - amount);
    saveGold(newGold);
    return newGold;
};

export const hasEnoughGold = (amount) => {
    return getGold() >= amount;
};

export const formatGold = (amount) => {
    return new Intl.NumberFormat().format(amount);
}; 