import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../assets/styles/Battle.module.scss";
import {
    Typography,
    LinearProgress,
    Avatar,
    Divider,
    Button,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Card,
    CardContent,
    CardActionArea,
    Tooltip,
    Grid,
    IconButton,
    Chip,
} from "@mui/material";
import { LocalDrink } from "@mui/icons-material";
import { getLootDrop, saveLoot } from "../utils/combat.js";
import enemies from "../utils/enemies.js";
import { getEnemyIcon, getSkillIcon, getCharacterIcon, getEnemyInitial, getCharacterName } from "../utils/common.js";
import { SKILL_LEVEL_BONUSES } from "../utils/constants.js";
import { 
    calculateHitChance, 
    calculateDamage, 
    calculateDamageRange,
    updateBattleState, 
    processPlayerAttack, 
    processEnemyAttack, 
    checkBattleResult, 
    createSpawnTimer,
    getDifficultyColor,
    getDifficultyText,
    getThresholdForStat,
    getStatDisplay,
    getEnemyHpDisplay,
    calculateItemSellValue,
    getSlotKey,
    getCurrentSlot
} from "../utils/battleUtils.js";
import { awardBattleActionXP, getWeaponType, getAvailableAttackTypes, getSkillData, initializeSkillDataForCurrentSlot } from "../utils/skillExperience.js";
import { getPlayerStats, getEquipmentBonuses, calculateSkillBuffs, calculateSkillBuffsForAttackType, getEquippedItems } from "../utils/playerStats.js";
import { getRandomEnemy } from "../utils/enemies.js";
import { getGold, addGold, subtractGold } from "../utils/gold.js";
import { 
    POTION_TYPES, 
    getPotions, 
    usePotion, 
    shouldUseAutoPotion,
    getAutoPotionSettings,
    saveAutoPotionSettings
} from "../utils/potions.js";
import { recordKill } from "../utils/achievements.js";
import { isAchievementUnlocked } from "../utils/achievements.js";
import { useTranslate } from "../hooks/useTranslate";
import { convertLootBagToEquipment } from "../utils/equipmentGenerator.js";
import { checkPetDrop, getPetByEnemy } from "../utils/pets.js";
import { saveCurrentGame } from "../utils/saveManager.js";
import { getEnemyById } from "../utils/enemies.js";
import { LOOT_BAG_LIMIT } from "../utils/constants.js";
import { useNotificationContext } from "../contexts/NotificationContext";
import { useBattleContext } from "../contexts/BattleContext";
import LootBag from "../components/LootBag";



