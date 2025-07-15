// Gold System

import { INITIAL_GOLD } from './constants.js';

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

export const getGold = () => {
    const currentSlot = getCurrentSlot();
    const slotKey = getSlotKey("playerGold", currentSlot);
    const savedGold = localStorage.getItem(slotKey);
    return savedGold ? parseInt(savedGold) : INITIAL_GOLD;
};

export const saveGold = (amount) => {
    const currentSlot = getCurrentSlot();
    const slotKey = getSlotKey("playerGold", currentSlot);
    localStorage.setItem(slotKey, amount.toString());
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

export const setGold = (amount) => {
    saveGold(amount);
    return amount;
}; 