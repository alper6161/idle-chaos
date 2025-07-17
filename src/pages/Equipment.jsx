import { useState, useEffect } from "react";
import styles from "../assets/styles/Equipment.module.scss";
import {
    Typography,
    Box,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    Chip,
    Avatar,
    LinearProgress
} from "@mui/material";
import { FilterList, Person, TrendingUp, Shield, LocalFireDepartment } from "@mui/icons-material";
import { useTranslate } from "../hooks/useTranslate";
import { convertLootBagToEquipment, clearProcessedLootBag } from "../utils/equipmentGenerator";

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

const EQUIPMENT_SLOTS = {
    weapon: { name: "Weapon", icon: "/images/equipment/weapon.png", slot: "weapon", position: "left" },
    shield: { name: "Shield", icon: "/images/equipment/shield.png", slot: "shield", position: "right" },
    helmet: { name: "Helmet", icon: "/images/equipment/helmet.png", slot: "helmet", position: "top" },
    chest: { name: "Chest", icon: "/images/equipment/armor.png", slot: "chest", position: "center" },
    legs: { name: "Legs", icon: "/images/equipment/leg-armor.png", slot: "legs", position: "bottom" },
    boots: { name: "Boots", icon: "/images/equipment/leg-armor.png", slot: "boots", position: "bottom" },
    gloves: { name: "Gloves", icon: "/images/equipment/gloves.png", slot: "gloves", position: "side" },
    cape: { name: "Cape", icon: "/images/equipment/cape.png", slot: "cape", position: "back" },
    ring: { name: "Ring", icon: "/images/equipment/ring.png", slot: "ring", position: "accessory" },
    amulet: { name: "Amulet", icon: "/images/equipment/ring.png", slot: "amulet", position: "accessory" }
};

const SAMPLE_EQUIPMENT = {
    weapon: null,
    shield: null,
    helmet: null,
    chest: null,
    legs: null,
    boots: null,
    gloves: null,
    cape: null,
    ring: null,
    amulet: null
};

const SAMPLE_INVENTORY = [];

const STORAGE_KEYS = {
    EQUIPPED_ITEMS: 'idle-chaos-equipped-items',
    INVENTORY: 'idle-chaos-inventory'
};

const loadFromStorage = (key, defaultValue) => {
    try {
        const currentSlot = getCurrentSlot();
        const slotKey = getSlotKey(key, currentSlot);
        const stored = localStorage.getItem(slotKey);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
        console.error(`Error loading ${key} from localStorage:`, error);
        return defaultValue;
    }
};

