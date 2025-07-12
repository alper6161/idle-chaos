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
    weapon: { name: "Legendary Dragonslayer", rarity: "legendary", stats: { ATK: 25, CRIT_CHANCE: 15, CRIT_DAMAGE: 30 } },
    shield: { name: "Aegis of Valor", rarity: "epic", stats: { DEF: 18, HP: 50, BLOCK_CHANCE: 20 } },
    helmet: { name: "Crown of Wisdom", rarity: "rare", stats: { DEF: 12, HP: 30, CRIT_CHANCE: 8 } },
    chest: null,
    legs: null,
    boots: null,
    gloves: null,
    cape: null,
    ring: null,
    amulet: null
};

const SAMPLE_INVENTORY = [
    { id: 1, name: "Excalibur", type: "weapon", rarity: "legendary", stats: { ATK: 30, CRIT_CHANCE: 20, CRIT_DAMAGE: 40, HP: 25 } },
    { id: 2, name: "Shadowbane", type: "weapon", rarity: "legendary", stats: { ATK: 28, CRIT_CHANCE: 25, DODGE: 15 } },
    { id: 3, name: "Frostmourne", type: "weapon", rarity: "legendary", stats: { ATK: 32, CRIT_DAMAGE: 50, FREEZE_CHANCE: 30 } },
    
    { id: 4, name: "Dragon Blade", type: "weapon", rarity: "epic", stats: { ATK: 22, CRIT_DAMAGE: 25, FIRE_DAMAGE: 10 } },
    { id: 5, name: "Thunder Strike", type: "weapon", rarity: "epic", stats: { ATK: 20, CRIT_CHANCE: 15, LIGHTNING_DAMAGE: 8 } },
    
    { id: 6, name: "Bloodthirsty Axe", type: "weapon", rarity: "rare", stats: { ATK: 18, LIFE_STEAL: 15, CRIT_CHANCE: 10 } },
    { id: 7, name: "Mage's Staff", type: "weapon", rarity: "rare", stats: { ATK: 15, CRIT_CHANCE: 12, MANA_REGEN: 5 } },
    
    { id: 8, name: "Dragonscale Armor", type: "chest", rarity: "legendary", stats: { DEF: 35, HP: 80, FIRE_RESISTANCE: 40 } },
    { id: 9, name: "Ethereal Robes", type: "chest", rarity: "legendary", stats: { DEF: 25, HP: 60, CRIT_CHANCE: 20, MANA_REGEN: 10 } },
    
    { id: 10, name: "Plate of the Titan", type: "chest", rarity: "epic", stats: { DEF: 28, HP: 70, BLOCK_CHANCE: 25 } },
    { id: 11, name: "Shadowweave Vest", type: "chest", rarity: "epic", stats: { DEF: 22, HP: 50, DODGE: 20, CRIT_CHANCE: 12 } },
    
    { id: 12, name: "Ring of Power", type: "ring", rarity: "legendary", stats: { ATK: 15, CRIT_CHANCE: 25, CRIT_DAMAGE: 35 } },
    { id: 13, name: "Amulet of Eternity", type: "amulet", rarity: "legendary", stats: { HP: 100, LIFE_STEAL: 20, REGEN: 5 } },
    
    { id: 14, name: "Ruby Ring", type: "ring", rarity: "epic", stats: { ATK: 12, CRIT_CHANCE: 18, FIRE_DAMAGE: 8 } },
    { id: 15, name: "Sapphire Amulet", type: "amulet", rarity: "epic", stats: { HP: 60, CRIT_CHANCE: 15, ICE_DAMAGE: 6 } },
    
    { id: 16, name: "Boots of Speed", type: "boots", rarity: "rare", stats: { DEF: 8, DODGE: 25, MOVEMENT_SPEED: 15 } },
    { id: 17, name: "Gloves of Precision", type: "gloves", rarity: "rare", stats: { DEF: 6, CRIT_CHANCE: 20, ACCURACY: 15 } },
    { id: 18, name: "Cape of Shadows", type: "cape", rarity: "epic", stats: { DEF: 12, DODGE: 30, STEALTH: 20 } },
    { id: 19, name: "Helmet of the Berserker", type: "helmet", rarity: "epic", stats: { DEF: 15, ATK: 8, RAGE: 25 } },
    { id: 20, name: "Leggings of Fortitude", type: "legs", rarity: "rare", stats: { DEF: 12, HP: 40, ENDURANCE: 20 } }
];

