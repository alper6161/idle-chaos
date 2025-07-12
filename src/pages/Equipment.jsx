import { useState, useEffect } from "react";
import styles from "../assets/styles/Equipment.module.scss";
import {
    Typography,
    Box,
    Grid,
    Paper,
    Divider,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip
} from "@mui/material";

// Equipment slots and their icons
const EQUIPMENT_SLOTS = {
    weapon: { name: "Weapon", icon: "/images/equipment/weapon.png", slot: "weapon" },
    shield: { name: "Shield", icon: "/images/equipment/shield.png", slot: "shield" },
    helmet: { name: "Helmet", icon: "/images/equipment/helmet.png", slot: "helmet" },
    chest: { name: "Chest", icon: "/images/equipment/armor.png", slot: "chest" },
    legs: { name: "Legs", icon: "/images/equipment/leg-armor.png", slot: "legs" },
    boots: { name: "Boots", icon: "/images/equipment/leg-armor.png", slot: "boots" },
    gloves: { name: "Gloves", icon: "/images/equipment/gloves.png", slot: "gloves" },
    cape: { name: "Cape", icon: "/images/equipment/cape.png", slot: "cape" },
    ring: { name: "Ring", icon: "/images/equipment/ring.png", slot: "ring" },
    amulet: { name: "Amulet", icon: "/images/equipment/ring.png", slot: "amulet" }
};

// Sample equipment data
const SAMPLE_EQUIPMENT = {
    weapon: { name: "Iron Sword", rarity: "common", stats: { ATK: 5 } },
    shield: { name: "Wooden Shield", rarity: "common", stats: { DEF: 3 } },
    helmet: null,
    chest: null,
    legs: null,
    boots: null,
    gloves: null,
    cape: null,
    ring: null,
    amulet: null
};

// Sample inventory data
const SAMPLE_INVENTORY = [
    // Weapons
    { id: 1, name: "Iron Sword", type: "weapon", rarity: "common", stats: { ATK: 5 } },
    { id: 2, name: "Steel Sword", type: "weapon", rarity: "uncommon", stats: { ATK: 8 } },
    { id: 3, name: "Magic Staff", type: "weapon", rarity: "rare", stats: { ATK: 12, CRIT_CHANCE: 5 } },
    { id: 4, name: "Dragon Blade", type: "weapon", rarity: "epic", stats: { ATK: 15, CRIT_DAMAGE: 10 } },
    
    // Shields
    { id: 5, name: "Wooden Shield", type: "shield", rarity: "common", stats: { DEF: 3 } },
    { id: 6, name: "Iron Shield", type: "shield", rarity: "uncommon", stats: { DEF: 5 } },
    { id: 7, name: "Magic Shield", type: "shield", rarity: "rare", stats: { DEF: 8, HP: 20 } },
    
    // Helmets
    { id: 8, name: "Leather Helmet", type: "helmet", rarity: "common", stats: { DEF: 2 } },
    { id: 9, name: "Iron Helmet", type: "helmet", rarity: "uncommon", stats: { DEF: 4 } },
    { id: 10, name: "Magic Helmet", type: "helmet", rarity: "rare", stats: { DEF: 6, HP: 15 } },
    
    // Chest Armor
    { id: 11, name: "Leather Armor", type: "chest", rarity: "common", stats: { DEF: 3 } },
    { id: 12, name: "Iron Armor", type: "chest", rarity: "uncommon", stats: { DEF: 6 } },
    { id: 13, name: "Magic Armor", type: "chest", rarity: "rare", stats: { DEF: 9, HP: 25 } },
    
    // Legs
    { id: 14, name: "Leather Pants", type: "legs", rarity: "common", stats: { DEF: 2 } },
    { id: 15, name: "Iron Leggings", type: "legs", rarity: "uncommon", stats: { DEF: 4 } },
    { id: 16, name: "Magic Leggings", type: "legs", rarity: "rare", stats: { DEF: 6, HP: 15 } },
    
    // Boots
    { id: 17, name: "Leather Boots", type: "boots", rarity: "common", stats: { DEF: 1 } },
    { id: 18, name: "Iron Boots", type: "boots", rarity: "uncommon", stats: { DEF: 3 } },
    { id: 19, name: "Magic Boots", type: "boots", rarity: "rare", stats: { DEF: 4, HP: 10 } },
    
    // Gloves
    { id: 20, name: "Leather Gloves", type: "gloves", rarity: "common", stats: { DEF: 1 } },
    { id: 21, name: "Iron Gauntlets", type: "gloves", rarity: "uncommon", stats: { DEF: 3 } },
    { id: 22, name: "Magic Gloves", type: "gloves", rarity: "rare", stats: { DEF: 4, CRIT_CHANCE: 3 } },
    
    // Capes
    { id: 23, name: "Cloth Cape", type: "cape", rarity: "common", stats: { DEF: 1 } },
    { id: 24, name: "Magic Cape", type: "cape", rarity: "rare", stats: { DEF: 3, CRIT_DAMAGE: 5 } },
    { id: 25, name: "Dragon Cape", type: "cape", rarity: "epic", stats: { DEF: 5, CRIT_DAMAGE: 10, HP: 20 } },
    
    // Rings
    { id: 26, name: "Copper Ring", type: "ring", rarity: "common", stats: { CRIT_CHANCE: 2 } },
    { id: 27, name: "Silver Ring", type: "ring", rarity: "uncommon", stats: { CRIT_CHANCE: 4 } },
    { id: 28, name: "Magic Ring", type: "ring", rarity: "rare", stats: { CRIT_CHANCE: 6, CRIT_DAMAGE: 5 } },
    
    // Amulets
    { id: 29, name: "Copper Amulet", type: "amulet", rarity: "common", stats: { HP: 10 } },
    { id: 30, name: "Silver Amulet", type: "amulet", rarity: "uncommon", stats: { HP: 20 } },
    { id: 31, name: "Magic Amulet", type: "amulet", rarity: "rare", stats: { HP: 30, CRIT_CHANCE: 3 } }
];