const saveToStorage = (key, data) => {
    try {
        const currentSlot = getCurrentSlot();
        const slotKey = getSlotKey(key, currentSlot);
        localStorage.setItem(slotKey, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
    }
};

// Calculate item sell value based on rarity and level
const calculateItemValue = (item) => {
    if (!item || !item.rarity || !item.level) return 0;
    
    // Base values per rarity
    const baseValues = {
        common: 10,
        uncommon: 25,
        rare: 60,
        epic: 150,
        legendary: 400
    };
    
    // Level multiplier (higher level = more valuable)
    const levelMultiplier = 1 + (item.level - 1) * 0.1;
    
    // Rarity multiplier
    const rarityMultiplier = baseValues[item.rarity] || baseValues.common;
    
    // Calculate total value
    const totalValue = Math.floor(rarityMultiplier * levelMultiplier);
    
    return totalValue;
};

function Equipment() {
    const { t } = useTranslate();
    const [equippedItems, setEquippedItems] = useState(() => {
        const loadedEquippedItems = loadFromStorage(STORAGE_KEYS.EQUIPPED_ITEMS, SAMPLE_EQUIPMENT);
        
        // Add levels to equipped items that don't have them
        const equippedItemsWithLevels = {};
        
        Object.keys(loadedEquippedItems).forEach(slot => {
            const item = loadedEquippedItems[slot];
            if (item && !item.level) {
                // Add level based on rarity
                const levelRanges = {
                    common: { min: 1, max: 20 },
                    uncommon: { min: 15, max: 35 },
                    rare: { min: 30, max: 50 },
                    epic: { min: 45, max: 70 },
                    legendary: { min: 60, max: 100 }
                };
                
                const rarity = item.rarity || 'common';
                const range = levelRanges[rarity];
                const randomLevel = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
                
                equippedItemsWithLevels[slot] = { ...item, level: randomLevel };
            } else {
                equippedItemsWithLevels[slot] = item;
            }
        });
        
        // Save updated equipped items back to localStorage
        localStorage.setItem(STORAGE_KEYS.EQUIPPED_ITEMS, JSON.stringify(equippedItemsWithLevels));
        
        return equippedItemsWithLevels;
    });
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [inventory, setInventory] = useState(() => {
        const loadedInventory = loadFromStorage(STORAGE_KEYS.INVENTORY, SAMPLE_INVENTORY);
        
        // Filter out invalid items and add levels to items that don't have them
        const validInventory = loadedInventory.filter(item => {
            if (!item || typeof item !== 'object') {
                console.warn('Removing invalid item:', item);
                return false;
            }
            if (!item.name || typeof item.name !== 'string') {
                console.warn('Removing item without name:', item);
                return false;
            }
            if (!item.type || typeof item.type !== 'string') {
                console.warn('Removing item without type:', item);
                return false;
            }
            if (!item.rarity || typeof item.rarity !== 'string') {
                console.warn('Removing item without rarity:', item);
                return false;
            }
            if (!item.stats || typeof item.stats !== 'object') {
                console.warn('Removing item without stats:', item);
                return false;
            }
            return true;
        });

        // Add levels to items that don't have them
        const inventoryWithLevels = validInventory.map(item => {
            if (!item.level) {
                // Add level based on rarity and stats
                const levelRanges = {
                    common: { min: 1, max: 20 },
                    uncommon: { min: 15, max: 35 },
                    rare: { min: 30, max: 50 },
                    epic: { min: 45, max: 70 },
                    legendary: { min: 60, max: 100 }
                };
                
                const rarity = item.rarity || 'common';
                const range = levelRanges[rarity];
                const randomLevel = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
                
                return { ...item, level: randomLevel };
            }
            return item;
        });

        // Save updated inventory back to localStorage
        if (inventoryWithLevels.length > 0) {
            localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventoryWithLevels));
        }
        
        return inventoryWithLevels;
    });
    const [rarityFilter, setRarityFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [replaceDialog, setReplaceDialog] = useState({
        open: false,
        currentItem: null,
        newItem: null,
        slot: null
    });
    const [newItemIds, setNewItemIds] = useState(new Set());
    const [sellMode, setSellMode] = useState(false);
    const [selectedItemsToSell, setSelectedItemsToSell] = useState(new Set());
    const [sellDialog, setSellDialog] = useState({
        open: false,
        items: [],
        totalValue: 0
    });

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.EQUIPPED_ITEMS, equippedItems);
    }, [equippedItems]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.INVENTORY, inventory);
    }, [inventory]);

    // Check for new equipment from battle loot and add to inventory
    useEffect(() => {
        const checkForNewLoot = () => {
            try {
                const currentSlot = getCurrentSlot();
                const slotKey = getSlotKey("lootBag", currentSlot);
                const lootBag = JSON.parse(localStorage.getItem(slotKey) || "[]");
                
                if (lootBag.length > 0) {
                    const newEquipment = convertLootBagToEquipment(lootBag, null); // No enemy info available here, will use default difficulty
                    
                    if (newEquipment && newEquipment.length > 0) {
                        setInventory(prev => {
                            // Ensure unique IDs
                            const existingIds = new Set(prev.map(item => item.id));
                            const uniqueNewEquipment = newEquipment.filter(item => !existingIds.has(item.id));
                            
                            // Add levels to new equipment if they don't have them
                            const equipmentWithLevels = uniqueNewEquipment.map(item => {
                                if (!item.level) {
                                    const levelRanges = {
                                        common: { min: 1, max: 20 },
                                        uncommon: { min: 15, max: 35 },
                                        rare: { min: 30, max: 50 },
                                        epic: { min: 45, max: 70 },
                                        legendary: { min: 60, max: 100 }
                                    };
                                    
                                    const rarity = item.rarity || 'common';
                                    const range = levelRanges[rarity];
                                    const randomLevel = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
                                    
                                    return { ...item, level: randomLevel };
                                }
                                return item;
                            });
                            
                            // Mark new items for highlighting
                            if (equipmentWithLevels.length > 0) {
                                setNewItemIds(new Set(equipmentWithLevels.map(item => item.id)));
                                // Remove highlight after 5 seconds
                                setTimeout(() => {
                                    setNewItemIds(new Set());
                                }, 5000);
                            }
                            
                            const updatedInventory = [...prev, ...equipmentWithLevels];
                            return updatedInventory;
                        });
                        clearProcessedLootBag(); // Clear loot bag after processing
                    }
                }
            } catch (error) {
                console.error('Error processing loot bag:', error);
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack,
                    lootBag: localStorage.getItem(getSlotKey("lootBag", getCurrentSlot()))
                });
            }
        };

        // Clean inventory function
        const cleanInventory = () => {
            try {
                const currentInventory = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY) || '[]');
                
                const validInventory = currentInventory.filter(item => {
                    if (!item || typeof item !== 'object') {
                        console.warn('Removing invalid item:', item);
                        return false;
                    }
                    if (!item.name || typeof item.name !== 'string') {
                        console.warn('Removing item without name:', item);
                        return false;
                    }
                    if (!item.type || typeof item.type !== 'string') {
                        console.warn('Removing item without type:', item);
                        return false;
                    }
                    if (!item.rarity || typeof item.rarity !== 'string') {
                        console.warn('Removing item without rarity:', item);
                        return false;
                    }
                    if (!item.stats || typeof item.stats !== 'object') {
                        console.warn('Removing item without stats:', item);
                        return false;
                    }
                    return true;
                });
                
                if (validInventory.length !== currentInventory.length) {
                    console.log('Cleaned inventory, removed', currentInventory.length - validInventory.length, 'invalid items');
                    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(validInventory));
                    setInventory(validInventory);
                }
            } catch (error) {
                console.error('Error cleaning inventory:', error);
            }
        };

        // Clean inventory on mount
        cleanInventory();

        // Check immediately and then every 2 seconds
        checkForNewLoot();
        const interval = setInterval(checkForNewLoot, 2000);
        
        return () => clearInterval(interval);
    }, []);

    // Clear old localStorage data to start fresh with weapon types
    // useEffect(() => {
    //     const clearOldData = () => {
    //         localStorage.removeItem(STORAGE_KEYS.INVENTORY);
    //         localStorage.removeItem(STORAGE_KEYS.EQUIPPED_ITEMS);
    //         console.log('Cleared old equipment data to start fresh with weapon types');
    //     };
    //     // Uncomment the line below to clear old data (run once)
    //     // clearOldData();
    // }, []);

    const filteredInventory = inventory.filter(item => {
        const matchesRarity = rarityFilter === "all" || item.rarity === rarityFilter;
        const matchesType = typeFilter === "all" || item.type === typeFilter;
        const matchesSlot = selectedSlot === null || item.type === selectedSlot;
        
        return matchesRarity && matchesType && matchesSlot;
    });

    const handleEquipItem = (item) => {
        const targetSlot = item.type;
        
        if (equippedItems[targetSlot]) {
            setReplaceDialog({
                open: true,
                currentItem: equippedItems[targetSlot],
                newItem: item,
                slot: targetSlot
            });
        } else {
            setEquippedItems(prev => ({
                ...prev,
                [targetSlot]: item
            }));
            setInventory(prev => prev.filter(invItem => invItem.id !== item.id));
            setSelectedSlot(targetSlot);
        }
    };

    const handleReplaceConfirm = () => {
        const { currentItem, newItem, slot } = replaceDialog;
        
        setInventory(prev => [...prev, currentItem]);
        setEquippedItems(prev => ({
            ...prev,
            [slot]: newItem
        }));
        setInventory(prev => prev.filter(invItem => invItem.id !== newItem.id));
        setSelectedSlot(slot);
        setReplaceDialog({ open: false, currentItem: null, newItem: null, slot: null });
    };

    const handleReplaceCancel = () => {
        setReplaceDialog({ open: false, currentItem: null, newItem: null, slot: null });
    };

    const handleUnequipItem = (slot) => {
        if (equippedItems[slot]) {
            setInventory(prev => [...prev, equippedItems[slot]]);
            setEquippedItems(prev => ({
                ...prev,
                [slot]: null
            }));
        }
    };

    const handleUnselectSlot = () => {
        setSelectedSlot(null);
    };

    // Sell system functions
    const toggleSellMode = () => {
        setSellMode(!sellMode);
        if (sellMode) {
            setSelectedItemsToSell(new Set());
        }
    };

    const toggleItemSelection = (itemId) => {
        const newSelected = new Set(selectedItemsToSell);
        if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
        } else {
            newSelected.add(itemId);
        }
        setSelectedItemsToSell(newSelected);
    };

    const handleSellItems = () => {
        const itemsToSell = inventory.filter(item => selectedItemsToSell.has(item.id));
        const totalValue = itemsToSell.reduce((sum, item) => sum + calculateItemValue(item), 0);
        
        setSellDialog({
            open: true,
            items: itemsToSell,
            totalValue: totalValue
        });
    };

    const confirmSell = () => {
        // Remove items from inventory
        const newInventory = inventory.filter(item => !selectedItemsToSell.has(item.id));
        setInventory(newInventory);
        saveToStorage(STORAGE_KEYS.INVENTORY, newInventory);
        
        // Add gold to player
        const currentSlot = getCurrentSlot();
        const goldSlotKey = getSlotKey('playerGold', currentSlot);
        const currentGold = parseInt(localStorage.getItem(goldSlotKey) || '0');
        const newGold = currentGold + sellDialog.totalValue;
        localStorage.setItem(goldSlotKey, newGold.toString());
        
        // Reset sell mode
        setSellMode(false);
        setSelectedItemsToSell(new Set());
        setSellDialog({ open: false, items: [], totalValue: 0 });
    };

    const cancelSell = () => {
        setSellDialog({ open: false, items: [], totalValue: 0 });
    };

    const getRarityColor = (rarity) => {
        if (!rarity) return '#6b7280'; // Default to common if no rarity
        switch (rarity) {
            case "legendary": return "#ff6b35";
            case "epic": return "#b45af2";
            case "rare": return "#3b82f6";
            case "uncommon": return "#10b981";
            case "common": return "#6b7280";
            default: return "#6b7280";
        }
    };

    const getRarityBorder = (rarity) => {
        if (!rarity) return '#6b7280'; // Default to common if no rarity
        switch (rarity) {
            case "legendary": return "#ff6b35";
            case "epic": return "#b45af2";
            case "rare": return "#3b82f6";
            case "uncommon": return "#10b981";
            case "common": return "#6b7280";
            default: return "#6b7280";
        }
    };

    const calculateTotalStats = () => {
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

    const getPowerLevel = () => {
        const totalStats = calculateTotalStats();
        let power = 0;
        
        Object.entries(totalStats).forEach(([stat, value]) => {
            switch (stat) {
                case "ATK": power += value * 2; break;
                case "DEF": power += value * 1.5; break;
                case "HP": power += value * 0.5; break;
                case "CRIT_CHANCE": power += value * 1.2; break;
                case "CRIT_DAMAGE": power += value * 1.1; break;
                default: power += value * 0.8; break;
            }
        });
        
        return Math.floor(power);
    };

    const createComparisonTooltip = (inventoryItem) => {
        // Güvenli kontroller ekle
        if (!inventoryItem || !inventoryItem.name) {
            console.warn('Invalid inventory item:', inventoryItem);
            console.warn('Item type:', typeof inventoryItem);
            console.warn('Item keys:', inventoryItem ? Object.keys(inventoryItem) : 'null/undefined');
            return <div>Invalid item</div>;
        }

        if (!selectedSlot || !equippedItems[selectedSlot]) {
            return (
                <div className={styles.tooltipContent}>
                    <div className={styles.tooltipHeader}>
                        <Typography variant="body2" className={styles.tooltipTitle}>
                            {inventoryItem.name}
                        </Typography>
                        <Typography variant="caption" className={styles.tooltipRarity}>
                            {(inventoryItem.rarity || 'common').toUpperCase()}
                        </Typography>
                        {inventoryItem.level && (
                            <Typography variant="caption" className={styles.tooltipLevel}>
                                iLvl {inventoryItem.level}
                            </Typography>
                        )}
                        {inventoryItem.weaponType && (
                            <Typography variant="caption" className={styles.tooltipWeaponType}>
                                {inventoryItem.weaponType.toUpperCase()} WEAPON
                            </Typography>
                        )}
                    </div>
                    <div className={styles.tooltipStats}>
                        {Object.entries(inventoryItem.stats || {}).map(([stat, value]) => (
                            <div key={stat} className={styles.tooltipStat}>
                                <span>+{value} {stat}</span>
                            </div>
                        ))}
                    </div>
                    <div className={styles.tooltipFooter}>
                        <Typography variant="caption">{t('common.clickToEquip')}</Typography>
                    </div>
                </div>
            );
        }

        const currentItem = equippedItems[selectedSlot];
        const compareStats = (newStats, currentStats) => {
            const comparison = {};
            const allStats = new Set([...Object.keys(newStats || {}), ...Object.keys(currentStats || {})]);
            
            allStats.forEach(stat => {
                const newValue = newStats?.[stat] || 0;
                const currentValue = currentStats?.[stat] || 0;
                const difference = newValue - currentValue;
                
                comparison[stat] = {
                    new: newValue,
                    current: currentValue,
                    difference: difference,
                    isUpgrade: difference > 0,
                    isDowngrade: difference < 0
                };
            });
            
            return comparison;
        };

        const statComparison = compareStats(inventoryItem.stats, currentItem.stats);

        return (
            <div className={styles.tooltipContent}>
                <div className={styles.tooltipHeader}>
                    <Typography variant="body2" className={styles.tooltipTitle}>
                        {inventoryItem.name}
                    </Typography>
                    <Typography variant="caption" className={styles.tooltipRarity}>
                        {(inventoryItem.rarity || 'common').toUpperCase()}
                    </Typography>
                    {inventoryItem.level && (
                        <Typography variant="caption" className={styles.tooltipLevel}>
                            Level {inventoryItem.level}
                        </Typography>
                    )}
                    {inventoryItem.weaponType && (
                        <Typography variant="caption" className={styles.tooltipWeaponType}>
                            {inventoryItem.weaponType.toUpperCase()} WEAPON
                        </Typography>
                    )}
                </div>
                <div className={styles.tooltipComparison}>
                    <Typography variant="caption" className={styles.comparisonTitle}>
                        {t('common.vs')} {currentItem.name}
                    </Typography>
                    <div className={styles.tooltipStats}>
                        {Object.entries(statComparison).map(([stat, comparison]) => (
                            <div key={stat} className={`${styles.tooltipStat} ${
                                comparison.isUpgrade ? styles.upgrade : 
                                comparison.isDowngrade ? styles.downgrade : styles.neutral
                            }`}>
                                <span className={styles.statName}>{stat}</span>
                                <span className={styles.statValues}>
                                    {comparison.new} 
                                    {comparison.difference !== 0 && (
                                        <span className={styles.statDifference}>
                                            ({comparison.difference > 0 ? '+' : ''}{comparison.difference})
                                        </span>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.tooltipFooter}>
                    <Typography variant="caption">{t('common.clickToEquip')}</Typography>
                </div>
            </div>
        );
    };

    // Equipment Slot Component
    const EquipmentSlot = ({ slotKey, slotData }) => {
        const equippedItem = equippedItems[slotKey];
        const isEmpty = !equippedItem;
        
        // Create tooltip content for equipped items
        const createEquippedItemTooltip = (item) => {
            if (!item?.stats) return '';
            
            return (
                <div style={{ maxWidth: '200px' }}>
                    <Typography variant="body2" sx={{ color: getRarityColor(item.rarity || 'common'), fontWeight: 'bold', mb: 1 }}>
                        {item.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: getRarityColor(item.rarity || 'common'), textTransform: 'uppercase', display: 'block', mb: 1 }}>
                        {item.rarity || 'common'}
                    </Typography>
                    {item.level && (
                        <Typography variant="caption" sx={{ color: '#00ff88', display: 'block', mb: 1, fontWeight: 'bold' }}>
                            iLvl {item.level}
                        </Typography>
                    )}
                    {item.weaponType && (
                        <Typography variant="caption" sx={{ color: '#ffd700', textTransform: 'uppercase', display: 'block', mb: 1, fontWeight: 'bold' }}>
                            {item.weaponType.toUpperCase()} WEAPON
                        </Typography>
                    )}
                    {Object.entries(item.stats).map(([stat, value]) => (
                        <Typography key={stat} variant="caption" sx={{ color: '#48bb78', display: 'block', lineHeight: 1.3 }}>
                            +{value} {stat.replace(/_/g, ' ')}
                        </Typography>
                    ))}
                </div>
            );
        };
        
        return (
            <div 
                className={`${styles.equipmentSlot} ${selectedSlot === slotKey ? styles.selected : ''} ${isEmpty ? styles.empty : styles.equipped}`}
                onClick={() => setSelectedSlot(slotKey)}
            >
                <div className={styles.slotGlow}></div>
                <div className={styles.slotBorder}>
                    <div className={styles.slotHeader}>
                        <img src={slotData.icon} alt={slotData.name} className={styles.slotIcon} />
                        <Typography variant="caption" className={styles.slotName}>
                            {slotData.name}
                        </Typography>
                    </div>
                    
                    {equippedItem ? (
                        <Tooltip 
                            title={createEquippedItemTooltip(equippedItem)}
                            arrow
                            placement="top"
                            componentsProps={{
                                tooltip: {
                                    sx: {
                                        backgroundColor: 'rgba(26, 26, 46, 0.95)',
                                        border: `2px solid ${getRarityColor(equippedItem.rarity)}`,
                                        borderRadius: '8px',
                                        boxShadow: `0 0 20px ${getRarityColor(equippedItem.rarity)}40`,
                                        backdropFilter: 'blur(10px)',
                                        maxWidth: '250px'
                                    }
                                },
                                arrow: {
                                    sx: {
                                        color: getRarityColor(equippedItem.rarity)
                                    }
                                }
                            }}
                        >
                            <div 
                                className={styles.equippedItem}
                                style={{ 
                                    borderColor: getRarityBorder(equippedItem.rarity),
                                    boxShadow: `0 0 10px ${getRarityColor(equippedItem.rarity)}40`
                                }}
                            >
                                <Typography variant="body2" className={styles.itemName}>
                                    {equippedItem.name}
                                </Typography>
                                <div className={styles.itemInfo}>
                                    <Typography 
                                        variant="caption" 
                                        className={styles.itemRarity}
                                        style={{ color: getRarityColor(equippedItem.rarity) }}
                                    >
                                        {equippedItem.rarity.toUpperCase()}
                                    </Typography>
                                    {equippedItem.level && (
                                        <Typography 
                                            variant="caption" 
                                            className={styles.itemLevel}
                                            style={{ color: '#00ff88' }}
                                        >
                                            iLvl {equippedItem.level}
                                        </Typography>
                                    )}
                                    {equippedItem.weaponType && (
                                        <Typography 
                                            variant="caption" 
                                            className={styles.itemWeaponType}
                                        >
                                            {equippedItem.weaponType}
                                        </Typography>
                                    )}
                                </div>
                            </div>
                        </Tooltip>
                    ) : (
                        <div className={styles.emptySlot}>
                            <Typography variant="caption" className={styles.emptyText}>
                                {t('common.empty')}
                            </Typography>
                        </div>
                    )}
                </div>
            </div>
        );
    };



    const totalStats = calculateTotalStats();
    const powerLevel = getPowerLevel();

    return (
        <div className={styles.equipmentContainer}>
            {/* Animated Background */}
            <div className={styles.backgroundAnimation}>
                <div className={styles.floatingParticles}>
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className={styles.particle} style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${3 + Math.random() * 2}s`
                        }}></div>
                    ))}
                </div>
            </div>

            {/* Header Section */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.titleSection}>
                        <div className={styles.pixelTitle}>
                            EQUIPMENT
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats and Power Level Section */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                {/* Stats Panel */}
                <Paper className={styles.statsPanel} style={{ flex: '1' }}>
                    <div className={styles.panelHeader}>
                        <TrendingUp className={styles.panelIcon} />
                        <Typography variant="h6" className={styles.panelTitle}>
                            {t('common.totalStats')}
                        </Typography>
                    </div>
                    
                    <div className={styles.statsGrid}>
                        {Object.entries(totalStats).length > 0 ? (
                            Object.entries(totalStats).map(([stat, value]) => (
                                <div key={stat} className={styles.statItem}>
                                    <div className={styles.statIcon}>
                                        <Shield />
                                    </div>
                                    <div className={styles.statContent}>
                                        <Typography variant="body2" className={styles.statName}>
                                            {stat.replace(/_/g, ' ')}
                                        </Typography>
                                        <Typography variant="h6" className={styles.statValue}>
                                            {value}
                                        </Typography>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.noStats}>
                                <Typography variant="body2" className={styles.noStatsText}>
                                    {t('common.noEquipmentEquipped')}
                                </Typography>
                            </div>
                        )}
                    </div>
                </Paper>

                {/* Power Level - Separate Panel */}
                <Paper 
                    className={styles.powerLevelPanel}
                    style={{ 
                        minWidth: '200px',
                        width: '200px'
                    }}
                >
                    <div className={styles.panelHeader}>
                        <LocalFireDepartment className={styles.panelIcon} />
                        <Typography variant="h6" className={styles.panelTitle}>
                            {t('common.powerLevel')}
                        </Typography>
                    </div>
                    
                    <div className={styles.powerLevelContent}>
                        <Typography 
                            variant="h2" 
                            className={styles.powerLevelValue}
                        >
                            {powerLevel}
                        </Typography>
                    </div>
                </Paper>
            </div>

            <div className={styles.mainContent}>
                {/* Equipment Section */}
                <div className={styles.equipmentSection}>
                    <Paper className={styles.equipmentPanel}>
                        <div className={styles.panelHeader}>
                            <Person className={styles.panelIcon} />
                            <Typography variant="h6" className={styles.panelTitle}>
                                {t('common.characterEquipment')}
                            </Typography>
                        </div>
                        
                        <div className={styles.characterLayout}>
                            {/* Equipment Slots arranged around character */}
                            <div className={styles.equipmentSlots}>
                                {/* Top row */}
                                <div className={styles.topSlots}>
                                    <EquipmentSlot slotKey="helmet" slotData={EQUIPMENT_SLOTS.helmet} />
                                </div>
                                
                                {/* Middle row */}
                                <div className={styles.middleSlots}>
                                    <EquipmentSlot slotKey="weapon" slotData={EQUIPMENT_SLOTS.weapon} />
                                    <EquipmentSlot slotKey="cape" slotData={EQUIPMENT_SLOTS.cape} />
                                    <EquipmentSlot slotKey="shield" slotData={EQUIPMENT_SLOTS.shield} />
                                </div>
                                
                                {/* Center row */}
                                <div className={styles.centerSlots}>
                                    <EquipmentSlot slotKey="gloves" slotData={EQUIPMENT_SLOTS.gloves} />
                                    <EquipmentSlot slotKey="chest" slotData={EQUIPMENT_SLOTS.chest} />
                                    <EquipmentSlot slotKey="ring" slotData={EQUIPMENT_SLOTS.ring} />
                                </div>
                                
                                {/* Bottom row */}
                                <div className={styles.bottomSlots}>
                                    <EquipmentSlot slotKey="legs" slotData={EQUIPMENT_SLOTS.legs} />
                                    <EquipmentSlot slotKey="boots" slotData={EQUIPMENT_SLOTS.boots} />
                                    <EquipmentSlot slotKey="amulet" slotData={EQUIPMENT_SLOTS.amulet} />
                                </div>
                            </div>
                        </div>
                    </Paper>
                </div>

                {/* Inventory Section */}
                <div className={styles.inventorySection}>
                    <Paper className={styles.inventoryPanel}>
                        <div className={styles.panelHeader}>
                            <div className={styles.panelTitleSection}>
                                <FilterList className={styles.panelIcon} />
                                <Typography variant="h6" className={styles.panelTitle}>
                                    {t('common.inventory')}
                                </Typography>
                            </div>
                            <div className={styles.panelActions}>
                                <Button
                                    variant={sellMode ? "contained" : "outlined"}
                                    color={sellMode ? "error" : "primary"}
                                    size="small"
                                    onClick={toggleSellMode}
                                    className={styles.sellButton}
                                >
                                    {sellMode ? "Cancel Sell" : "Sell Items"}
                                </Button>
                                {sellMode && selectedItemsToSell.size > 0 && (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        onClick={handleSellItems}
                                        className={styles.confirmSellButton}
                                    >
                                        Sell ({selectedItemsToSell.size})
                                    </Button>
                                )}
                            </div>
                        </div>
                        
                        {/* Enhanced Filters */}
                        <div className={styles.filterSection}>
                            <div className={styles.filterChips}>
                                {["all", "legendary", "epic", "rare", "uncommon", "common"].map(rarity => (
                                    <Chip
                                        key={rarity}
                                        label={rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                                        clickable
                                        color={rarityFilter === rarity ? "primary" : "default"}
                                        onClick={() => setRarityFilter(rarity)}
                                        className={styles.filterChip}
                                        style={{
                                            backgroundColor: rarityFilter === rarity && rarity !== "all" ? getRarityColor(rarity) : undefined,
                                            color: rarityFilter === rarity ? '#fff' : undefined,
                                            borderColor: rarityFilter === rarity && rarity !== "all" ? getRarityColor(rarity) : undefined
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Selected Slot Info */}
                        {selectedSlot && (
                            <div className={styles.selectedSlotInfo}>
                                <Typography variant="body2" className={styles.slotInfo}>
                                    <strong>{t('common.selected')}</strong> {EQUIPMENT_SLOTS[selectedSlot]?.name}
                                </Typography>
                                <div className={styles.slotActions}>
                                    <Button 
                                        variant="outlined" 
                                        size="small" 
                                        onClick={handleUnselectSlot}
                                        className={styles.unselectButton}
                                    >
                                        {t('common.unselect')}
                                    </Button>
                                    {equippedItems[selectedSlot] && (
                                        <Button 
                                            variant="outlined" 
                                            size="small" 
                                            onClick={() => handleUnequipItem(selectedSlot)}
                                            className={styles.unequipButton}
                                        >
                                            {t('equipment.unequip')}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* Inventory Grid */}
                        <div className={styles.inventoryGrid}>
                            {filteredInventory.length > 0 ? (
                                filteredInventory.map((item, index) => (
                                    <Tooltip
                                        key={`inventory-${item.id}-${index}`}
                                        title={createComparisonTooltip(item)}
                                        placement="top"
                                        arrow
                                        classes={{
                                            tooltip: styles.customTooltip,
                                            arrow: styles.tooltipArrow
                                        }}
                                    >
                                        <div 
                                            className={`${styles.inventoryItem} ${newItemIds.has(item.id) ? styles.newItem : ''} ${sellMode && selectedItemsToSell.has(item.id) ? styles.selectedForSell : ''}`}
                                            onClick={() => sellMode ? toggleItemSelection(item.id) : handleEquipItem(item)}
                                        >
                                            <div className={styles.itemGlow} style={{
                                                backgroundColor: `${getRarityColor(item.rarity || 'common')}20`,
                                                boxShadow: `0 0 20px ${getRarityColor(item.rarity || 'common')}40`
                                            }}></div>
                                            <div 
                                                className={styles.itemContent}
                                                style={{ 
                                                    borderColor: getRarityBorder(item.rarity || 'common'),
                                                    boxShadow: `0 0 10px ${getRarityColor(item.rarity || 'common')}30`
                                                }}
                                            >
                                                <div className={styles.itemHeader}>
                                                    <img 
                                                        src={EQUIPMENT_SLOTS[item.type]?.icon || EQUIPMENT_SLOTS.weapon.icon} 
                                                        alt={item.type} 
                                                        className={styles.itemIcon} 
                                                    />
                                                    <Typography variant="body2" className={styles.itemName}>
                                                        {item.name}
                                                    </Typography>
                                                </div>
                                                <div className={styles.itemInfo}>
                                                    <Typography 
                                                        variant="caption" 
                                                        className={styles.itemRarity}
                                                        style={{ color: getRarityColor(item.rarity || 'common') }}
                                                    >
                                                        {(item.rarity || 'common').toUpperCase()}
                                                    </Typography>
                                                    {item.level && (
                                                        <Typography 
                                                            variant="caption" 
                                                            className={styles.itemLevel}
                                                            style={{ color: '#00ff88' }}
                                                        >
                                                            iLvl {item.level}
                                                        </Typography>
                                                    )}
                                                    {item.weaponType && (
                                                        <Typography 
                                                            variant="caption" 
                                                            className={styles.itemWeaponType}
                                                        >
                                                            {item.weaponType}
                                                        </Typography>
                                                    )}
                                                </div>
                                                {item.stats && (
                                                    <div className={styles.itemStats}>
                                                        {Object.entries(item.stats).slice(0, 3).map(([stat, value], statIndex) => (
                                                            <Typography key={`item-${item.id}-${stat}-${statIndex}`} variant="caption" className={styles.statLine}>
                                                                +{value} {stat.replace(/_/g, ' ')}
                                                            </Typography>
                                                        ))}
                                                        {Object.keys(item.stats).length > 3 && (
                                                            <Typography variant="caption" className={styles.moreStats}>
                                                                +{Object.keys(item.stats).length - 3} more...
                                                            </Typography>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Tooltip>
                                ))
                            ) : (
                                <div className={styles.noItems}>
                                    <Typography variant="body2" className={styles.noItemsText}>
                                        {t('common.noItemsFound')}
                                    </Typography>
                                </div>
                            )}
                        </div>
                    </Paper>
                </div>
            </div>

            {/* Enhanced Replace Dialog */}
            <Dialog 
                open={replaceDialog.open} 
                onClose={handleReplaceCancel}
                maxWidth="md"
                fullWidth
                className={styles.replaceDialog}
            >
                <DialogTitle className={styles.dialogTitle}>
                    {t('equipment.replace')}
                </DialogTitle>
                <DialogContent className={styles.dialogContent}>
                    <div className={styles.replaceComparison}>
                        <div className={styles.currentItem}>
                            <Typography variant="h6" className={styles.dialogSectionTitle}>
                                {t('common.currentEquipment')}
                            </Typography>
                            {replaceDialog.currentItem && (
                                <div 
                                    className={styles.dialogItem}
                                    style={{ 
                                        borderColor: getRarityBorder(replaceDialog.currentItem.rarity || 'common'),
                                        boxShadow: `0 0 10px ${getRarityColor(replaceDialog.currentItem.rarity || 'common')}40`
                                    }}
                                >
                                    <div className={styles.dialogItemHeader}>
                                        <img 
                                            src={EQUIPMENT_SLOTS[replaceDialog.slot]?.icon || EQUIPMENT_SLOTS.weapon.icon} 
                                            alt={replaceDialog.slot} 
                                            className={styles.dialogItemIcon} 
                                        />
                                        <Typography variant="body1" className={styles.dialogItemName}>
                                            {replaceDialog.currentItem.name}
                                        </Typography>
                                    </div>
                                    <Typography 
                                        variant="caption" 
                                        className={styles.dialogItemRarity}
                                        style={{ color: getRarityColor(replaceDialog.currentItem.rarity || 'common') }}
                                    >
                                        {(replaceDialog.currentItem.rarity || 'common').toUpperCase()}
                                    </Typography>
                                    {replaceDialog.currentItem.level && (
                                        <Typography 
                                            variant="caption" 
                                            className={styles.dialogItemLevel}
                                            style={{ color: '#00ff88' }}
                                        >
                                            iLvl {replaceDialog.currentItem.level}
                                        </Typography>
                                    )}
                                    {replaceDialog.currentItem.stats && (
                                        <div className={styles.dialogItemStats}>
                                            {Object.entries(replaceDialog.currentItem.stats).map(([stat, value], index) => (
                                                <Typography key={`current-${stat}-${index}`} variant="caption" className={styles.dialogStatLine}>
                                                    +{value} {stat.replace(/_/g, ' ')}
                                                </Typography>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className={styles.replaceArrow}>
                            <Typography variant="h4" className={styles.arrowText}>→</Typography>
                        </div>

                        <div className={styles.newItem}>
                            <Typography variant="h6" className={styles.dialogSectionTitle}>
                                {t('common.newEquipment')}
                            </Typography>
                            {replaceDialog.newItem && (
                                <div 
                                    className={styles.dialogItem}
                                    style={{ 
                                        borderColor: getRarityBorder(replaceDialog.newItem.rarity || 'common'),
                                        boxShadow: `0 0 10px ${getRarityColor(replaceDialog.newItem.rarity || 'common')}40`
                                    }}
                                >
                                    <div className={styles.dialogItemHeader}>
                                        <img 
                                            src={EQUIPMENT_SLOTS[replaceDialog.slot]?.icon || EQUIPMENT_SLOTS.weapon.icon} 
                                            alt={replaceDialog.slot} 
                                            className={styles.dialogItemIcon} 
                                        />
                                        <Typography variant="body1" className={styles.dialogItemName}>
                                            {replaceDialog.newItem.name}
                                        </Typography>
                                    </div>
                                    <Typography 
                                        variant="caption" 
                                        className={styles.dialogItemRarity}
                                        style={{ color: getRarityColor(replaceDialog.newItem.rarity || 'common') }}
                                    >
                                        {(replaceDialog.newItem.rarity || 'common').toUpperCase()}
                                    </Typography>
                                    {replaceDialog.newItem.level && (
                                        <Typography 
                                            variant="caption" 
                                            className={styles.dialogItemLevel}
                                            style={{ color: '#00ff88' }}
                                        >
                                            iLvl {replaceDialog.newItem.level}
                                        </Typography>
                                    )}
                                    {replaceDialog.newItem.stats && (
                                        <div className={styles.dialogItemStats}>
                                            {Object.entries(replaceDialog.newItem.stats).map(([stat, value], index) => (
                                                <Typography key={`new-${stat}-${index}`} variant="caption" className={styles.dialogStatLine}>
                                                    +{value} {stat.replace(/_/g, ' ')}
                                                </Typography>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
                <DialogActions className={styles.dialogActions}>
                    <Button onClick={handleReplaceCancel} className={styles.cancelButton}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={handleReplaceConfirm} className={styles.confirmButton}>
                        {t('equipment.replace')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Sell Confirmation Dialog */}
            <Dialog 
                open={sellDialog.open} 
                onClose={cancelSell}
                maxWidth="md"
                fullWidth
                className={styles.sellDialog}
            >
                <DialogTitle className={styles.dialogTitle}>
                    Confirm Sell Items
                </DialogTitle>
                <DialogContent className={styles.dialogContent}>
                    <div className={styles.sellItemsList}>
                        <Typography variant="h6" className={styles.dialogSectionTitle}>
                            Items to Sell ({sellDialog.items.length})
                        </Typography>
                        {sellDialog.items.map((item, index) => (
                            <div 
                                key={`sell-${item.id}-${index}`}
                                className={styles.sellItem}
                                style={{ 
                                    borderColor: getRarityBorder(item.rarity || 'common'),
                                    boxShadow: `0 0 10px ${getRarityColor(item.rarity || 'common')}40`
                                }}
                            >
                                <div className={styles.sellItemHeader}>
                                    <img 
                                        src={EQUIPMENT_SLOTS[item.type]?.icon || EQUIPMENT_SLOTS.weapon.icon} 
                                        alt={item.type} 
                                        className={styles.sellItemIcon} 
                                    />
                                    <div className={styles.sellItemInfo}>
                                        <Typography variant="body1" className={styles.sellItemName}>
                                            {item.name}
                                        </Typography>
                                        <Typography 
                                            variant="caption" 
                                            className={styles.sellItemRarity}
                                            style={{ color: getRarityColor(item.rarity || 'common') }}
                                        >
                                            {(item.rarity || 'common').toUpperCase()} • iLvl {item.level}
                                        </Typography>
                                    </div>
                                    <Typography variant="h6" className={styles.sellItemValue}>
                                        💰 {calculateItemValue(item)}
                                    </Typography>
                                </div>
                            </div>
                        ))}
                        <div className={styles.sellTotal}>
                            <Typography variant="h5" className={styles.totalValue}>
                                Total Value: 💰 {sellDialog.totalValue}
                            </Typography>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions className={styles.dialogActions}>
                    <Button onClick={cancelSell} className={styles.cancelButton}>
                        Cancel
                    </Button>
                    <Button onClick={confirmSell} className={styles.confirmButton} color="error">
                        Sell Items
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Equipment; 