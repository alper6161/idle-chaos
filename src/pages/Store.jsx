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
    Alert
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
    Whatshot
} from "@mui/icons-material";
import { useTranslate } from "../hooks/useTranslate";
import { getGold, setGold } from "../utils/gold";
import styles from "../assets/styles/Store.module.scss";

const STORE_ITEMS = [
    {
        id: 'rare_drop_boost',
        name: 'Rare Drop Boost',
        nameKey: 'store.rareDropBoost',
        description: 'Increases rare item drop chance by 50%',
        descriptionKey: 'store.rareDropBoostDesc',
        icon: Diamond,
        price: 500,
        duration: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
        color: '#9c27b0',
        type: 'drop_rate'
    },
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

function Store() {
    const { t } = useTranslate();
    const [playerGold, setPlayerGold] = useState(getGold());
    const [activeBuffs, setActiveBuffs] = useState({});
    const [purchaseDialog, setPurchaseDialog] = useState({ open: false, item: null });
    const [message, setMessage] = useState({ show: false, text: '', type: 'success' });

    // Load active buffs from localStorage on component mount
    useEffect(() => {
        const savedBuffs = localStorage.getItem('activeBuffs');
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
            localStorage.setItem('activeBuffs', JSON.stringify(validBuffs));
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
                    localStorage.setItem('activeBuffs', JSON.stringify(updated));
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

        // Check if buff is already active
        if (activeBuffs[item.id]) {
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
        
        // Add buff
        const newBuff = {
            id: item.id,
            name: item.name,
            expiresAt: Date.now() + item.duration,
            type: item.type,
            color: item.color
        };
        
        const updatedBuffs = { ...activeBuffs, [item.id]: newBuff };
        setActiveBuffs(updatedBuffs);
        localStorage.setItem('activeBuffs', JSON.stringify(updatedBuffs));
        
        setPurchaseDialog({ open: false, item: null });
        setMessage({ show: true, text: t('store.purchaseSuccess'), type: 'success' });
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

            {/* Active Buffs */}
            {Object.keys(activeBuffs).length > 0 && (
                <Paper className={styles.activeBuffsPanel}>
                    <Typography variant="h6" className={styles.sectionTitle}>
                        {t('store.activeBuffs')}
                    </Typography>
                    <div className={styles.activeBuffsGrid}>
                        {Object.entries(activeBuffs).map(([key, buff]) => {
                            const item = STORE_ITEMS.find(i => i.id === key);
                            return (
                                <div key={key} className={styles.activeBuff}>
                                    <div className={styles.buffIcon} style={{ color: buff.color }}>
                                        <item.icon />
                                    </div>
                                    <div className={styles.buffInfo}>
                                        <Typography variant="body2" className={styles.buffName}>
                                            {t(item.nameKey)}
                                        </Typography>
                                        <Typography variant="caption" className={styles.buffTime}>
                                            {formatTimeRemaining(buff.expiresAt)}
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={getProgressValue(buff.expiresAt, item.duration)}
                                            className={styles.buffProgress}
                                            sx={{ 
                                                '& .MuiLinearProgress-bar': { 
                                                    backgroundColor: buff.color 
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Paper>
            )}

            {/* Store Items */}
            <div className={styles.storeGrid}>
                {STORE_ITEMS.map((item) => {
                    const isActive = activeBuffs[item.id];
                    const canAfford = playerGold >= item.price;
                    const Icon = item.icon;
                    
                    return (
                        <Card key={item.id} className={styles.storeItem}>
                            <CardContent className={styles.itemContent}>
                                <div className={styles.itemHeader}>
                                    <div 
                                        className={styles.itemIcon}
                                        style={{ 
                                            backgroundColor: `${item.color}20`,
                                            border: `2px solid ${item.color}`,
                                            color: item.color
                                        }}
                                    >
                                        <Icon />
                                    </div>
                                    <Typography variant="h6" className={styles.itemName}>
                                        {t(item.nameKey)}
                                    </Typography>
                                </div>
                                
                                <Typography variant="body2" className={styles.itemDescription}>
                                    {t(item.descriptionKey)}
                                </Typography>
                                
                                <div className={styles.itemDetails}>
                                    <Chip 
                                        label={`${item.duration / (60 * 60 * 1000)}h`}
                                        icon={<Schedule />}
                                        size="small"
                                        className={styles.durationChip}
                                    />
                                    <div className={styles.priceSection}>
                                        <Typography variant="h6" className={styles.price}>
                                            💰 {item.price.toLocaleString()}
                                        </Typography>
                                    </div>
                                </div>
                            </CardContent>
                            
                            <CardActions className={styles.itemActions}>
                                <Button
                                    variant="contained"
                                    onClick={() => handlePurchase(item)}
                                    disabled={!canAfford || isActive}
                                    className={styles.purchaseButton}
                                    style={{
                                        backgroundColor: canAfford && !isActive ? item.color : undefined,
                                        opacity: isActive ? 0.6 : 1
                                    }}
                                >
                                    {isActive ? t('store.active') : 
                                     !canAfford ? t('store.notEnoughGold') : 
                                     t('store.purchase')}
                                </Button>
                            </CardActions>
                        </Card>
                    );
                })}
            </div>

            {/* Purchase Confirmation Dialog */}
            <Dialog 
                open={purchaseDialog.open} 
                onClose={() => setPurchaseDialog({ open: false, item: null })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle className={styles.dialogTitle}>
                    {t('store.confirmPurchase')}
                </DialogTitle>
                <DialogContent>
                    {purchaseDialog.item && (
                        <div className={styles.confirmationContent}>
                            <Typography variant="body1" gutterBottom>
                                {t('store.purchaseConfirmation', { 
                                    item: t(purchaseDialog.item.nameKey),
                                    price: purchaseDialog.item.price 
                                })}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t('store.remainingGold', { 
                                    gold: (playerGold - purchaseDialog.item.price).toLocaleString() 
                                })}
                            </Typography>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPurchaseDialog({ open: false, item: null })}>
                        {t('common.cancel')}
                    </Button>
                    <Button 
                        onClick={confirmPurchase}
                        variant="contained"
                        color="primary"
                    >
                        {t('store.confirm')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Message Alert */}
            {message.show && (
                <Alert 
                    severity={message.type}
                    onClose={() => setMessage({ show: false, text: '', type: 'success' })}
                    className={styles.messageAlert}
                >
                    {message.text}
                </Alert>
            )}
        </div>
    );
}

export default Store; 