// LocalStorage keys
const STORAGE_KEYS = {
    EQUIPPED_ITEMS: 'idle-chaos-equipped-items',
    INVENTORY: 'idle-chaos-inventory'
};

// Load data from localStorage
const loadFromStorage = (key, defaultValue) => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
        console.error(`Error loading ${key} from localStorage:`, error);
        return defaultValue;
    }
};

// Save data to localStorage
const saveToStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
    }
};

function Equipment() {
    const [equippedItems, setEquippedItems] = useState(() => 
        loadFromStorage(STORAGE_KEYS.EQUIPPED_ITEMS, SAMPLE_EQUIPMENT)
    );
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [inventory, setInventory] = useState(() => 
        loadFromStorage(STORAGE_KEYS.INVENTORY, SAMPLE_INVENTORY)
    );
    const [replaceDialog, setReplaceDialog] = useState({
        open: false,
        currentItem: null,
        newItem: null,
        slot: null
    });

    // Save equipped items whenever they change
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.EQUIPPED_ITEMS, equippedItems);
    }, [equippedItems]);

    // Save inventory whenever it changes
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.INVENTORY, inventory);
    }, [inventory]);

    // Filter inventory based on selected slot
    const filteredInventory = selectedSlot && selectedSlot !== null
        ? inventory.filter(item => item.type === selectedSlot)
        : inventory;

    // Handle equipping an item
    const handleEquipItem = (item) => {
        // Auto-select the correct slot for this item type
        const targetSlot = item.type;
        
        // Check if the target slot is already occupied
        if (equippedItems[targetSlot]) {
            // Show custom dialog
            setReplaceDialog({
                open: true,
                currentItem: equippedItems[targetSlot],
                newItem: item,
                slot: targetSlot
            });
        } else {
            // Slot is empty, equip directly
            setEquippedItems(prev => ({
                ...prev,
                [targetSlot]: item
            }));
            // Remove item from inventory
            setInventory(prev => prev.filter(invItem => invItem.id !== item.id));
            // Auto-select the slot
            setSelectedSlot(targetSlot);
        }
    };

    // Handle replace confirmation
    const handleReplaceConfirm = () => {
        const { currentItem, newItem, slot } = replaceDialog;
        
        // Add current item back to inventory
        setInventory(prev => [...prev, currentItem]);
        // Equip new item
        setEquippedItems(prev => ({
            ...prev,
            [slot]: newItem
        }));
        // Remove new item from inventory
        setInventory(prev => prev.filter(invItem => invItem.id !== newItem.id));
        // Auto-select the slot
        setSelectedSlot(slot);
        // Close dialog
        setReplaceDialog({ open: false, currentItem: null, newItem: null, slot: null });
    };

    // Handle replace cancellation
    const handleReplaceCancel = () => {
        setReplaceDialog({ open: false, currentItem: null, newItem: null, slot: null });
    };

    // Handle unequipping an item
    const handleUnequipItem = (slot) => {
        if (equippedItems[slot]) {
            // Add item back to inventory
            setInventory(prev => [...prev, equippedItems[slot]]);
            // Remove from equipped
            setEquippedItems(prev => ({
                ...prev,
                [slot]: null
            }));
        }
    };

    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'common': return '#ffffff';
            case 'uncommon': return '#1eff00';
            case 'rare': return '#0070dd';
            case 'epic': return '#a335ee';
            case 'legendary': return '#ff8000';
            default: return '#ffffff';
        }
    };

    const getRarityBorder = (rarity) => {
        switch (rarity) {
            case 'common': return '#ffffff';
            case 'uncommon': return '#1eff00';
            case 'rare': return '#0070dd';
            case 'epic': return '#a335ee';
            case 'legendary': return '#ff8000';
            default: return '#ffffff';
        }
    };

    const calculateTotalStats = () => {
        let total = { ATK: 0, DEF: 0, HP: 0, CRIT_CHANCE: 0, CRIT_DAMAGE: 0 };
        
        Object.values(equippedItems).forEach(item => {
            if (item && item.stats) {
                Object.entries(item.stats).forEach(([stat, value]) => {
                    total[stat] = (total[stat] || 0) + value;
                });
            }
        });
        
        return total;
    };

    const totalStats = calculateTotalStats();

    // Create comparison tooltip content
    const createComparisonTooltip = (inventoryItem) => {
        const targetSlot = inventoryItem.type;
        const equippedItem = equippedItems[targetSlot];

        if (!equippedItem) {
    return (
                <div className={styles.tooltipContent}>
                    <Typography variant="body2" className={styles.tooltipTitle}>
                        {inventoryItem.name}
            </Typography>
                    <Typography variant="caption" className={styles.tooltipRarity}>
                        {inventoryItem.rarity.toUpperCase()}
                        </Typography>
                    {inventoryItem.stats && (
                        <div className={styles.tooltipStats}>
                            {Object.entries(inventoryItem.stats).map(([stat, value]) => (
                                <Typography key={stat} variant="caption" className={styles.tooltipStat}>
                                                                +{value} {stat}
                                                            </Typography>
                                                        ))}
                                                    </div>
                                                )}
                    <Typography variant="caption" className={styles.tooltipAction}>
                        Click to equip
                                                </Typography>
                                            </div>
            );
        }

        const inventoryStats = inventoryItem.stats || {};
        const equippedStats = equippedItem.stats || {};

        return (
            <div className={styles.tooltipContent}>
                <div className={styles.tooltipComparison}>
                    <div className={styles.tooltipCurrent}>
                        <Typography variant="body2" className={styles.tooltipTitle}>
                            Current: {equippedItem.name}
                                                </Typography>
                        <Typography variant="caption" className={styles.tooltipRarity}>
                            {equippedItem.rarity.toUpperCase()}
                                                </Typography>
                        {Object.entries(equippedStats).map(([stat, value]) => (
                            <Typography key={stat} variant="caption" className={styles.tooltipStat}>
                                                                +{value} {stat}
                                                            </Typography>
                                                        ))}
                                </div>

                    <div className={styles.tooltipArrow}>
                        <Typography variant="h6">→</Typography>
                                        </div>
                                        
                    <div className={styles.tooltipNew}>
                        <Typography variant="body2" className={styles.tooltipTitle}>
                            New: {inventoryItem.name}
                                                </Typography>
                        <Typography variant="caption" className={styles.tooltipRarity}>
                            {inventoryItem.rarity.toUpperCase()}
                                                </Typography>
                        {Object.entries(inventoryStats).map(([stat, value]) => {
                            const equippedValue = equippedStats[stat] || 0;
                            const difference = value - equippedValue;
                            const isBetter = difference > 0;
                            const isWorse = difference < 0;
                            
                            return (
                                <Typography 
                                    key={stat} 
                                    variant="caption" 
                                    className={`${styles.tooltipStat} ${
                                        isBetter ? styles.statBetter : isWorse ? styles.statWorse : ''
                                    }`}
                                >
                                    +{value} {stat} {difference !== 0 && `(${difference > 0 ? '+' : ''}${difference})`}
                                                </Typography>
                            );
                        })}
                                                    </div>
                                            </div>
                <Typography variant="caption" className={styles.tooltipAction}>
                    Click to replace
                                                </Typography>
                                            </div>
        );
    };

    // Create equipment slot component
    const EquipmentSlot = ({ slotKey, slotData }) => (
                                    <div 
            className={`${styles.equipmentSlot} ${selectedSlot === slotKey ? styles.selected : ''}`}
            onClick={() => setSelectedSlot(slotKey)}
                                    >
                                        <div className={styles.slotHeader}>
                <img src={slotData.icon} alt={slotData.name} className={styles.slotIcon} />
                <span className={styles.slotName}>{slotData.name}</span>
                                        </div>
                                        
            {equippedItems[slotKey] ? (
                                            <div 
                                                className={styles.equippedItem}
                                                style={{ 
                        borderColor: getRarityBorder(equippedItems[slotKey].rarity),
                        color: getRarityColor(equippedItems[slotKey].rarity)
                                                }}
                                            >
                                                <Typography variant="body2" className={styles.itemName}>
                        {equippedItems[slotKey].name}
                                                </Typography>
                                                <Typography variant="caption" className={styles.itemRarity}>
                        {equippedItems[slotKey].rarity.toUpperCase()}
                                                </Typography>
                    {equippedItems[slotKey].stats && (
                                                    <div className={styles.itemStats}>
                            {Object.entries(equippedItems[slotKey].stats).map(([stat, value]) => (
                                                            <Typography key={stat} variant="caption" className={styles.statLine}>
                                                                +{value} {stat}
                                                            </Typography>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className={styles.emptySlot}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Empty
                                                </Typography>
                                            </div>
                                        )}
                                    </div>
    );

    return (
        <div className={styles.equipmentContainer}>
            <Typography variant="h4" className={styles.pageTitle}>
                Equipment
                                                </Typography>

            {/* Total Stats - Compact at Top */}
            <Paper className={styles.statsPanel}>
                <Typography variant="h6" className={styles.sectionTitle}>
                    Total Stats
                                                </Typography>
                <Divider className={styles.divider} />
                
                <div className={styles.statsList}>
                    {Object.entries(totalStats).map(([stat, value]) => (
                        <div key={stat} className={styles.statItem}>
                            <span className={styles.statName}>{stat}</span>
                            <span className={styles.statValue}>+{value}</span>
                                        </div>
                                                        ))}
                                                    </div>
            </Paper>

            {/* Main Content - Equipment and Inventory Side by Side */}
            <div className={styles.mainContent}>
                {/* Equipment Slots */}
                <Paper className={styles.equipmentGrid}>
                    <Typography variant="h6" className={styles.sectionTitle}>
                        Equipment Slots
                                                </Typography>
                    <Divider className={styles.divider} />
                    
                    <div className={styles.characterEquipment}>
                        {/* Top Row - Helmet */}
                        <div className={styles.topRow}>
                            <div className={styles.helmetSlot}>
                                <EquipmentSlot slotKey="helmet" slotData={EQUIPMENT_SLOTS.helmet} />
                                    </div>
                                        </div>
                                        
                        {/* Middle Row - Weapon and Shield */}
                        <div className={styles.middleRow}>
                            <div className={styles.weaponSlot}>
                                <EquipmentSlot slotKey="weapon" slotData={EQUIPMENT_SLOTS.weapon} />
                                                    </div>
                            <div className={styles.characterSilhouette}>
                                <div className={styles.characterPlaceholder}>
                                    <Typography variant="body2" className={styles.characterText}>
                                        CHARACTER
                                                </Typography>
                                </div>
                            </div>
                            <div className={styles.shieldSlot}>
                                <EquipmentSlot slotKey="shield" slotData={EQUIPMENT_SLOTS.shield} />
                            </div>
                        </div>

                        {/* Armor Row - Chest, Gloves, Legs */}
                        <div className={styles.armorRow}>
                            <div className={styles.chestSlot}>
                                <EquipmentSlot slotKey="chest" slotData={EQUIPMENT_SLOTS.chest} />
                            </div>
                            <div className={styles.glovesSlot}>
                                <EquipmentSlot slotKey="gloves" slotData={EQUIPMENT_SLOTS.gloves} />
                            </div>
                            <div className={styles.legsSlot}>
                                <EquipmentSlot slotKey="legs" slotData={EQUIPMENT_SLOTS.legs} />
                            </div>
                        </div>

                        {/* Bottom Row - Boots and Accessories */}
                        <div className={styles.bottomRow}>
                            <div className={styles.bootsSlot}>
                                <EquipmentSlot slotKey="boots" slotData={EQUIPMENT_SLOTS.boots} />
                            </div>
                            <div className={styles.accessorySlots}>
                                <div className={styles.capeSlot}>
                                    <EquipmentSlot slotKey="cape" slotData={EQUIPMENT_SLOTS.cape} />
                                </div>
                                <div className={styles.ringSlot}>
                                    <EquipmentSlot slotKey="ring" slotData={EQUIPMENT_SLOTS.ring} />
                                </div>
                                <div className={styles.amuletSlot}>
                                    <EquipmentSlot slotKey="amulet" slotData={EQUIPMENT_SLOTS.amulet} />
                                </div>
                            </div>
                        </div>
                    </div>
                    </Paper>

            {/* Inventory Section */}
            <Paper className={styles.inventorySection}>
                <div className={styles.inventoryHeader}>
                    <Typography variant="h6" className={styles.sectionTitle}>
                        Inventory {selectedSlot && selectedSlot !== null && EQUIPMENT_SLOTS[selectedSlot] && `- ${EQUIPMENT_SLOTS[selectedSlot].name}`}
                    </Typography>
                    {selectedSlot && (
                        <Button 
                            variant="outlined" 
                            size="small" 
                            onClick={() => {
                                setSelectedSlot(null);
                            }}
                            className={styles.clearFilterButton}
                        >
                            Show All Items
                        </Button>
                    )}
                </div>
                <Divider className={styles.divider} />
                
                {selectedSlot && selectedSlot !== null && (
                    <div className={styles.selectedSlotInfo}>
                        <Typography variant="body2" className={styles.slotInfo}>
                            Selected: {EQUIPMENT_SLOTS[selectedSlot] ? EQUIPMENT_SLOTS[selectedSlot].name : selectedSlot}
                        </Typography>
                        {equippedItems[selectedSlot] && (
                            <Button 
                                variant="outlined" 
                                size="small" 
                                onClick={() => handleUnequipItem(selectedSlot)}
                                className={styles.unequipButton}
                            >
                                Unequip Current Item
                            </Button>
                        )}
                    </div>
                )}
                
                <div className={styles.inventoryGrid}>
                    {filteredInventory.length > 0 ? (
                        filteredInventory.map((item) => (
                                <Tooltip
                                    key={item.id}
                                    title={createComparisonTooltip(item)}
                                    placement="top"
                                    arrow
                                    classes={{
                                        tooltip: styles.customTooltip,
                                        arrow: styles.tooltipArrow
                                    }}
                                >
                                    <div 
                                className={styles.inventoryItem}
                                onClick={() => handleEquipItem(item)}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    handleEquipItem(item);
                                }}
                            >
                                <div 
                                    className={styles.itemContent}
                                    style={{ 
                                        borderColor: getRarityBorder(item.rarity),
                                        color: getRarityColor(item.rarity)
                                    }}
                                >
                                    <div className={styles.itemHeader}>
                                        <img 
                                            src={EQUIPMENT_SLOTS[item.type] ? EQUIPMENT_SLOTS[item.type].icon : EQUIPMENT_SLOTS.weapon.icon} 
                                            alt={item.type || 'item'} 
                                            className={styles.itemIcon} 
                                        />
                                        <Typography variant="body2" className={styles.itemName}>
                                            {item.name}
                                        </Typography>
                                    </div>
                                    <Typography variant="caption" className={styles.itemRarity}>
                                        {item.rarity.toUpperCase()}
                                    </Typography>
                                    {item.stats && (
                                        <div className={styles.itemStats}>
                                            {Object.entries(item.stats).map(([stat, value]) => (
                                                <Typography key={stat} variant="caption" className={styles.statLine}>
                                                    +{value} {stat}
                                                </Typography>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                                </Tooltip>
                        ))
                    ) : (
                        <Typography variant="body2" color="text.secondary" className={styles.noItems}>
                            {selectedSlot && EQUIPMENT_SLOTS[selectedSlot] ? `No ${EQUIPMENT_SLOTS[selectedSlot].name} items in inventory` : 'No items in inventory'}
                        </Typography>
                    )}
                </div>
            </Paper>
            </div>

            {/* Replace Item Dialog */}
            <Dialog 
                open={replaceDialog.open} 
                onClose={handleReplaceCancel}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle className={styles.dialogTitle}>
                    Replace Equipment
                </DialogTitle>
                <DialogContent className={styles.dialogContent}>
                    <div className={styles.replaceComparison}>
                        <div className={styles.currentItem}>
                            <Typography variant="h6" className={styles.dialogSectionTitle}>
                                Current Item
                            </Typography>
                            {replaceDialog.currentItem && (
                                <div 
                                    className={styles.dialogItem}
                                    style={{ 
                                        borderColor: getRarityBorder(replaceDialog.currentItem.rarity),
                                        color: getRarityColor(replaceDialog.currentItem.rarity)
                                    }}
                                >
                                    <div className={styles.dialogItemHeader}>
                                        <img 
                                            src={replaceDialog.slot && EQUIPMENT_SLOTS[replaceDialog.slot] ? EQUIPMENT_SLOTS[replaceDialog.slot].icon : EQUIPMENT_SLOTS.weapon.icon} 
                                            alt={replaceDialog.slot || 'item'} 
                                            className={styles.dialogItemIcon} 
                                        />
                                        <Typography variant="body1" className={styles.dialogItemName}>
                                            {replaceDialog.currentItem.name}
                                        </Typography>
                                    </div>
                                    <Typography variant="caption" className={styles.dialogItemRarity}>
                                        {replaceDialog.currentItem.rarity.toUpperCase()}
                                    </Typography>
                                    {replaceDialog.currentItem.stats && (
                                        <div className={styles.dialogItemStats}>
                                            {Object.entries(replaceDialog.currentItem.stats).map(([stat, value]) => (
                                                <Typography key={stat} variant="caption" className={styles.dialogStatLine}>
                                                    +{value} {stat}
                                                </Typography>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className={styles.replaceArrow}>
                            <Typography variant="h4">→</Typography>
                        </div>

                        <div className={styles.newItem}>
                            <Typography variant="h6" className={styles.dialogSectionTitle}>
                                New Item
                            </Typography>
                            {replaceDialog.newItem && (
                                <div 
                                    className={styles.dialogItem}
                                    style={{ 
                                        borderColor: getRarityBorder(replaceDialog.newItem.rarity),
                                        color: getRarityColor(replaceDialog.newItem.rarity)
                                    }}
                                >
                                    <div className={styles.dialogItemHeader}>
                                        <img 
                                            src={replaceDialog.slot && EQUIPMENT_SLOTS[replaceDialog.slot] ? EQUIPMENT_SLOTS[replaceDialog.slot].icon : EQUIPMENT_SLOTS.weapon.icon} 
                                            alt={replaceDialog.slot || 'item'} 
                                            className={styles.dialogItemIcon} 
                                        />
                                        <Typography variant="body1" className={styles.dialogItemName}>
                                            {replaceDialog.newItem.name}
                                        </Typography>
                                    </div>
                                    <Typography variant="caption" className={styles.dialogItemRarity}>
                                        {replaceDialog.newItem.rarity.toUpperCase()}
                                    </Typography>
                                    {replaceDialog.newItem.stats && (
                                        <div className={styles.dialogItemStats}>
                                            {Object.entries(replaceDialog.newItem.stats).map(([stat, value]) => (
                                                <Typography key={stat} variant="caption" className={styles.dialogStatLine}>
                                                    +{value} {stat}
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
                        Cancel
                    </Button>
                    <Button onClick={handleReplaceConfirm} className={styles.confirmButton}>
                        Replace
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Equipment; 