function Battle({ player }) {
    const navigate = useNavigate();
    const [selectedCharacter, setSelectedCharacter] = useState('warrior');
    const [playerStats, setPlayerStats] = useState(getPlayerStats());
    const { t } = useTranslate();
    const { 
        notifyItemDrop, 
        notifyItemSale, 
        notifyBulkSale, 
        notifyChestOpened,
        notifyAchievement,
        notifyGoldGain
    } = useNotificationContext();

    // Use global battle context instead of local state
    const {
        isBattleActive,
        currentBattle,
        currentEnemy,
        selectedAttackType,
        isWaitingForEnemy,
        enemySpawnProgress,
        battleLog,
        damageDisplay,
        availableAttackTypes,
        lootBag,
        playerGold,
        potions,
        playerHealth,
        startBattle,
        stopBattle,
        setSelectedAttackType,
        startEnemySpawnTimer,
        spawnNewEnemy,
        setDamageDisplay,
        setCurrentBattle,
        setCurrentEnemy,
        setIsBattleActive,
        setBattleLog,
        handleUsePotion,
        addToLootBag,
        removeFromLootBag,
        clearLootBag,
        setLootBag,
        updatePlayerGold,
        subtractPlayerGold,
        setPlayerHealth,
        showDeathDialog,
        respawnPlayer,
        setDeathDialog,
        deathDialog,
        dungeonRun,
        setDungeonRun,
        setEnemiesData,
        setDungeonCompleteCallback
    } = useBattleContext();

    // Local UI state only
    const [autoPotionSettings, setAutoPotionSettings] = useState(getAutoPotionSettings());
    const [lastPotionUsed, setLastPotionUsed] = useState(null);
    const [battleResult, setBattleResult] = useState(null);
    // Death dialog is now managed in BattleContext
    const [battleLogVisible, setBattleLogVisible] = useState(true);
    const [exitWarningOpen, setExitWarningOpen] = useState(false);
    const [dungeonCompleteDialog, setDungeonCompleteDialog] = useState({ open: false, countdown: 5 });
    const [chestDropDialog, setChestDropDialog] = useState({ open: false, item: null, dungeon: null });
    const [chestPreviewModal, setChestPreviewModal] = useState({ open: false, dungeon: null, chestItem: null });

    // Battle page is now dedicated to actual battle only
    // Selection is handled in separate BattleSelection page

    // Set enemies data and callbacks for BattleContext
    useEffect(() => {
        setEnemiesData(enemies);
        setDungeonCompleteCallback(() => () => {
            setDungeonCompleteDialog({ open: true, countdown: 5 });
        });
    }, [setEnemiesData, setDungeonCompleteCallback]);



    // Take item from loot bag to inventory
    const handleTakeItem = (itemName, index) => {
        try {
            // Remove from loot bag
            removeFromLootBag(index);

            // Convert item to equipment and add to inventory
            const equipment = convertLootBagToEquipment([itemName]);
            if (equipment.length > 0) {
                const currentSlot = getCurrentSlot();
                const inventorySlotKey = getSlotKey('idle-chaos-inventory', currentSlot);
                const currentInventory = JSON.parse(localStorage.getItem(inventorySlotKey) || '[]');
                const updatedInventory = [...currentInventory, ...equipment];
                localStorage.setItem(inventorySlotKey, JSON.stringify(updatedInventory));
            }
        } catch (err) {
            console.error('Error taking item:', err);
        }
    };

    // Sell item directly for gold
    const handleSellItem = (itemName, index) => {
        const sellValue = calculateItemSellValue(itemName);
        
        try {
            // Remove from loot bag
            removeFromLootBag(index);

            // Add gold
            updatePlayerGold(sellValue);
            
            // Notify for item sale
            notifyItemSale(itemName, sellValue, '💰');
        } catch (err) {
            console.error('Error selling item:', err);
        }
    };

    // Take all items to inventory
    const handleTakeAll = () => {
        try {
            const itemsToConvert = [...lootBag];
            
            // Clear loot bag
            clearLootBag();

            // Convert all items to equipment and add to inventory
            const equipment = convertLootBagToEquipment(itemsToConvert);
            if (equipment.length > 0) {
                const currentSlot = getCurrentSlot();
                const inventorySlotKey = getSlotKey('idle-chaos-inventory', currentSlot);
                const currentInventory = JSON.parse(localStorage.getItem(inventorySlotKey) || '[]');
                const updatedInventory = [...currentInventory, ...equipment];
                localStorage.setItem(inventorySlotKey, JSON.stringify(updatedInventory));
            }
        } catch (err) {
            console.error('Error taking all items:', err);
        }
    };

    // Sell all items for gold
    const handleSellAll = () => {
        try {
            let totalGold = 0;
            const itemCount = lootBag.length;
            lootBag.forEach(itemName => {
                totalGold += calculateItemSellValue(itemName);
            });
            
            // Clear loot bag
            clearLootBag();

            // Add total gold
            updatePlayerGold(totalGold);
            
            // Notify for bulk sale
            if (itemCount > 0 && totalGold > 0) {
                notifyBulkSale(itemCount, totalGold);
            }
        } catch (err) {
            console.error('Error selling all items:', err);
        }
    };

    // Test function to kill enemy instantly
    const handleKillEnemy = () => {
        if (currentBattle && currentEnemy) {
            // Set enemy health to 0 to trigger victory
            const updatedBattle = {
                ...currentBattle,
                enemy: { ...currentBattle.enemy, currentHealth: 0 }
            };
            
            setCurrentBattle(updatedBattle);
            
            // Force battle result check immediately
            const battleResult = {
                winner: 'player',
                playerFinalHealth: currentBattle.player.currentHealth,
                enemyFinalHealth: 0
            };
            
            // Only stop battle if not in dungeon
            if (!dungeonRun || dungeonRun.completed) {
                setIsBattleActive(false);
            }
            
            setBattleResult(battleResult);
            setPlayerHealth(battleResult.playerFinalHealth);
            
            // Process victory rewards
            const achievementResult = currentEnemy ? recordKill(currentEnemy.id) : { achievements: {}, newAchievements: [] };
            
            // Only process loot if NOT in dungeon (dungeons only drop chest at the end)
            let newLoot = [];
            if (!dungeonRun || dungeonRun.completed) {
                const lootResult = currentEnemy ? getLootDrop(currentEnemy.drops) : { items: [], gold: 0, goldItems: [] };
                
                // Only add equipment items to loot bag, not gold items
                newLoot = [...lootResult.items];
                
                // Auto-convert gold items directly without showing in loot bag
                if (lootResult.goldItems && lootResult.goldItems.length > 0) {
                    updatePlayerGold(lootResult.gold);
                    
                    // Notify for gold gains
                    if (lootResult.gold > 0) {
                        notifyGoldGain(lootResult.gold, `${currentEnemy?.name || 'Enemy'} drops`);
                    }
                }
                
                // Add to loot bag with limit enforcement
                const itemsToAdd = addToLootBag(newLoot);
                
                // Notify for each item drop
                itemsToAdd.forEach(itemName => {
                    notifyItemDrop(itemName, '📦');
                });
            }

            // --- PET DROP LOGIC (only in normal battles, not dungeons) ---
            let petDropMessage = null;
            if (currentEnemy && (!dungeonRun || dungeonRun.completed)) {
                const pet = checkPetDrop(currentEnemy.id);
                if (pet) {
                    const currentSlot = getCurrentSlot();
                    const slotKey = getSlotKey('idle-chaos-pets', currentSlot);
                    const ownedPets = JSON.parse(localStorage.getItem(slotKey) || '[]');
                    if (!ownedPets.includes(pet.id)) {
                        ownedPets.push(pet.id);
                        localStorage.setItem(slotKey, JSON.stringify(ownedPets));
                        petDropMessage = `✨ PET FOUND: ${pet.icon} <b>${pet.name}</b>! (${pet.description})`;
                    } else {
                        petDropMessage = `✨ PET FOUND (duplicate): ${pet.icon} <b>${pet.name}</b>! (Already owned)`;
                    }
                }
            }

            // Add battle log messages
            const battleLogMessages = [
                {
                    type: 'victory',
                    message: dungeonRun && !dungeonRun.completed 
                        ? `🎉 ${currentEnemy?.name || 'Enemy'} defeated! Stage ${dungeonRun.currentStage + 1}/7 complete.`
                        : `🎉 ${t('battle.playerWins')}! Enemy defeated!`
                }
            ];
            
            // Add achievement messages if any new achievements unlocked
            if (achievementResult.newAchievements.length > 0) {
                achievementResult.newAchievements.forEach(achievement => {
                    battleLogMessages.push({
                        type: 'achievement',
                        message: `🏆 Achievement Unlocked: ${achievement.description}!`
                    });
                    
                    // Notify for achievement unlock
                    notifyAchievement(achievement.description);
                });
            }
            
            // Add loot messages (only for non-dungeon battles)
            if (!dungeonRun || dungeonRun.completed) {
                battleLogMessages.push(...newLoot.map(item => ({
                    type: 'loot',
                    message: `📦 Loot: ${item}`
                })));
                
                // Add pet message if found
                if (petDropMessage) {
                    battleLogMessages.push({
                        type: 'pet',
                        message: petDropMessage
                    });
                }
            }
            
            setBattleLog(prev => [...prev, ...battleLogMessages]);
            
            // Start enemy spawn timer for both dungeon and regular battles
            startEnemySpawnTimer();
        }
    };

    // Potion usage function
    const handleUsePotionLocal = (potionType) => {
        const result = handleUsePotion(potionType);
        if (result.success) {
            // Show potion used effect
            setLastPotionUsed({
                type: potionType,
                healAmount: result.healAmount,
                timestamp: Date.now()
            });
            
            // Clear effect after 2 seconds
            setTimeout(() => {
                setLastPotionUsed(null);
            }, 2000);
            
            // Auto save after potion use
            setTimeout(() => {
                saveCurrentGame();
            }, 500);
        }
    };

    // Auto potion check (now handled in BattleContext)
    const checkAutoPotion = () => {
        // This is now handled automatically in BattleContext
        // Keeping this function for backward compatibility but it's not needed
    };

    // showDeathDialog is now managed in BattleContext

    // applyDeathPenalties is now managed in BattleContext

    // respawnPlayer is now managed in BattleContext but we need local function for battle mode
    const handleRespawn = () => {
        // If in dungeon, go to selection. If in location battle, stay in battle mode
        if (dungeonRun && !dungeonRun.completed) {
            setBattleMode('selection');
        } else {
            setBattleMode('battle');
        }
        setBattleResult(null);
        // Actual respawn logic is handled in BattleContext
    };

    // startEnemySpawnTimer and spawnNewEnemy are now handled by global BattleContext

    const handleBackToSelection = () => {
        if (dungeonRun && !dungeonRun.completed) {
            setExitWarningOpen(true);
            return;
        }
        // Navigate back to battle selection page
        navigate('/battle-selection');
        stopBattle();
        setBattleResult(null);
        setDungeonRun(null);
    };

    // startRealTimeBattle is no longer needed - using startBattle from BattleContext



    // Helper function to call getStatDisplay with isAchievementUnlocked
    const getStatDisplayWithAchievement = (enemyId, statType, value) => {
        return getStatDisplay(enemyId, statType, value, isAchievementUnlocked);
    };

    // Helper function to call getEnemyHpDisplay with isAchievementUnlocked
    const getEnemyHpDisplayWithAchievement = (enemyId, current, max) => {
        return getEnemyHpDisplay(enemyId, current, max, isAchievementUnlocked);
    };

    // Memoize spawn timer UI to prevent unnecessary re-renders
    const spawnTimerUI = useMemo(() => {
        if (!isWaitingForEnemy) return null;
        
        return (
            <div className={styles.enemySpawnContainer}>
                <Typography className={styles.spawnText}>
                    {t('battle.searchingForEnemy')}
                </Typography>
                <div className={styles.circularProgress}>
                    <div 
                        className={styles.circularProgressBar}
                        style={{ '--progress': `${enemySpawnProgress}%` }}
                    ></div>
                    <div className={styles.circularProgressText}>
                        {Math.ceil((100 - enemySpawnProgress) / 20)}s
                    </div>
                </div>
            </div>
        );
    }, [isWaitingForEnemy, enemySpawnProgress, t]);

    // Get selected skill level and bonuses
    const getSelectedSkillInfo = () => {
        if (!selectedAttackType) return { level: 0, bonuses: null };
        
        const skillData = getSkillData();
        let skillLevel = 0;
        
        // Find the skill level in all categories
        Object.values(skillData).forEach(category => {
            if (category[selectedAttackType]) {
                skillLevel = category[selectedAttackType].level || 0;
            }
        });
        
        const bonuses = SKILL_LEVEL_BONUSES[selectedAttackType];
        

        
        return { level: skillLevel, bonuses };
    };

    const renderLootTooltip = (enemy) => (
        <Box sx={{ p: 1 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
                {t('battle.possibleDrops')}
            </Typography>
            {enemy.drops.map((drop, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                    {drop.name} - {(drop.chance * 100).toFixed(0)}%
                    {drop.type === 'gold' && (
                        <span style={{ color: '#ffd700' }}> (💰 {drop.value} Gold)</span>
                    )}
                </Typography>
            ))}
        </Box>
    );

    useEffect(() => {
        const currentSlot = getCurrentSlot();
        const characterSlotKey = getSlotKey("selectedCharacter", currentSlot);
        const savedCharacter = localStorage.getItem(characterSlotKey);
        if (savedCharacter) {
            setSelectedCharacter(savedCharacter);
        }
        
        const currentPlayerStats = getPlayerStats();
        setPlayerStats(currentPlayerStats);
        
        // Her zaman güncel max HP'yi kullan
        setPlayerHealth(currentPlayerStats.HEALTH);
        const healthCurrentSlot = getCurrentSlot();
        const healthSlotKey = getSlotKey("playerHealth", healthCurrentSlot);
        localStorage.setItem(healthSlotKey, currentPlayerStats.HEALTH.toString());
    }, []);

    useEffect(() => {
        const checkEquipmentChanges = () => {
            const currentPlayerStats = getPlayerStats();
            if (JSON.stringify(currentPlayerStats) !== JSON.stringify(playerStats)) {
                setPlayerStats(currentPlayerStats);
            }
        };

        const interval = setInterval(checkEquipmentChanges, 1000);
        
        const handleFocus = () => {
            checkEquipmentChanges();
        };
        
        window.addEventListener('focus', handleFocus);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
        };
    }, [playerStats]);

    useEffect(() => {
        const checkAutoPotionBuff = () => {
            const currentSlot = getCurrentSlot();
            const slotKey = getSlotKey('activeBuffs', currentSlot);
            const activeBuffs = JSON.parse(localStorage.getItem(slotKey) || '{}');
            const autoPotionBuff = activeBuffs['auto_potion'];
            
            if (autoPotionBuff && autoPotionBuff.expiresAt > Date.now()) {
                // Auto potion buff is active
                const newSettings = { ...autoPotionSettings, enabled: true };
                setAutoPotionSettings(newSettings);
                saveAutoPotionSettings(newSettings);
            } else if (autoPotionSettings.enabled) {
                // Auto potion buff expired, disable auto potion
                const newSettings = { ...autoPotionSettings, enabled: false };
                setAutoPotionSettings(newSettings);
                saveAutoPotionSettings(newSettings);
            }
        };

        const interval = setInterval(checkAutoPotionBuff, 5000);
        checkAutoPotionBuff(); // Check immediately
        
        return () => clearInterval(interval);
    }, [autoPotionSettings.enabled]);

    // Initialize skill data for the current slot when the component mounts
    useEffect(() => {
        initializeSkillDataForCurrentSlot();
    }, []);


    // Selection functions moved to BattleSelection.jsx
    // handleDungeonEnemyDefeated is now handled in BattleContext

    const confirmExitDungeon = () => {
        setExitWarningOpen(false);
        setBattleMode('selection');
        setBattleResult(null);
        
        // Use BattleContext functions to clear state
        setCurrentEnemy(null);
        setCurrentBattle(null);
        setIsBattleActive(false);
        setDungeonRun(null);
        
        // Clear any ongoing battle
        stopBattle();
    };

    const handleChestClick = (chestItem, index) => {
        // Extract dungeon name from chest item (backwards compatibility)
        const dungeonName = chestItem.replace('🎁 ', '').replace(' Chest', '');
        const dungeon = DUNGEONS.find(d => d.name === dungeonName);
        
        if (!dungeon || !dungeon.chest) {
            // If it's not an old-style chest, treat it as a regular item
            handleTakeItem(chestItem, index);
            return;
        }
        
        // For old-style chest items, show preview modal
        setChestPreviewModal({
            open: true,
            dungeon: dungeon,
            chestItem: chestItem
        });
    };

    const handleOpenChest = () => {
        const { dungeon, chestItem } = chestPreviewModal;
        
        if (!dungeon || !dungeon.chest) return;
        
        // Random selection based on chances
        const totalChance = dungeon.chest.reduce((sum, item) => sum + item.chance, 0);
        const random = Math.random() * totalChance;
        let currentChance = 0;
        let selectedItem = null;
        
        for (const item of dungeon.chest) {
            currentChance += item.chance;
            if (random <= currentChance) {
                selectedItem = item;
                break;
            }
        }
        
        if (!selectedItem) selectedItem = dungeon.chest[0]; // Fallback
        
        // Generate equipment from the selected item
        const equipment = convertLootBagToEquipment([selectedItem.name]);
        
        if (equipment.length > 0) {
            // Add to inventory
            try {
                const currentSlot = getCurrentSlot();
                const inventorySlotKey = getSlotKey('idle-chaos-inventory', currentSlot);
                const currentInventory = JSON.parse(localStorage.getItem(inventorySlotKey) || '[]');
                const updatedInventory = [...currentInventory, ...equipment];
                localStorage.setItem(inventorySlotKey, JSON.stringify(updatedInventory));
            } catch (err) {
                console.error('Error adding chest item to inventory:', err);
            }
            
            // Close preview modal
            setChestPreviewModal({ open: false, dungeon: null, chestItem: null });
            
            // Notify for chest opened
            notifyChestOpened(equipment[0].name || selectedItem.name, dungeon.name);
            
            // Show drop dialog with result
            setChestDropDialog({ 
                open: true, 
                item: equipment[0], 
                dungeon: dungeon
            });
        }
        
        // Remove chest from loot bag
        setLootBag(prev => {
            const updated = prev.filter(item => item !== chestItem);
            const currentSlot = getCurrentSlot();
            const slotKey = getSlotKey("lootBag", currentSlot);
            localStorage.setItem(slotKey, JSON.stringify(updated));
            return updated;
        });
    };

    // Add a useEffect to handle the countdown and auto-restart:
    useEffect(() => {
        if (dungeonCompleteDialog.open && dungeonCompleteDialog.countdown > 0) {
            const timer = setTimeout(() => {
                setDungeonCompleteDialog(prev => {
                    if (prev.countdown <= 1) {
                        // Auto-restart
                        setDungeonCompleteDialog({ open: false, countdown: 5 });
                        
                        // Properly restart the dungeon
                        const currentDungeon = dungeonRun?.dungeon;
                        if (currentDungeon) {
                            setDungeonRun({
                                dungeon: currentDungeon,
                                currentStage: 0,
                                completed: false,
                                chestAwarded: false,
                                stages: currentDungeon.enemies || []
                            });
                            
                            // Start the first enemy battle
                            const firstEnemyId = currentDungeon.enemies[0];
                            const firstEnemy = Object.values(enemies).find(e => e.id === firstEnemyId);
                            if (firstEnemy) {
                                startBattle(firstEnemy, selectedAttackType);
                            }
                        }
                        
                        return { open: false, countdown: 5 };
                    }
                    return { ...prev, countdown: prev.countdown - 1 };
                });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [dungeonCompleteDialog]);

    // Battle Screen
    return (
        <div className={styles.root}>
            {dungeonCompleteDialog.open && (
                <Dialog open={dungeonCompleteDialog.open} onClose={() => setDungeonCompleteDialog({ open: false, countdown: 5 })} className={styles.dungeonCompleteDialog} sx={{ top: 0, position: 'absolute' }}>
                    <DialogTitle>{t('battle.dungeonComplete')}</DialogTitle>
                    <DialogContent>
                        <Typography>{t('battle.dungeonCompleteDescription')}</Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
                            <Button variant="outlined" color="secondary" onClick={() => {
                                setDungeonCompleteDialog({ open: false, countdown: 5 });
                                setBattleMode('selection');
                                setBattleResult(null);
                                
                                // Use BattleContext functions
                                setCurrentEnemy(null);
                                setCurrentBattle(null);
                                setIsBattleActive(false);
                                setDungeonRun(null);
                                stopBattle();
                            }}>{t('battle.leave')}</Button>
                            <Button variant="contained" color="primary" onClick={() => {
                                setDungeonCompleteDialog({ open: false, countdown: 5 });
                                
                                // Properly restart the dungeon
                                const currentDungeon = dungeonRun?.dungeon;
                                if (currentDungeon) {
                                    setDungeonRun({
                                        dungeon: currentDungeon,
                                        currentStage: 0,
                                        completed: false,
                                        chestAwarded: false,
                                        stages: currentDungeon.enemies || []
                                    });
                                    
                                    // Start the first enemy battle
                                    const firstEnemyId = currentDungeon.enemies[0];
                                    const firstEnemy = Object.values(enemies).find(e => e.id === firstEnemyId);
                                    if (firstEnemy) {
                                        startBattle(firstEnemy, selectedAttackType);
                                    }
                                }
                            }}>
                                {t('battle.restart')} ({dungeonCompleteDialog.countdown})
                            </Button>
                        </Box>
                    </DialogContent>
                </Dialog>
            )}

            {/* Battle UI - show during battle, dungeon, or waiting for enemy */}
            {(isBattleActive || dungeonRun || isWaitingForEnemy) && (
                <>
                    {/* Header Section - Different for Battle vs Dungeon */}
                    {!dungeonRun ? (
                        <div className={styles.battleHeader}>
                            <Button 
                                variant="outlined" 
                                onClick={handleBackToSelection}
                                className={styles.backButton}
                            >
                                {t('battle.backToSelection')}
                            </Button>
                            
                            {/* TEMPORARY: Test death button */}
                            <Button 
                                variant="contained" 
                                color="error"
                                onClick={() => {
                                    setIsBattleActive(false);
                                    showDeathDialog();
                                }}
                                style={{ marginLeft: '8px' }}
                            >
                                🏴‍☠️ TEST: Die
                            </Button>
                            <Button 
                                variant="contained" 
                                color="success"
                                onClick={handleKillEnemy}
                                style={{ marginLeft: '8px' }}
                            >
                                ⚔️ TEST: Kill
                            </Button>
                            {dungeonRun && !dungeonRun.completed && (
                                <Button 
                                    variant="contained" 
                                    color="warning"
                                    onClick={() => {
                                        // Force complete the dungeon by setting it to final stage and then calling spawnNewEnemy
                                        setDungeonRun(prev => ({ ...prev, currentStage: 6 }));
                                        setIsBattleActive(false);
                                        setCurrentBattle(null);
                                        setCurrentEnemy(null);
                                        
                                        // Manually trigger the dungeon completion logic
                                        setTimeout(() => {
                                            spawnNewEnemy(); // This will call handleDungeonEnemyDefeated
                                        }, 100);
                                    }}
                                    style={{ marginLeft: '8px' }}
                                >
                                    🏆 TEST: Complete Dungeon
                                </Button>
                            )}
                        </div>
                                         ) : (
                         <div className={styles.dungeonHeader}>
                             <Typography variant="h6">{dungeonRun.dungeon.name}</Typography>
                             <Typography variant="subtitle1">{t('battle.dungeonStage', { stage: dungeonRun.currentStage + 1 })}</Typography>
                             <Button 
                                 variant="outlined" 
                                 onClick={handleBackToSelection}
                                 className={styles.backButton}
                             >
                                 {t('battle.backToSelection')}
                             </Button>
                             
                             {/* TEMPORARY: Test death button */}
                             <Button 
                                 variant="contained" 
                                 color="error"
                                 onClick={() => {
                                     setIsBattleActive(false);
                                     showDeathDialog();
                                 }}
                                 style={{ marginLeft: '8px' }}
                             >
                                 🏴‍☠️ TEST: Die
                             </Button>
                             <Button 
                                 variant="contained" 
                                 color="success"
                                 onClick={handleKillEnemy}
                                 style={{ marginLeft: '8px' }}
                             >
                                 ⚔️ TEST: Kill
                             </Button>
                             <Button 
                                 variant="contained" 
                                 color="warning"
                                 onClick={() => {
                                     // Force complete the dungeon by setting it to final stage and then calling spawnNewEnemy
                                     setDungeonRun(prev => ({ ...prev, currentStage: 6 }));
                                     setIsBattleActive(false);
                                     setCurrentBattle(null);
                                     setCurrentEnemy(null);
                                     
                                     // Manually trigger the dungeon completion logic
                                     setTimeout(() => {
                                         spawnNewEnemy(); // This will call handleDungeonEnemyDefeated
                                     }, 100);
                                 }}
                                 style={{ marginLeft: '8px' }}
                             >
                                 🏆 TEST: Complete Dungeon
                             </Button>
                         </div>
                     )}
                    
                    {/* Battle Content - Common for both modes */}
                    <div className={styles.battleContainer}>
                        {/* Fighters Row */}
                        <div className={styles.fighters}>
                            {/* PLAYER */}
                            <div className={styles.fighter}>
                                <Avatar src={getCharacterIcon(selectedCharacter)} className={styles.avatar} />
                                <Typography variant="h6">{getCharacterName(selectedCharacter)}</Typography>
                                {damageDisplay.player && (
                                    <div 
                                        className={`${styles.damageDisplay} ${
                                            damageDisplay.player === 'MISS' ? styles.missDisplay : 
                                            damageDisplay.playerType === 'crit' ? styles.enemyCritDamage : styles.enemyDamage
                                        }`}
                                    >
                                        {damageDisplay.player}
                                    </div>
                                )}
                                <div className={styles.hpBarContainer}>
                                    <Typography className={styles.hpText}>
                                        HP: {currentBattle?.player?.currentHealth || playerHealth}/{currentBattle?.player?.HEALTH || playerStats.HEALTH}
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={currentBattle ? (currentBattle.player.currentHealth / currentBattle.player.HEALTH) * 100 : (playerHealth / playerStats.HEALTH) * 100}
                                        className={`${styles.progress} ${styles.playerHpBar}`}
                                    />
                                </div>
                                <div className={styles.attackBarContainer}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={currentBattle?.playerProgress || 0}
                                        className={`${styles.progress} ${styles.attackBar}`}
                                        sx={{ height: '15px', borderRadius: '8px' }}
                                    />
                                </div>
                                {currentBattle && (
                                    <div className={styles.attackTypeSmall}>
                                        <Typography variant="caption" className={styles.attackTypeSmallTitle}>
                                            🎯 {t('battle.selectAttackType')}
                                        </Typography>
                                        <div className={styles.attackTypeSmallGrid}>
                                            {availableAttackTypes.map((attackType) => (
                                                <Tooltip
                                                    key={attackType.type}
                                                    title={attackType.description}
                                                    arrow
                                                    placement="top"
                                                >
                                                    <Button
                                                        variant="text"
                                                        className={`${styles.attackTypeSmallButton} ${
                                                            selectedAttackType === attackType.type ? styles.attackTypeSelected : ''
                                                        }`}
                                                        onClick={() => setSelectedAttackType(attackType.type)}
                                                    >
                                                        <span className={styles.attackTypeSmallIcon}>{attackType.icon}</span>
                                                    </Button>
                                                </Tooltip>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* ENEMY */}
                            <div className={styles.fighter}>
                                <Avatar 
                                    src={getEnemyIcon(currentEnemy?.id)} 
                                    className={styles.avatar}
                                    onError={(e) => {
                                        if (e.target && e.target.nextSibling) {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }
                                    }}
                                />
                                <div 
                                    className={styles.avatarFallback}
                                    style={{ display: 'none' }}
                                >
                                    {getEnemyInitial(currentEnemy?.name)}
                                </div>
                                <Typography variant="h6">{currentEnemy?.name}</Typography>
                                {damageDisplay.enemy && (
                                    <div 
                                        className={`${styles.damageDisplay} ${
                                            damageDisplay.enemy === 'MISS' ? styles.missDisplay : 
                                            damageDisplay.enemyType === 'crit' ? styles.playerCritDamage : styles.playerDamage
                                        }`}
                                    >
                                        {damageDisplay.enemy}
                                    </div>
                                )}
                                {spawnTimerUI || (
                                    <>
                                        <div className={styles.hpBarContainer}>
                                            <Typography 
                                                className={`${styles.hpText} ${
                                                    getStatDisplayWithAchievement(currentEnemy?.id, 'hp', currentEnemy?.maxHp) === "" ? styles.hiddenStat : styles.revealedStat
                                                }`}
                                            >
                                                HP: {getEnemyHpDisplayWithAchievement(currentEnemy?.id, currentBattle?.enemy?.currentHealth || 0, currentBattle?.enemy?.maxHealth || currentBattle?.enemy?.maxHp || currentEnemy?.maxHp)}
                                            </Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={currentBattle ? (getStatDisplayWithAchievement(currentEnemy?.id, 'hp', currentBattle.enemy.maxHealth || currentBattle.enemy.maxHp) === "" ? 100 : (currentBattle.enemy.currentHealth / (currentBattle.enemy.maxHealth || currentBattle.enemy.maxHp)) * 100) : 100}
                                                className={`${styles.progress} ${styles.enemyHpBar}`}
                                            />
                                        </div>
                                        <div className={styles.attackBarContainer}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={currentBattle?.enemyProgress || 0}
                                                className={`${styles.progress} ${styles.attackBar}`}
                                                sx={{ height: '15px', borderRadius: '8px' }}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            {/* Battle Log - Toggleable Widget */}
                            {battleLogVisible && (
                                <div className={styles.fighter}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="h6">{t('battle.battleLog')}</Typography>
                                        <Tooltip title={t('battle.clearBattleLog')} arrow>
                                            <IconButton
                                                onClick={() => setBattleLog([])}
                                                sx={{
                                                    position: 'absolute',
                                                    right: 8,
                                                    top: 8,
                                                    color: '#ffd700',
                                                    background: 'rgba(0,0,0,0.18)',
                                                    borderRadius: 2,
                                                    '&:hover': { background: 'rgba(255,215,0,0.12)' }
                                                }}
                                                size="small"
                                            >
                                                <div style={{ fontSize: '1rem' }}>🗑️</div>
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                    <div className={styles.battleLog}>
                                        {battleLog.length === 0 ? (
                                            <Typography variant="body2" sx={{ color: '#ffffff', fontFamily: 'Press Start 2P', fontSize: '0.7rem' }}>{t('battle.noBattleLog')}</Typography>
                                        ) : (
                                            battleLog.map((entry, idx) => (
                                                <div key={idx} className={styles[`${entry.type}Log`] || styles.battleLogEntry}>
                                                    {entry.message}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Potion System */}
                        {currentBattle && (
                            <div className={styles.potionSection}>
                                <div className={styles.potionHeader}>
                                    <Typography variant="h6" className={styles.potionTitle}>
                                        <LocalDrink /> {t('potions.healthPotions')}
                                    </Typography>
                                    <Chip 
                                        label={autoPotionSettings.enabled ? t('potions.autoOn') : t('potions.autoOff')}
                                        color={autoPotionSettings.enabled ? "success" : "default"}
                                        size="small"
                                        className={styles.autoPotionChip}
                                    />
                                </div>
                                <div className={styles.potionGrid}>
                                    {Object.entries(POTION_TYPES).map(([key, potion]) => {
                                        const count = potions[potion.id] || 0;
                                        const canUse = count > 0 && currentBattle.player.currentHealth < currentBattle.player.HEALTH;
                                        return (
                                            <Button
                                                key={potion.id}
                                                variant="contained"
                                                className={styles.potionButton}
                                                disabled={!canUse}
                                                onClick={() => handleUsePotionLocal(potion.id)}
                                                style={{
                                                    backgroundColor: potion.color,
                                                    border: lastPotionUsed?.type === potion.id ? '3px solid #ffd700' : 'none',
                                                    boxShadow: lastPotionUsed?.type === potion.id ? '0 0 15px #ffd700' : 'none'
                                                }}
                                            >
                                                <div className={styles.potionContent}>
                                                    <Typography variant="caption" className={styles.potionName}>
                                                        {t(`potions.${potion.id}HealthPotion`)}
                                                    </Typography>
                                                    <Typography variant="body2" className={styles.potionHeal}>
                                                        +{potion.healAmount}
                                                    </Typography>
                                                    <Typography variant="caption" className={styles.potionCount}>
                                                        {count}
                                                    </Typography>
                                                </div>
                                            </Button>
                                        );
                                    })}
                                </div>
                                {lastPotionUsed && (
                                    <div className={styles.potionEffect}>
                                        <Typography variant="h4" className={styles.healText}>
                                            +{lastPotionUsed.healAmount} HP
                                        </Typography>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Widget Container - Player/Enemy Stats, Loot, etc. */}
                        <div className={styles.widgetContainer}>
                            {/* PLAYER STATS */}
                            <div className={styles.section}>
                                <Typography variant="h6">{t('battle.playerStats')}</Typography>
                                <Divider />
                                {currentBattle ? (
                                    <>
                                        {(() => {
                                            const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                            const atkBonus = skillBuffs.ATK || 0;
                                            const effectiveATK = currentBattle.player.ATK + atkBonus;
                                            return (
                                                <Typography>
                                                    ⚔️ {t('battle.attack')}: {effectiveATK.toFixed(1)}
                                                    {atkBonus > 0 && <span className={styles.skillBonus}> (+{atkBonus.toFixed(1)})</span>}
                                                </Typography>
                                            );
                                        })()}
                                        {(() => {
                                            const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                            const defBonus = skillBuffs.DEF || 0;
                                            const effectiveDEF = currentBattle.player.DEF + defBonus;
                                            return (
                                                <Typography>
                                                    🛡️ {t('battle.defense')}: {effectiveDEF.toFixed(1)}
                                                    {defBonus > 0 && <span className={styles.skillBonus}> (+{defBonus.toFixed(1)})</span>}
                                                </Typography>
                                            );
                                        })()}
                                        {(() => {
                                            const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                            const healthBonus = skillBuffs.HEALTH || 0;
                                            const effectiveHealth = currentBattle.player.HEALTH + healthBonus;
                                            return (
                                                <Typography>
                                                    ❤️ {t('battle.health')}: {currentBattle.player.currentHealth}/{effectiveHealth.toFixed(0)}
                                                    {healthBonus > 0 && <span className={styles.skillBonus}> (+{healthBonus.toFixed(0)} max)</span>}
                                                </Typography>
                                            );
                                        })()}
                                        {(() => {
                                            const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                            const attackSpeedBonus = skillBuffs.ATTACK_SPEED || 0;
                                            const effectiveAttackSpeed = currentBattle.player.ATTACK_SPEED + attackSpeedBonus;
                                            return (
                                                <Typography>
                                                    ⚡ {t('battle.attackSpeed')}: {effectiveAttackSpeed.toFixed(1)}
                                                    {attackSpeedBonus > 0 && <span className={styles.skillBonus}> (+{attackSpeedBonus.toFixed(2)})</span>}
                                                </Typography>
                                            );
                                        })()}
                                        {(() => {
                                            const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                            const critChanceBonus = skillBuffs.CRIT_CHANCE || 0;
                                            const effectiveCritChance = (currentBattle.player.CRIT_CHANCE || 5) + critChanceBonus;
                                            return (
                                                <Typography>
                                                    🎯 {t('battle.criticalChance')}: {effectiveCritChance.toFixed(1)}%
                                                    {critChanceBonus > 0 && <span className={styles.skillBonus}> (+{critChanceBonus.toFixed(1)}%)</span>}
                                                </Typography>
                                            );
                                        })()}
                                        {(() => {
                                            const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                            const critDamageBonus = skillBuffs.CRIT_DAMAGE || 0;
                                            const effectiveCritDamage = (currentBattle.player.CRIT_DAMAGE || 150) + critDamageBonus;
                                            

                                            
                                            return (
                                                <Typography>
                                                    💥 {t('battle.criticalDamage')}: {effectiveCritDamage.toFixed(1)}%
                                                    {critDamageBonus > 0 && <span className={styles.skillBonus}> (+{critDamageBonus.toFixed(1)}%)</span>}
                                                </Typography>
                                            );
                                        })()}
                                        <Divider sx={{ my: 1 }} />
                                        {(() => {
                                            const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                            const accuracyBonus = skillBuffs.ACCURACY_BONUS || 0; // Stab skill gives accuracy
                                            const atkBonus = skillBuffs.ATK || 0; // Magic skills give ATK
                                            const effectiveATK = currentBattle.player.ATK + atkBonus;
                                            const hitChance = calculateHitChance(effectiveATK, currentBattle.enemy.DEF, accuracyBonus);
                                            return (
                                                <Typography>
                                                    🎲 {t('battle.hitChance')}: {hitChance}%
                                                    {accuracyBonus > 0 && <span className={styles.skillBonus}> (+{accuracyBonus.toFixed(1)}%)</span>}
                                                </Typography>
                                            );
                                        })()}
                                        {(() => {
                                            const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                            const damageRangeBonus = skillBuffs ? skillBuffs.MIN_DAMAGE.toFixed(1) + ' - ' + skillBuffs.MAX_DAMAGE.toFixed(1) : 0;
                                            const critDamageBonus = skillBuffs.CRIT_DAMAGE || 0;
                                            const atkBonus = skillBuffs.ATK || 0; // Magic skills give ATK
                                            const effectiveATK = currentBattle.player.ATK + atkBonus;
                                            const damageRange = calculateDamageRange(effectiveATK, currentBattle.enemy.DEF, damageRangeBonus);
                                            const totalCritDamage = (currentBattle.player.CRIT_DAMAGE || 150) + critDamageBonus;
                                            const critDamageRange = {
                                                min: Math.floor(damageRange.min * (totalCritDamage / 100)),
                                                max: Math.floor(damageRange.max * (totalCritDamage / 100))
                                            };
                                            return (
                                                <>
                                                    <Typography>
                                                        ⚔️ {t('battle.baseDamage')}: {damageRange.min}-{damageRange.max}
                                                        {damageRangeBonus && <span className={styles.skillBonus}> ({damageRangeBonus})</span>}
                                                    </Typography>
                                                    <Typography>💥 {t('battle.critDamage')}: {critDamageRange.min}-{critDamageRange.max}</Typography>
                                                </>
                                            );
                                        })()}
                                    </>
                                ) : (
                                    <>
                                        {(() => {
                                            const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                            const atkBonus = skillBuffs.ATK || 0;
                                            const effectiveATK = playerStats.ATK + atkBonus;
                                            const { level, bonuses } = getSelectedSkillInfo();
                                            
                                            return (
                                                <Typography>
                                                    ⚔️ {t('battle.attack')}: {effectiveATK.toFixed(1)}
                                                    {getEquipmentBonuses().ATK && <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().ATK})</span>}
                                                    {atkBonus > 0 && <span className={styles.skillBonus}> (+{atkBonus.toFixed(1)})</span>}
                                                    {bonuses && level > 0 && (
                                                        <span className={styles.skillBonus}> (+{bonuses.ATK} per level, Lv.{level})</span>
                                                    )}
                                                </Typography>
                                            );
                                        })()}
                                        {(() => {
                                            const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                            const defBonus = skillBuffs.DEF || 0;
                                            const effectiveDEF = playerStats.DEF + defBonus;
                                            return (
                                                <Typography>
                                                    🛡️ {t('battle.defense')}: {effectiveDEF.toFixed(1)}
                                                    {getEquipmentBonuses().DEF && <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().DEF})</span>}
                                                    {defBonus > 0 && <span className={styles.skillBonus}> (+{defBonus.toFixed(1)})</span>}
                                                </Typography>
                                            );
                                        })()}
                                        {(() => {
                                            const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                            const healthBonus = skillBuffs.HEALTH || 0;
                                            const effectiveHealth = playerStats.HEALTH + healthBonus;
                                            return (
                                                <Typography>
                                                    ❤️ {t('battle.health')}: {playerHealth}/{effectiveHealth.toFixed(0)}
                                                    {getEquipmentBonuses().HEALTH && <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().HEALTH})</span>}
                                                    {healthBonus > 0 && <span className={styles.skillBonus}> (+{healthBonus.toFixed(0)} max)</span>}
                                                </Typography>
                                            );
                                        })()}
                                        {(() => {
                                            const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                            const attackSpeedBonus = skillBuffs.ATTACK_SPEED || 0;
                                            const effectiveAttackSpeed = playerStats.ATTACK_SPEED + attackSpeedBonus;
                                            return (
                                                <Typography>
                                                    ⚡ {t('battle.attackSpeed')}: {effectiveAttackSpeed.toFixed(1)}
                                                    {getEquipmentBonuses().ATTACK_SPEED && <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().ATTACK_SPEED})</span>}
                                                    {attackSpeedBonus > 0 && <span className={styles.skillBonus}> (+{attackSpeedBonus.toFixed(2)})</span>}
                                                </Typography>
                                            );
                                        })()}
                                        {(() => {
                                            const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                            const critChanceBonus = skillBuffs.CRIT_CHANCE || 0;
                                            const effectiveCritChance = playerStats.CRIT_CHANCE + critChanceBonus;
                                            
                                            return (
                                                <Typography>
                                                    🎯 {t('battle.criticalChance')}: {effectiveCritChance.toFixed(1)}%
                                                    {getEquipmentBonuses().CRIT_CHANCE && <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().CRIT_CHANCE}%)</span>}
                                                    {critChanceBonus > 0 && <span className={styles.skillBonus}> (+{critChanceBonus.toFixed(1)}%)</span>}
                                                </Typography>
                                            );
                                        })()}
                                        {(() => {
                                            const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                            const critDamageBonus = skillBuffs.CRIT_DAMAGE || 0;
                                            const effectiveCritDamage = playerStats.CRIT_DAMAGE + critDamageBonus;
                                            
                                            return (
                                                <Typography>
                                                    💥 {t('battle.criticalDamage')}: {effectiveCritDamage.toFixed(1)}%
                                                    {getEquipmentBonuses().CRIT_DAMAGE && <span className={styles.equipmentBonus}>(+{getEquipmentBonuses().CRIT_DAMAGE}%)</span>}
                                                    {critDamageBonus > 0 && <span className={styles.skillBonus}> (+{critDamageBonus.toFixed(1)}%)</span>}
                                                </Typography>
                                            );
                                        })()}
                                        <Divider sx={{ my: 1 }} />
                                        {(() => {
                                            const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                            const atkBonus = skillBuffs.ATK || 0;
                                            const effectiveATK = playerStats.ATK + atkBonus;
                                            const hitChance = calculateHitChance(effectiveATK, currentEnemy?.DEF || 0, 0);
                                            return (
                                                <Typography>
                                                    🎲 {t('battle.hitChance')}: {hitChance}%
                                                    {atkBonus > 0 && <span className={styles.skillBonus}> (+{atkBonus.toFixed(1)} ATK)</span>}
                                                </Typography>
                                            );
                                        })()}
                                        {(() => {
                                            const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                                            const atkBonus = skillBuffs.ATK || 0;
                                            const effectiveATK = playerStats.ATK + atkBonus;
                                            const damageRange = calculateDamageRange(effectiveATK, currentEnemy?.DEF || 0, 0, skillBuffs);
                                            const baseDamage = calculateDamage(effectiveATK, currentEnemy?.DEF || 0, 0, skillBuffs);
                                            const totalCritDamage = playerStats.CRIT_DAMAGE;
                                            const { level, bonuses } = getSelectedSkillInfo();
                                            
                                            return (
                                                <>
                                                    <Typography>
                                                        ⚔️ {t('battle.baseDamage')}: {damageRange.min}-{damageRange.max}
                                                        {(skillBuffs.MIN_DAMAGE > 0 || skillBuffs.MAX_DAMAGE > 0) && (
                                                            <span className={styles.skillBonus}> 
                                                                (+{skillBuffs.MIN_DAMAGE?.toFixed(1) || 0} min, +{skillBuffs.MAX_DAMAGE?.toFixed(1) || 0} max)
                                                            </span>
                                                        )}
                                                        {bonuses && level > 0 && (
                                                            <span className={styles.skillBonus}> 
                                                                (+{bonuses.MIN_DAMAGE} min, +{bonuses.MAX_DAMAGE} max per level, Lv.{level})
                                                            </span>
                                                        )}
                                                    </Typography>
                                                    <Typography>💥 {t('battle.critDamage')}: {Math.floor(baseDamage * (totalCritDamage / 100))}</Typography>
                                                </>
                                            );
                                        })()}
                                    </>
                                )}
                            </div>

                            {/* ENEMY STATS */}
                            <div className={styles.section}>
                                <Typography variant="h6">{t('battle.enemyStats')}</Typography>
                                <Divider />
                                {currentBattle ? (
                                    <>
                                        <Typography className={getStatDisplayWithAchievement(currentEnemy?.id, 'atk', currentBattle.enemy.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            ⚔️ Attack: {getStatDisplayWithAchievement(currentEnemy?.id, 'atk', currentBattle.enemy.ATK)}
                                        </Typography>
                                        <Typography className={getStatDisplayWithAchievement(currentEnemy?.id, 'attack_type', currentBattle.enemy.ATTACK_TYPE) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            🎯 Attack Type: {getStatDisplayWithAchievement(currentEnemy?.id, 'attack_type', currentBattle.enemy.ATTACK_TYPE) === "" ? "" : `${currentBattle.enemy.ATTACK_TYPE || "Melee"}`}
                                        </Typography>
                                        <Typography className={getStatDisplayWithAchievement(currentEnemy?.id, 'def', currentBattle.enemy.DEF) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            🛡️ Def: {getStatDisplayWithAchievement(currentEnemy?.id, 'def', currentBattle.enemy.DEF)}
                                        </Typography>
                                        <Typography className={getStatDisplayWithAchievement(currentEnemy?.id, 'magic_def', currentBattle.enemy.MAGIC_DEF) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            🧙 Magic Def: {getStatDisplayWithAchievement(currentEnemy?.id, 'magic_def', currentBattle.enemy.MAGIC_DEF) === "" ? "" : `${currentBattle.enemy.MAGIC_DEF || 0}`}
                                        </Typography>
                                        <Typography className={getStatDisplayWithAchievement(currentEnemy?.id, 'hp', currentBattle.enemy.maxHp) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            ❤️ HP: {getEnemyHpDisplayWithAchievement(currentEnemy?.id, currentBattle.enemy.currentHealth, currentBattle.enemy.maxHp)}
                                        </Typography>
                                        <Typography className={getStatDisplayWithAchievement(currentEnemy?.id, 'energy_shield', currentBattle.enemy.ENERGY_SHIELD) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            🛡️ Energy Shield: {getStatDisplayWithAchievement(currentEnemy?.id, 'energy_shield', currentBattle.enemy.ENERGY_SHIELD) === "" ? "" : `${currentBattle.enemy.ENERGY_SHIELD || 0}`}
                                        </Typography>
                                        <Typography className={getStatDisplayWithAchievement(currentEnemy?.id, 'base_damage', currentBattle.enemy.BASE_DAMAGE_MIN) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            ⚔️ Base Damage: {getStatDisplayWithAchievement(currentEnemy?.id, 'base_damage', currentBattle.enemy.BASE_DAMAGE_MIN) === "" ? "" : `${currentBattle.enemy.BASE_DAMAGE_MIN || 0}-${currentBattle.enemy.BASE_DAMAGE_MAX || 0}`}
                                        </Typography>
                                        <Typography className={getStatDisplayWithAchievement(currentEnemy?.id, 'attack_speed', currentBattle.enemy.ATTACK_SPEED) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            ⚡ {t('battle.attackSpeed')}: {getStatDisplayWithAchievement(currentEnemy?.id, 'attack_speed', currentBattle.enemy.ATTACK_SPEED) === "" ? "" : currentBattle.enemy.ATTACK_SPEED}
                                        </Typography>
                                        <Typography className={getStatDisplayWithAchievement(currentEnemy?.id, 'crit_chance', currentBattle.enemy.CRIT_CHANCE || 3) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            🎯 {t('battle.criticalChance')}: {getStatDisplayWithAchievement(currentEnemy?.id, 'crit_chance', currentBattle.enemy.CRIT_CHANCE || 3) === "" ? "" : `${currentBattle.enemy.CRIT_CHANCE || 3}%`}
                                        </Typography>
                                        <Typography className={getStatDisplayWithAchievement(currentEnemy?.id, 'crit_damage', currentBattle.enemy.CRIT_DAMAGE || 120) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            💥 {t('battle.criticalDamage')}: {getStatDisplayWithAchievement(currentEnemy?.id, 'crit_damage', currentBattle.enemy.CRIT_DAMAGE || 120) === "" ? "" : `${currentBattle.enemy.CRIT_DAMAGE || 120}%`}
                                        </Typography>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography className={getStatDisplayWithAchievement(currentEnemy?.id, 'hit_chance', 0) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            🎲 {t('battle.hitChance')}: {getStatDisplayWithAchievement(currentEnemy?.id, 'hit_chance', 0) === "" ? "" : `${calculateHitChance(currentEnemy?.ATK || 0, playerStats.DEF)}%`}
                                        </Typography>
                                        {(() => {
                                            const damageRange = calculateDamageRange(currentBattle.enemy.ATK, currentBattle.player.DEF);
                                            const critDamageRange = {
                                                min: Math.floor(damageRange.min * ((currentBattle.enemy.CRIT_DAMAGE || 120) / 100)),
                                                max: Math.floor(damageRange.max * ((currentBattle.enemy.CRIT_DAMAGE || 120) / 100))
                                            };
                                            return (
                                                <>
                                                    <Typography className={getStatDisplayWithAchievement(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                        ⚔️ {t('battle.baseDamage')}: {getStatDisplayWithAchievement(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? "" : `${damageRange.min}-${damageRange.max}`}
                                                    </Typography>
                                                    <Typography className={getStatDisplayWithAchievement(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                        💥 {t('battle.critDamage')}: {getStatDisplayWithAchievement(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? "" : `${critDamageRange.min}-${critDamageRange.max}`}
                                                    </Typography>
                                                </>
                                            );
                                        })()}
                                    </>
                                ) : (
                                    <>
                                        <Typography className={getStatDisplayWithAchievement(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            ⚔️ {t('battle.attack')}: {getStatDisplayWithAchievement(currentEnemy?.id, 'atk', currentEnemy?.ATK)}
                                        </Typography>
                                        <Typography className={getStatDisplayWithAchievement(currentEnemy?.id, 'def', currentEnemy?.DEF) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            🛡️ {t('battle.defense')}: {getStatDisplayWithAchievement(currentEnemy?.id, 'def', currentEnemy?.DEF)}
                                        </Typography>
                                        <Typography className={getStatDisplayWithAchievement(currentEnemy?.id, 'hp', currentEnemy?.maxHp) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            ❤️ {t('battle.health')}: {getStatDisplayWithAchievement(currentEnemy?.id, 'hp', currentEnemy?.maxHp) === "" ? "" : `${currentEnemy?.maxHp}/${currentEnemy?.maxHp}`}
                                        </Typography>
                                        <Typography className={getStatDisplayWithAchievement(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            ⚡ {t('battle.attackSpeed')}: {currentEnemy?.ATTACK_SPEED || 1.5}
                                        </Typography>
                                        <Typography className={getStatDisplayWithAchievement(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            🎯 {t('battle.criticalChance')}: 3%
                                        </Typography>
                                        <Typography className={getStatDisplayWithAchievement(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            💥 {t('battle.criticalDamage')}: 120%
                                        </Typography>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography className={getStatDisplayWithAchievement(currentEnemy?.id, 'hit_chance', 0) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            🎲 {t('battle.hitChance')}: {calculateHitChance(currentEnemy?.ATK || 0, playerStats.DEF)}%
                                        </Typography>
                                        <Typography className={getStatDisplayWithAchievement(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            ⚔️ {t('battle.baseDamage')}: {calculateDamage(currentEnemy?.ATK || 0, playerStats.DEF, 0)}
                                        </Typography>
                                        <Typography className={getStatDisplayWithAchievement(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            💥 {t('battle.critDamage')}: {Math.floor(calculateDamage(currentEnemy?.ATK || 0, playerStats.DEF, 0) * 1.2)}
                                        </Typography>
                                    </>
                                )}
                            </div>

                            {/* LOOT TABLE */}
                            <div className={styles.section}>
                                <Typography variant="h6">{t('battle.possibleLoot')}</Typography>
                                <Divider />
                                {currentEnemy?.drops?.map((drop) => (
                                    <Typography key={drop.name} className={drop.type === 'gold' ? styles.goldLoot : styles.equipmentLoot}>
                                        {drop.name} - {(drop.chance * 100).toFixed(0)}%
                                        {drop.type === 'gold' && (
                                            <span className={styles.goldValue}> (💰 {drop.value} Gold)</span>
                                        )}
                                    </Typography>
                                )) || (
                                    <Typography>{t('battle.noDropsAvailable')}</Typography>
                                )}
                            </div>

                            {/* LOOT GAINED */}
                            <LootBag
                                lootBag={lootBag}
                                onTakeItem={handleTakeItem}
                                onSellItem={handleSellItem}
                                onTakeAll={handleTakeAll}
                                onSellAll={handleSellAll}
                                onOpenChest={handleChestClick}
                                calculateItemSellValue={calculateItemSellValue}
                            />
                        </div>
                    </div>
                </>
            )}


            {/* Chest Preview Modal */}
            {chestPreviewModal.open && (
                <Dialog 
                    open={chestPreviewModal.open} 
                    onClose={() => setChestPreviewModal({ open: false, dungeon: null, chestItem: null })}
                    maxWidth="md"
                    sx={{
                        '& .MuiDialog-paper': {
                            background: 'linear-gradient(145deg, #3a3a5a 0%, #2a2a4a 100%)',
                            border: '3px solid #ffd700',
                            borderRadius: 0,
                            color: '#ffffff',
                            fontFamily: 'Press Start 2P'
                        }
                    }}
                >
                    <DialogTitle sx={{ 
                        textAlign: 'center', 
                        color: '#ffd700', 
                        fontFamily: 'Press Start 2P',
                        fontSize: '1rem',
                        borderBottom: '2px solid #ffd700',
                        mb: 2
                    }}>
                        🎁 {t('battle.chestPreview', { dungeon: chestPreviewModal.dungeon?.name || '' })}
                    </DialogTitle>
                    <DialogContent sx={{ py: 3 }}>
                        <Typography variant="body2" sx={{ 
                            mb: 3, 
                            textAlign: 'center',
                            color: '#e0e0e0',
                            fontFamily: 'Press Start 2P',
                            fontSize: '0.7rem'
                        }}>
                            {t('battle.chestContents')}
                        </Typography>
                        
                        {chestPreviewModal.dungeon?.chest && (
                            <Grid container spacing={2}>
                                {chestPreviewModal.dungeon.chest.map((item, index) => {
                                    // Calculate percentage
                                    const totalChance = chestPreviewModal.dungeon.chest.reduce((sum, chestItem) => sum + chestItem.chance, 0);
                                    const percentage = ((item.chance / totalChance) * 100).toFixed(1);
                                    
                                    return (
                                        <Grid item xs={12} sm={6} md={4} key={index}>
                                            <Tooltip
                                                title={
                                                    <Box sx={{ p: 1 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                            {item.name}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                                                            {t('battle.dropChance')}: {percentage}%
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                                                            {t('battle.chestItemTooltip')}
                                                        </Typography>
                                                    </Box>
                                                }
                                                placement="top"
                                                arrow
                                            >
                                                <Card sx={{ 
                                                    background: 'rgba(255, 215, 0, 0.1)',
                                                    border: '1px solid #ffd700',
                                                    borderRadius: 0,
                                                    cursor: 'help',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        background: 'rgba(255, 215, 0, 0.2)',
                                                        transform: 'scale(1.05)'
                                                    }
                                                }}>
                                                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                                                        <Typography variant="body2" sx={{ 
                                                            fontFamily: 'Press Start 2P',
                                                            fontSize: '0.6rem',
                                                            color: '#ffffff',
                                                            mb: 1
                                                        }}>
                                                            {item.name}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ 
                                                            color: '#4ade80',
                                                            fontFamily: 'Press Start 2P',
                                                            fontSize: '0.5rem'
                                                        }}>
                                                            {percentage}%
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Tooltip>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
                        <Button 
                            onClick={() => setChestPreviewModal({ open: false, dungeon: null, chestItem: null })}
                            sx={{
                                fontFamily: 'Press Start 2P',
                                fontSize: '0.7rem',
                                px: 3,
                                py: 1,
                                background: 'linear-gradient(145deg, #6b7280 0%, #4b5563 100%)',
                                color: '#ffffff',
                                border: '2px solid #000000',
                                borderRadius: 0,
                                '&:hover': {
                                    background: 'linear-gradient(145deg, #4b5563 0%, #374151 100%)',
                                }
                            }}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button 
                            onClick={handleOpenChest}
                            sx={{
                                fontFamily: 'Press Start 2P',
                                fontSize: '0.7rem',
                                px: 3,
                                py: 1,
                                background: 'linear-gradient(145deg, #ffd700 0%, #f59e0b 100%)',
                                color: '#000000',
                                border: '2px solid #000000',
                                borderRadius: 0,
                                '&:hover': {
                                    background: 'linear-gradient(145deg, #f59e0b 0%, #d97706 100%)',
                                }
                            }}
                        >
                            {t('battle.openChest')} 🎁
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            <Dialog open={exitWarningOpen} onClose={() => setExitWarningOpen(false)}>
                <DialogTitle>{t('battle.dungeonExitWarningTitle')}</DialogTitle>
                <DialogContent>{t('battle.dungeonExitWarning')}</DialogContent>
                <DialogActions>
                    <Button onClick={() => setExitWarningOpen(false)}>{t('common.cancel')}</Button>
                    <Button onClick={confirmExitDungeon} color="error">{t('common.exit')}</Button>
                </DialogActions>
            </Dialog>

            {/* Chest Drop Dialog */}
            {chestDropDialog.open && (
                <Dialog 
                    open={chestDropDialog.open} 
                    onClose={() => setChestDropDialog({ open: false, item: null, dungeon: null })}
                    maxWidth="sm"
                    sx={{
                        '& .MuiDialog-paper': {
                            background: 'linear-gradient(145deg, #3a3a5a 0%, #2a2a4a 100%)',
                            border: '3px solid #ffd700',
                            borderRadius: 0,
                            color: '#ffffff',
                            fontFamily: 'Press Start 2P'
                        }
                    }}
                >
                    <DialogTitle sx={{ 
                        textAlign: 'center', 
                        color: '#ffd700', 
                        fontFamily: 'Press Start 2P',
                        fontSize: '1rem',
                        borderBottom: '2px solid #ffd700',
                        mb: 2
                    }}>
                        🎁 Chest Opened! 🎁
                    </DialogTitle>
                    <DialogContent sx={{ textAlign: 'center', py: 3 }}>
                        {chestDropDialog.item && (
                            <Box sx={{ 
                                p: 3, 
                                border: `2px solid ${chestDropDialog.item.rarity === 'legendary' ? '#ffd700' : 
                                    chestDropDialog.item.rarity === 'epic' ? '#a855f7' :
                                    chestDropDialog.item.rarity === 'rare' ? '#3b82f6' : '#6b7280'}`,
                                background: `rgba(${chestDropDialog.item.rarity === 'legendary' ? '255, 215, 0' : 
                                    chestDropDialog.item.rarity === 'epic' ? '168, 85, 247' :
                                    chestDropDialog.item.rarity === 'rare' ? '59, 130, 246' : '107, 114, 128'}, 0.1)`,
                                borderRadius: 0
                            }}>
                                <Typography variant="h5" sx={{ 
                                    mb: 2, 
                                    color: chestDropDialog.item.rarity === 'legendary' ? '#ffd700' : 
                                        chestDropDialog.item.rarity === 'epic' ? '#a855f7' :
                                        chestDropDialog.item.rarity === 'rare' ? '#3b82f6' : '#ffffff',
                                    fontFamily: 'Press Start 2P',
                                    fontSize: '1.2rem'
                                }}>
                                    {chestDropDialog.item.name}
                                </Typography>
                                <Typography variant="body1" sx={{ 
                                    mb: 2, 
                                    color: '#e0e0e0',
                                    fontFamily: 'Press Start 2P',
                                    fontSize: '0.8rem'
                                }}>
                                    Level {chestDropDialog.item.level} • {chestDropDialog.item.rarity.charAt(0).toUpperCase() + chestDropDialog.item.rarity.slice(1)}
                                </Typography>
                                {chestDropDialog.item.stats && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" sx={{ mb: 1, color: '#4ade80', fontFamily: 'Press Start 2P', fontSize: '0.7rem' }}>
                                            Stats:
                                        </Typography>
                                        {Object.entries(chestDropDialog.item.stats).map(([stat, value]) => (
                                            <Typography key={stat} variant="body2" sx={{ color: '#ffffff', fontFamily: 'Press Start 2P', fontSize: '0.6rem' }}>
                                                {stat}: +{value}
                                            </Typography>
                                        ))}
                                    </Box>
                                )}
                                <Typography variant="body2" sx={{ 
                                    mt: 2, 
                                    color: '#4ade80',
                                    fontFamily: 'Press Start 2P',
                                    fontSize: '0.7rem',
                                    fontStyle: 'italic'
                                }}>
                                    Added to inventory!
                                </Typography>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                        <Button 
                            onClick={() => setChestDropDialog({ open: false, item: null, dungeon: null })}
                            sx={{
                                fontFamily: 'Press Start 2P',
                                fontSize: '0.7rem',
                                px: 3,
                                py: 1,
                                background: 'linear-gradient(145deg, #4ade80 0%, #22c55e 100%)',
                                color: '#000000',
                                border: '2px solid #000000',
                                borderRadius: 0,
                                '&:hover': {
                                    background: 'linear-gradient(145deg, #22c55e 0%, #16a34a 100%)',
                                }
                            }}
                        >
                            Awesome!
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </div>
    );
}

export default Battle;
