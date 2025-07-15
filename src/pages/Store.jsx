import { useState, useEffect } from "react";
import {
    Typography,
    Paper,
    Button,
    Box,
    Card,
    CardContent,
    CardActions,
    Chip,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Tabs,
    Tab
} from "@mui/material";
import { 
    ShoppingCart, 
    TrendingUp, 
    Star, 
    Schedule, 
    LocalFireDepartment,
    Diamond,
    Speed,
    AttachMoney,
    EmojiEvents,
    Whatshot,
    LocalDrink
} from "@mui/icons-material";
import { useTranslate } from "../hooks/useTranslate";
import { getGold, setGold } from "../utils/gold";

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
import { POTION_TYPES, addPotions, getPotions } from "../utils/potions.js";
import styles from "../assets/styles/Store.module.scss";

const STORE_ITEMS = [
    {
        id: 'exp_boost',
        name: 'Experience Boost',
        nameKey: 'store.expBoost',
        description: 'Increases all skill experience gain by 100%',
        descriptionKey: 'store.expBoostDesc',
        icon: TrendingUp,
        price: 750,
        duration: 2 * 60 * 60 * 1000, // 2 hours
        color: '#2196f3',
        type: 'experience'
    },
    {
        id: 'gold_boost',
        name: 'Gold Rush',
        nameKey: 'store.goldRush',
        description: 'Increases gold drops by 200%',
        descriptionKey: 'store.goldRushDesc',
        icon: AttachMoney,
        price: 300,
        duration: 1 * 60 * 60 * 1000, // 1 hour
        color: '#ff9800',
        type: 'gold'
    },
    {
        id: 'damage_boost',
        name: 'Power Surge',
        nameKey: 'store.powerSurge',
        description: 'Increases damage by 50%',
        descriptionKey: 'store.powerSurgeDesc',
        icon: Whatshot,
        price: 400,
        duration: 1.5 * 60 * 60 * 1000, // 1.5 hours
        color: '#f44336',
        type: 'damage'
    },
    {
        id: 'crit_boost',
        name: 'Lucky Strike',
        nameKey: 'store.luckyStrike',
        description: 'Increases critical hit chance by 25%',
        descriptionKey: 'store.luckyStrikeDesc',
        icon: EmojiEvents,
        price: 600,
        duration: 2 * 60 * 60 * 1000, // 2 hours
        color: '#4caf50',
        type: 'critical'
    },
    {
        id: 'speed_boost',
        name: 'Lightning Speed',
        nameKey: 'store.lightningSpeed',
        description: 'Increases attack speed by 30%',
        descriptionKey: 'store.lightningSpeedDesc',
        icon: Speed,
        price: 450,
        duration: 1.5 * 60 * 60 * 1000, // 1.5 hours
        color: '#00bcd4',
        type: 'speed'
    }
];

// Auto Potion Buff
const AUTO_POTION_BUFF = {
    id: 'auto_potion',
    name: 'Auto Potion',
    nameKey: 'store.autoPotion',
    description: 'Automatically uses potions when HP drops below 40%',
    descriptionKey: 'store.autoPotionDesc',
    icon: LocalDrink,
    price: 1000,
    duration: 24 * 60 * 60 * 1000, // 24 hours
    color: '#4ade80',
    type: 'auto_potion'
};