const STORAGE_KEYS = {
    EQUIPPED_ITEMS: 'idle-chaos-equipped-items',
    INVENTORY: 'idle-chaos-inventory'
};

const loadFromStorage = (key, defaultValue) => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
        console.error(`Error loading ${key} from localStorage:`, error);
        return defaultValue;
    }
};

const saveToStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
    }
};

function Equipment() {
    const { t } = useTranslate();
    const [equippedItems, setEquippedItems] = useState(() => 
        loadFromStorage(STORAGE_KEYS.EQUIPPED_ITEMS, SAMPLE_EQUIPMENT)
    );
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [inventory, setInventory] = useState(() => 
        loadFromStorage(STORAGE_KEYS.INVENTORY, SAMPLE_INVENTORY)
    );
    const [rarityFilter, setRarityFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [replaceDialog, setReplaceDialog] = useState({
        open: false,
        currentItem: null,
        newItem: null,
        slot: null
    });

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.EQUIPPED_ITEMS, equippedItems);
    }, [equippedItems]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.INVENTORY, inventory);
    }, [inventory]);

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

    const getRarityColor = (rarity) => {
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
        if (!selectedSlot || !equippedItems[selectedSlot]) {
            return (
                <div className={styles.tooltipContent}>
                    <div className={styles.tooltipHeader}>
                        <Typography variant="body2" className={styles.tooltipTitle}>
                            {inventoryItem.name}
                        </Typography>
                        <Typography variant="caption" className={styles.tooltipRarity}>
                            {inventoryItem.rarity.toUpperCase()}
                        </Typography>
                    </div>
                    <div className={styles.tooltipStats}>
                        {Object.entries(inventoryItem.stats || {}).map(([stat, value]) => (
                            <div key={stat} className={styles.tooltipStat}>
                                <span>+{value} {stat}</span>
                            </div>
                        ))}
                    </div>
                    <div className={styles.tooltipFooter}>
                        <Typography variant="caption">Click to equip</Typography>
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
                        {inventoryItem.rarity.toUpperCase()}
                    </Typography>
                </div>
                <div className={styles.tooltipComparison}>
                    <Typography variant="caption" className={styles.comparisonTitle}>
                        vs {currentItem.name}
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
                    <Typography variant="caption">Click to equip</Typography>
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
                    <Typography variant="body2" sx={{ color: getRarityColor(item.rarity), fontWeight: 'bold', mb: 1 }}>
                        {item.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: getRarityColor(item.rarity), textTransform: 'uppercase', display: 'block', mb: 1 }}>
                        {item.rarity}
                    </Typography>
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
                                <Typography 
                                    variant="caption" 
                                    className={styles.itemRarity}
                                    style={{ color: getRarityColor(equippedItem.rarity) }}
                                >
                                    {equippedItem.rarity.toUpperCase()}
                                </Typography>
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
                        <Typography variant="h4" className={styles.pageTitle}>
                            {t('common.equipmentForge')}
                        </Typography>
                        <Typography variant="subtitle1" className={styles.subtitle}>
                            {t('common.craftLegend')}
                        </Typography>
                    </div>
                    <div className={styles.powerSection}>
                        <div className={styles.powerBadge}>
                            <LocalFireDepartment className={styles.powerIcon} />
                            <div className={styles.powerInfo}>
                                <Typography variant="h6" className={styles.powerLevel}>
                                    {powerLevel}
                                </Typography>
                                <Typography variant="caption" className={styles.powerLabel}>
                                    {t('common.powerLevel')}
                                </Typography>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Panel - Moved to top */}
            <Paper className={styles.statsPanel}>
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
                            <FilterList className={styles.panelIcon} />
                            <Typography variant="h6" className={styles.panelTitle}>
                                Inventory Arsenal
                            </Typography>
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
                                    <strong>Selected:</strong> {EQUIPMENT_SLOTS[selectedSlot]?.name}
                                </Typography>
                                <div className={styles.slotActions}>
                                    <Button 
                                        variant="outlined" 
                                        size="small" 
                                        onClick={handleUnselectSlot}
                                        className={styles.unselectButton}
                                    >
                                        Unselect
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
                                        >
                                            <div className={styles.itemGlow} style={{
                                                backgroundColor: `${getRarityColor(item.rarity)}20`,
                                                boxShadow: `0 0 20px ${getRarityColor(item.rarity)}40`
                                            }}></div>
                                            <div 
                                                className={styles.itemContent}
                                                style={{ 
                                                    borderColor: getRarityBorder(item.rarity),
                                                    boxShadow: `0 0 10px ${getRarityColor(item.rarity)}30`
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
                                                <Typography 
                                                    variant="caption" 
                                                    className={styles.itemRarity}
                                                    style={{ color: getRarityColor(item.rarity) }}
                                                >
                                                    {item.rarity.toUpperCase()}
                                                </Typography>
                                                {item.stats && (
                                                    <div className={styles.itemStats}>
                                                        {Object.entries(item.stats).slice(0, 3).map(([stat, value]) => (
                                                            <Typography key={stat} variant="caption" className={styles.statLine}>
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
                                        No items found matching your criteria
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
                    <Typography variant="h6">{t('equipment.replace')}</Typography>
                </DialogTitle>
                <DialogContent className={styles.dialogContent}>
                    <div className={styles.replaceComparison}>
                        <div className={styles.currentItem}>
                            <Typography variant="h6" className={styles.dialogSectionTitle}>
                                Current Equipment
                            </Typography>
                            {replaceDialog.currentItem && (
                                <div 
                                    className={styles.dialogItem}
                                    style={{ 
                                        borderColor: getRarityBorder(replaceDialog.currentItem.rarity),
                                        boxShadow: `0 0 10px ${getRarityColor(replaceDialog.currentItem.rarity)}40`
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
                                        style={{ color: getRarityColor(replaceDialog.currentItem.rarity) }}
                                    >
                                        {replaceDialog.currentItem.rarity.toUpperCase()}
                                    </Typography>
                                    {replaceDialog.currentItem.stats && (
                                        <div className={styles.dialogItemStats}>
                                            {Object.entries(replaceDialog.currentItem.stats).map(([stat, value]) => (
                                                <Typography key={stat} variant="caption" className={styles.dialogStatLine}>
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
                                New Equipment
                            </Typography>
                            {replaceDialog.newItem && (
                                <div 
                                    className={styles.dialogItem}
                                    style={{ 
                                        borderColor: getRarityBorder(replaceDialog.newItem.rarity),
                                        boxShadow: `0 0 10px ${getRarityColor(replaceDialog.newItem.rarity)}40`
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
                                        style={{ color: getRarityColor(replaceDialog.newItem.rarity) }}
                                    >
                                        {replaceDialog.newItem.rarity.toUpperCase()}
                                    </Typography>
                                    {replaceDialog.newItem.stats && (
                                        <div className={styles.dialogItemStats}>
                                            {Object.entries(replaceDialog.newItem.stats).map(([stat, value]) => (
                                                <Typography key={stat} variant="caption" className={styles.dialogStatLine}>
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
        </div>
    );
}

export default Equipment; 