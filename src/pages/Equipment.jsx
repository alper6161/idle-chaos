import { useState } from "react";
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
    DialogActions
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

function Equipment() {
    const [equippedItems, setEquippedItems] = useState(SAMPLE_EQUIPMENT);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [inventory, setInventory] = useState(SAMPLE_INVENTORY);
    const [replaceDialog, setReplaceDialog] = useState({
        open: false,
        currentItem: null,
        newItem: null,
        slot: null
    });

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

    return (
        <div className={styles.equipmentContainer}>
            <Typography variant="h4" className={styles.pageTitle}>
                Equipment
            </Typography>

            <Grid container spacing={3}>
                {/* Equipment Slots */}
                <Grid item xs={12} md={8}>
                    <Paper className={styles.equipmentGrid}>
                        <Typography variant="h6" className={styles.sectionTitle}>
                            Equipment Slots
                        </Typography>
                        <Divider className={styles.divider} />
                        
                        <div className={styles.characterEquipment}>
                            {/* Top Row - Helmet */}
                            <div className={styles.topRow}>
                                <div className={styles.helmetSlot}>
                                    <div 
                                        className={`${styles.equipmentSlot} ${selectedSlot === 'helmet' ? styles.selected : ''}`}
                                        onClick={() => setSelectedSlot('helmet')}
                                    >
                                        <div className={styles.slotHeader}>
                                            <img src={EQUIPMENT_SLOTS.helmet.icon} alt="Helmet" className={styles.slotIcon} />
                                            <span className={styles.slotName}>Helmet</span>
                                        </div>
                                        
                                        {equippedItems.helmet ? (
                                            <div 
                                                className={styles.equippedItem}
                                                style={{ 
                                                    borderColor: getRarityBorder(equippedItems.helmet.rarity),
                                                    color: getRarityColor(equippedItems.helmet.rarity)
                                                }}
                                            >
                                                <Typography variant="body2" className={styles.itemName}>
                                                    {equippedItems.helmet.name}
                                                </Typography>
                                                <Typography variant="caption" className={styles.itemRarity}>
                                                    {equippedItems.helmet.rarity.toUpperCase()}
                                                </Typography>
                                                {equippedItems.helmet.stats && (
                                                    <div className={styles.itemStats}>
                                                        {Object.entries(equippedItems.helmet.stats).map(([stat, value]) => (
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
                                </div>
                            </div>

                            {/* Middle Row - Weapon and Shield */}
                            <div className={styles.middleRow}>
                                <div className={styles.weaponSlot}>
                                    <div 
                                        className={`${styles.equipmentSlot} ${selectedSlot === 'weapon' ? styles.selected : ''}`}
                                        onClick={() => setSelectedSlot('weapon')}
                                    >
                                        <div className={styles.slotHeader}>
                                            <img src={EQUIPMENT_SLOTS.weapon.icon} alt="Weapon" className={styles.slotIcon} />
                                            <span className={styles.slotName}>Weapon</span>
                                        </div>
                                        
                                        {equippedItems.weapon ? (
                                            <div 
                                                className={styles.equippedItem}
                                                style={{ 
                                                    borderColor: getRarityBorder(equippedItems.weapon.rarity),
                                                    color: getRarityColor(equippedItems.weapon.rarity)
                                                }}
                                            >
                                                <Typography variant="body2" className={styles.itemName}>
                                                    {equippedItems.weapon.name}
                                                </Typography>
                                                <Typography variant="caption" className={styles.itemRarity}>
                                                    {equippedItems.weapon.rarity.toUpperCase()}
                                                </Typography>
                                                {equippedItems.weapon.stats && (
                                                    <div className={styles.itemStats}>
                                                        {Object.entries(equippedItems.weapon.stats).map(([stat, value]) => (
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
                                </div>

                                <div className={styles.shieldSlot}>
                                    <div 
                                        className={`${styles.equipmentSlot} ${selectedSlot === 'shield' ? styles.selected : ''}`}
                                        onClick={() => setSelectedSlot('shield')}
                                    >
                                        <div className={styles.slotHeader}>
                                            <img src={EQUIPMENT_SLOTS.shield.icon} alt="Shield" className={styles.slotIcon} />
                                            <span className={styles.slotName}>Shield</span>
                                        </div>
                                        
                                        {equippedItems.shield ? (
                                            <div 
                                                className={styles.equippedItem}
                                                style={{ 
                                                    borderColor: getRarityBorder(equippedItems.shield.rarity),
                                                    color: getRarityColor(equippedItems.shield.rarity)
                                                }}
                                            >
                                                <Typography variant="body2" className={styles.itemName}>
                                                    {equippedItems.shield.name}
                                                </Typography>
                                                <Typography variant="caption" className={styles.itemRarity}>
                                                    {equippedItems.shield.rarity.toUpperCase()}
                                                </Typography>
                                                {equippedItems.shield.stats && (
                                                    <div className={styles.itemStats}>
                                                        {Object.entries(equippedItems.shield.stats).map(([stat, value]) => (
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
                                </div>
                            </div>

                            {/* Bottom Row - Armor, Gloves, and Accessories */}
                            <div className={styles.bottomRow}>
                                <div className={styles.armorSlots}>
                                    <div 
                                        className={`${styles.equipmentSlot} ${selectedSlot === 'chest' ? styles.selected : ''}`}
                                        onClick={() => setSelectedSlot('chest')}
                                    >
                                        <div className={styles.slotHeader}>
                                            <img src={EQUIPMENT_SLOTS.chest.icon} alt="Chest" className={styles.slotIcon} />
                                            <span className={styles.slotName}>Chest</span>
                                        </div>
                                        
                                        {equippedItems.chest ? (
                                            <div 
                                                className={styles.equippedItem}
                                                style={{ 
                                                    borderColor: getRarityBorder(equippedItems.chest.rarity),
                                                    color: getRarityColor(equippedItems.chest.rarity)
                                                }}
                                            >
                                                <Typography variant="body2" className={styles.itemName}>
                                                    {equippedItems.chest.name}
                                                </Typography>
                                                <Typography variant="caption" className={styles.itemRarity}>
                                                    {equippedItems.chest.rarity.toUpperCase()}
                                                </Typography>
                                                {equippedItems.chest.stats && (
                                                    <div className={styles.itemStats}>
                                                        {Object.entries(equippedItems.chest.stats).map(([stat, value]) => (
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

                                    <div 
                                        className={`${styles.equipmentSlot} ${selectedSlot === 'legs' ? styles.selected : ''}`}
                                        onClick={() => setSelectedSlot('legs')}
                                    >
                                        <div className={styles.slotHeader}>
                                            <img src={EQUIPMENT_SLOTS.legs.icon} alt="Legs" className={styles.slotIcon} />
                                            <span className={styles.slotName}>Legs</span>
                                        </div>
                                        
                                        {equippedItems.legs ? (
                                            <div 
                                                className={styles.equippedItem}
                                                style={{ 
                                                    borderColor: getRarityBorder(equippedItems.legs.rarity),
                                                    color: getRarityColor(equippedItems.legs.rarity)
                                                }}
                                            >
                                                <Typography variant="body2" className={styles.itemName}>
                                                    {equippedItems.legs.name}
                                                </Typography>
                                                <Typography variant="caption" className={styles.itemRarity}>
                                                    {equippedItems.legs.rarity.toUpperCase()}
                                                </Typography>
                                                {equippedItems.legs.stats && (
                                                    <div className={styles.itemStats}>
                                                        {Object.entries(equippedItems.legs.stats).map(([stat, value]) => (
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

                                    <div 
                                        className={`${styles.equipmentSlot} ${selectedSlot === 'boots' ? styles.selected : ''}`}
                                        onClick={() => setSelectedSlot('boots')}
                                    >
                                        <div className={styles.slotHeader}>
                                            <img src={EQUIPMENT_SLOTS.boots.icon} alt="Boots" className={styles.slotIcon} />
                                            <span className={styles.slotName}>Boots</span>
                                        </div>
                                        
                                        {equippedItems.boots ? (
                                            <div 
                                                className={styles.equippedItem}
                                                style={{ 
                                                    borderColor: getRarityBorder(equippedItems.boots.rarity),
                                                    color: getRarityColor(equippedItems.boots.rarity)
                                                }}
                                            >
                                                <Typography variant="body2" className={styles.itemName}>
                                                    {equippedItems.boots.name}
                                                </Typography>
                                                <Typography variant="caption" className={styles.itemRarity}>
                                                    {equippedItems.boots.rarity.toUpperCase()}
                                                </Typography>
                                                {equippedItems.boots.stats && (
                                                    <div className={styles.itemStats}>
                                                        {Object.entries(equippedItems.boots.stats).map(([stat, value]) => (
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
                                </div>

                                <div className={styles.glovesSlot}>
                                    <div 
                                        className={`${styles.equipmentSlot} ${selectedSlot === 'gloves' ? styles.selected : ''}`}
                                        onClick={() => setSelectedSlot('gloves')}
                                    >
                                        <div className={styles.slotHeader}>
                                            <img src={EQUIPMENT_SLOTS.gloves.icon} alt="Gloves" className={styles.slotIcon} />
                                            <span className={styles.slotName}>Gloves</span>
                                        </div>
                                        
                                        {equippedItems.gloves ? (
                                            <div 
                                                className={styles.equippedItem}
                                                style={{ 
                                                    borderColor: getRarityBorder(equippedItems.gloves.rarity),
                                                    color: getRarityColor(equippedItems.gloves.rarity)
                                                }}
                                            >
                                                <Typography variant="body2" className={styles.itemName}>
                                                    {equippedItems.gloves.name}
                                                </Typography>
                                                <Typography variant="caption" className={styles.itemRarity}>
                                                    {equippedItems.gloves.rarity.toUpperCase()}
                                                </Typography>
                                                {equippedItems.gloves.stats && (
                                                    <div className={styles.itemStats}>
                                                        {Object.entries(equippedItems.gloves.stats).map(([stat, value]) => (
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
                                </div>

                                <div className={styles.accessorySlots}>
                                    <div 
                                        className={`${styles.equipmentSlot} ${selectedSlot === 'cape' ? styles.selected : ''}`}
                                        onClick={() => setSelectedSlot('cape')}
                                    >
                                        <div className={styles.slotHeader}>
                                            <img src={EQUIPMENT_SLOTS.cape.icon} alt="Cape" className={styles.slotIcon} />
                                            <span className={styles.slotName}>Cape</span>
                                        </div>
                                        
                                        {equippedItems.cape ? (
                                            <div 
                                                className={styles.equippedItem}
                                                style={{ 
                                                    borderColor: getRarityBorder(equippedItems.cape.rarity),
                                                    color: getRarityColor(equippedItems.cape.rarity)
                                                }}
                                            >
                                                <Typography variant="body2" className={styles.itemName}>
                                                    {equippedItems.cape.name}
                                                </Typography>
                                                <Typography variant="caption" className={styles.itemRarity}>
                                                    {equippedItems.cape.rarity.toUpperCase()}
                                                </Typography>
                                                {equippedItems.cape.stats && (
                                                    <div className={styles.itemStats}>
                                                        {Object.entries(equippedItems.cape.stats).map(([stat, value]) => (
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

                                    <div 
                                        className={`${styles.equipmentSlot} ${selectedSlot === 'ring' ? styles.selected : ''}`}
                                        onClick={() => setSelectedSlot('ring')}
                                    >
                                        <div className={styles.slotHeader}>
                                            <img src={EQUIPMENT_SLOTS.ring.icon} alt="Ring" className={styles.slotIcon} />
                                            <span className={styles.slotName}>Ring</span>
                                        </div>
                                        
                                        {equippedItems.ring ? (
                                            <div 
                                                className={styles.equippedItem}
                                                style={{ 
                                                    borderColor: getRarityBorder(equippedItems.ring.rarity),
                                                    color: getRarityColor(equippedItems.ring.rarity)
                                                }}
                                            >
                                                <Typography variant="body2" className={styles.itemName}>
                                                    {equippedItems.ring.name}
                                                </Typography>
                                                <Typography variant="caption" className={styles.itemRarity}>
                                                    {equippedItems.ring.rarity.toUpperCase()}
                                                </Typography>
                                                {equippedItems.ring.stats && (
                                                    <div className={styles.itemStats}>
                                                        {Object.entries(equippedItems.ring.stats).map(([stat, value]) => (
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

                                    <div 
                                        className={`${styles.equipmentSlot} ${selectedSlot === 'amulet' ? styles.selected : ''}`}
                                        onClick={() => setSelectedSlot('amulet')}
                                    >
                                        <div className={styles.slotHeader}>
                                            <img src={EQUIPMENT_SLOTS.amulet.icon} alt="Amulet" className={styles.slotIcon} />
                                            <span className={styles.slotName}>Amulet</span>
                                        </div>
                                        
                                        {equippedItems.amulet ? (
                                            <div 
                                                className={styles.equippedItem}
                                                style={{ 
                                                    borderColor: getRarityBorder(equippedItems.amulet.rarity),
                                                    color: getRarityColor(equippedItems.amulet.rarity)
                                                }}
                                            >
                                                <Typography variant="body2" className={styles.itemName}>
                                                    {equippedItems.amulet.name}
                                                </Typography>
                                                <Typography variant="caption" className={styles.itemRarity}>
                                                    {equippedItems.amulet.rarity.toUpperCase()}
                                                </Typography>
                                                {equippedItems.amulet.stats && (
                                                    <div className={styles.itemStats}>
                                                        {Object.entries(equippedItems.amulet.stats).map(([stat, value]) => (
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
                                </div>
                            </div>
                        </div>
                    </Paper>
                </Grid>

                {/* Stats Panel */}
                <Grid item xs={12} md={4}>
                    <Paper className={styles.statsPanel}>
                        <Typography variant="h6" className={styles.sectionTitle}>
                            Equipment Stats
                        </Typography>
                        <Divider className={styles.divider} />
                        
                        <div className={styles.statsList}>
                            <div className={styles.statItem}>
                                <span className={styles.statIcon}>⚔️</span>
                                <span className={styles.statName}>Attack:</span>
                                <span className={styles.statValue}>+{totalStats.ATK}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statIcon}>🛡️</span>
                                <span className={styles.statName}>Defense:</span>
                                <span className={styles.statValue}>+{totalStats.DEF}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statIcon}>❤️</span>
                                <span className={styles.statName}>Health:</span>
                                <span className={styles.statValue}>+{totalStats.HP}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statIcon}>🎯</span>
                                <span className={styles.statName}>Crit Chance:</span>
                                <span className={styles.statValue}>+{totalStats.CRIT_CHANCE}%</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statIcon}>💥</span>
                                <span className={styles.statName}>Crit Damage:</span>
                                <span className={styles.statValue}>+{totalStats.CRIT_DAMAGE}%</span>
                            </div>
                        </div>

                        <Divider className={styles.divider} />
                        
                        <Typography variant="body2" className={styles.totalItems}>
                            Equipped Items: {Object.values(equippedItems).filter(item => item !== null).length}/10
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

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
                            <div 
                                key={item.id} 
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
                        ))
                    ) : (
                        <Typography variant="body2" color="text.secondary" className={styles.noItems}>
                            {selectedSlot && EQUIPMENT_SLOTS[selectedSlot] ? `No ${EQUIPMENT_SLOTS[selectedSlot].name} items in inventory` : 'No items in inventory'}
                        </Typography>
                    )}
                </div>
            </Paper>

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