function Store() {
    const { t } = useTranslate();
    const [playerGold, setPlayerGold] = useState(getGold());
    const [activeBuffs, setActiveBuffs] = useState({});
    const [purchaseDialog, setPurchaseDialog] = useState({ open: false, item: null });
    const [message, setMessage] = useState({ show: false, text: '', type: 'success' });
    const [currentTab, setCurrentTab] = useState(0);
    const [playerPotions, setPlayerPotions] = useState(getPotions());

    // Load active buffs from localStorage on component mount
    useEffect(() => {
        const currentSlot = getCurrentSlot();
        const slotKey = getSlotKey('activeBuffs', currentSlot);
        const savedBuffs = localStorage.getItem(slotKey);
        if (savedBuffs) {
            const buffs = JSON.parse(savedBuffs);
            // Filter out expired buffs
            const validBuffs = {};
            Object.entries(buffs).forEach(([key, buff]) => {
                if (buff.expiresAt > Date.now()) {
                    validBuffs[key] = buff;
                }
            });
            setActiveBuffs(validBuffs);
            localStorage.setItem(slotKey, JSON.stringify(validBuffs));
        }
    }, []);

    // Update gold periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setPlayerGold(getGold());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Update active buffs countdown
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveBuffs(prev => {
                const updated = { ...prev };
                let hasChanges = false;
                
                Object.entries(updated).forEach(([key, buff]) => {
                    if (buff.expiresAt <= Date.now()) {
                        delete updated[key];
                        hasChanges = true;
                    }
                });
                
                if (hasChanges) {
                    const currentSlot = getCurrentSlot();
                    const slotKey = getSlotKey('activeBuffs', currentSlot);
                    localStorage.setItem(slotKey, JSON.stringify(updated));
                }
                
                return updated;
            });
        }, 1000);
        
        return () => clearInterval(interval);
    }, []);

    const handlePurchase = (item) => {
        if (playerGold < item.price) {
            setMessage({ show: true, text: t('store.notEnoughGold'), type: 'error' });
            return;
        }

        // Check if buff is already active (only for buffs, not potions)
        if (item.type !== 'potion' && activeBuffs[item.id]) {
            setMessage({ show: true, text: t('store.buffAlreadyActive'), type: 'warning' });
            return;
        }

        setPurchaseDialog({ open: true, item });
    };

    const confirmPurchase = () => {
        const item = purchaseDialog.item;
        const newGold = playerGold - item.price;
        
        // Update gold
        setGold(newGold);
        setPlayerGold(newGold);
        
        if (item.type === 'potion') {
            // Handle potion purchase
            const potionType = item.potionType;
            const newPotions = addPotions(potionType, item.quantity);
            setPlayerPotions(newPotions);
            
            setMessage({ 
                show: true, 
                text: `Purchased ${item.quantity}x ${item.name}!`, 
                type: 'success' 
            });
        } else {
            // Handle buff purchase
            const newBuff = {
                id: item.id,
                name: item.name,
                expiresAt: Date.now() + item.duration,
                type: item.type,
                color: item.color
            };
            
            const updatedBuffs = { ...activeBuffs, [item.id]: newBuff };
            setActiveBuffs(updatedBuffs);
            const currentSlot = getCurrentSlot();
            const slotKey = getSlotKey('activeBuffs', currentSlot);
            localStorage.setItem(slotKey, JSON.stringify(updatedBuffs));
            
            setMessage({ 
                show: true, 
                text: t('store.buffActivated'), 
                type: 'success' 
            });
        }
        
        setPurchaseDialog({ open: false, item: null });
        
        setTimeout(() => {
            setMessage({ show: false, text: '', type: 'success' });
        }, 3000);
    };

    const handlePotionPurchase = (potionType, quantity = 1) => {
        const potion = POTION_TYPES[potionType.toUpperCase()];
        const totalPrice = potion.price * quantity;
        
        if (playerGold < totalPrice) {
            setMessage({ show: true, text: t('store.notEnoughGold'), type: 'error' });
            return;
        }
        
        const newGold = playerGold - totalPrice;
        setGold(newGold);
        setPlayerGold(newGold);
        
        const newPotions = addPotions(potionType, quantity);
        setPlayerPotions(newPotions);
        
        setMessage({ 
            show: true, 
            text: `Purchased ${quantity}x ${potion.name}!`, 
            type: 'success' 
        });
        
        setTimeout(() => {
            setMessage({ show: false, text: '', type: 'success' });
        }, 3000);
    };

    const formatTimeRemaining = (expiresAt) => {
        const remaining = Math.max(0, expiresAt - Date.now());
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getProgressValue = (expiresAt, duration) => {
        const remaining = Math.max(0, expiresAt - Date.now());
        return (remaining / duration) * 100;
    };

    const formatGold = (amount) => {
        return `💰 ${amount.toLocaleString()}`;
    };

    return (
        <div className={styles.storeContainer}>
            {/* Background Effects */}
            <div className={styles.backgroundAnimation}>
                <div className={styles.floatingCoins}>
                    {[...Array(15)].map((_, i) => (
                        <div 
                            key={i} 
                            className={styles.coin}
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${5 + Math.random() * 3}s`
                            }}
                        >
                            💰
                        </div>
                    ))}
                </div>
            </div>

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.titleSection}>
                        <ShoppingCart className={styles.titleIcon} />
                        <Typography variant="h4" className={styles.pageTitle}>
                            {t('store.magicShop')}
                        </Typography>
                        <Typography variant="subtitle1" className={styles.subtitle}>
                            {t('store.enhanceYourJourney')}
                        </Typography>
                    </div>
                    <div className={styles.goldDisplay}>
                        <div className={styles.goldBadge}>
                            <span className={styles.goldIcon}>💰</span>
                            <Typography variant="h6" className={styles.goldAmount}>
                                {playerGold.toLocaleString()}
                            </Typography>
                        </div>
                    </div>
                </div>
            </div>

            <Typography variant="h4" className={styles.storeTitle}>
                {t('store.title')}
            </Typography>
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs 
                    value={currentTab} 
                    onChange={(e, newValue) => setCurrentTab(newValue)}
                    className={styles.storeTabs}
                >
                    <Tab label={t('store.buffs')} />
                    <Tab label={t('store.potions')} />
                </Tabs>
            </Box>

            {currentTab === 0 && (
                <div className={styles.buffsSection}>
                    <Typography variant="h6" className={styles.sectionTitle}>
                        {t('store.buffs')}
                    </Typography>
                    
                    <div className={styles.itemsGrid}>
                        {[...STORE_ITEMS, AUTO_POTION_BUFF].map((item) => (
                            <Card key={item.id} className={styles.storeItem}>
                                <CardContent className={styles.itemContent}>
                                    <div className={styles.itemHeader}>
                                        <item.icon className={styles.itemIcon} style={{ color: item.color }} />
                                        <Typography variant="h6" className={styles.itemName}>
                                            {t(item.nameKey) || item.name}
                                        </Typography>
                                    </div>
                                    <Typography variant="body2" className={styles.itemDescription}>
                                        {t(item.descriptionKey) || item.description}
                                    </Typography>
                                    <div className={styles.itemPrice}>
                                        <Typography variant="h6" className={styles.priceText}>
                                            {formatGold(item.price)}
                                        </Typography>
                                    </div>
                                </CardContent>
                                <CardActions className={styles.itemActions}>
                                    <Button
                                        variant="contained"
                                        onClick={() => handlePurchase(item)}
                                        disabled={activeBuffs[item.id]}
                                        className={styles.purchaseButton}
                                    >
                                        {activeBuffs[item.id] ? t('store.active') : t('store.purchase')}
                                    </Button>
                                </CardActions>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {currentTab === 1 && (
                <div className={styles.potionsSection}>
                    <Typography variant="h6" className={styles.sectionTitle}>
                        {t('store.potions')}
                    </Typography>
                    
                    <div className={styles.potionsGrid}>
                        {Object.entries(POTION_TYPES).map(([key, potion]) => {
                            const count = playerPotions[potion.id] || 0;
                            
                            return (
                                <Card key={potion.id} className={styles.potionItem}>
                                    <CardContent className={styles.potionContent}>
                                        <div className={styles.potionHeader}>
                                            <LocalDrink className={styles.potionIcon} style={{ color: potion.color }} />
                                            <Typography variant="h6" className={styles.potionName}>
                                                {t(`potions.${potion.id}HealthPotion`) || potion.name}
                                            </Typography>
                                        </div>
                                        <Typography variant="body2" className={styles.potionDescription}>
                                            {t('potions.restoresHp', { amount: potion.healAmount })}
                                        </Typography>
                                        <div className={styles.potionStats}>
                                            <Typography variant="body2" className={styles.potionHeal}>
                                                +{potion.healAmount} HP
                                            </Typography>
                                            <Typography variant="body2" className={styles.potionCount}>
                                                {t('potions.owned', { count })}
                                            </Typography>
                                        </div>
                                        <div className={styles.potionPrice}>
                                            <Typography variant="h6" className={styles.priceText}>
                                                {formatGold(potion.price)}
                                            </Typography>
                                        </div>
                                    </CardContent>
                                    <CardActions className={styles.potionActions}>
                                        <Button
                                            variant="contained"
                                            onClick={() => handlePotionPurchase(potion.id, 1)}
                                            className={styles.purchaseButton}
                                            size="small"
                                        >
                                            {t('potions.buy1')}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={() => handlePotionPurchase(potion.id, 5)}
                                            className={styles.purchaseButton}
                                            size="small"
                                        >
                                            {t('potions.buy5')}
                                        </Button>
                                    </CardActions>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Active Buffs Display */}
            {Object.keys(activeBuffs).length > 0 && (
                <div className={styles.activeBuffsSection}>
                    <Typography variant="h6" className={styles.sectionTitle}>
                        {t('store.activeBuffs')}
                    </Typography>
                    <div className={styles.activeBuffsGrid}>
                        {Object.entries(activeBuffs).map(([buffId, buff]) => (
                            <Card key={buffId} className={styles.activeBuffCard}>
                                <CardContent className={styles.activeBuffContent}>
                                    <div className={styles.activeBuffHeader}>
                                        <Typography variant="h6" className={styles.activeBuffName}>
                                            {buff.name}
                                        </Typography>
                                        <Chip 
                                            label={formatTimeRemaining(buff.expiresAt)} 
                                            color="primary" 
                                            size="small"
                                        />
                                    </div>
                                    <LinearProgress
                                        variant="determinate"
                                        value={getProgressValue(buff.expiresAt, STORE_ITEMS.find(item => item.id === buffId)?.duration || 3600000)}
                                        className={styles.buffProgress}
                                    />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Purchase Dialog */}
            <Dialog 
                open={purchaseDialog.open} 
                onClose={() => setPurchaseDialog({ open: false, item: null })}
                className={styles.purchaseDialog}
                PaperProps={{
                    style: {
                        background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
                        border: '2px solid #4a4a6a',
                        borderRadius: '12px',
                        color: '#e0e0e0',
                        backdropFilter: 'blur(10px)'
                    }
                }}
            >
                <DialogTitle>{t('store.confirmPurchase')}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {purchaseDialog.item && (
                            purchaseDialog.item.type === 'potion' 
                                ? `${t('store.purchase')} ${purchaseDialog.item.quantity}x ${purchaseDialog.item.name} ${t('store.for')} ${formatGold(purchaseDialog.item.price)}?`
                                : `${t('store.purchase')} ${purchaseDialog.item.name} ${t('store.for')} ${formatGold(purchaseDialog.item.price)}?`
                        )}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPurchaseDialog({ open: false, item: null })}>
                        {t('store.cancel')}
                    </Button>
                    <Button onClick={confirmPurchase} variant="contained">
                        {t('store.confirm')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Message Alert */}
            {message.show && (
                <Alert 
                    severity={message.type} 
                    className={styles.messageAlert}
                    onClose={() => setMessage({ show: false, text: '', type: 'success' })}
                >
                    {message.text}
                </Alert>
            )}
        </div>
    );
}

export default Store; 