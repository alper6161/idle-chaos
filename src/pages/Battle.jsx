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
import EnemyStats from "../components/EnemyStats";
import PlayerStats from "../components/PlayerStats";
import LootTable from "../components/LootTable";
import PotionSystem from "../components/PotionSystem";
import PlayerWidget from "../components/PlayerWidget";
import EnemyWidget from "../components/EnemyWidget";
import BattleLog from "../components/BattleLog";
import ChestPreviewModal from "../components/ChestPreviewModal";
import ChestDropDialog from "../components/ChestDropDialog";
import DungeonCompleteDialog from "../components/DungeonCompleteDialog";



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
            <DungeonCompleteDialog 
                dungeonCompleteDialog={dungeonCompleteDialog}
                onClose={() => setDungeonCompleteDialog({ open: false, countdown: 5 })}
                onLeave={() => {
                    setDungeonCompleteDialog({ open: false, countdown: 5 });
                    setBattleMode('selection');
                    setBattleResult(null);
                    
                    // Use BattleContext functions
                    setCurrentEnemy(null);
                    setCurrentBattle(null);
                    setIsBattleActive(false);
                    setDungeonRun(null);
                    stopBattle();
                }}
                onRestart={() => {
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
                }}
                dungeonRun={dungeonRun}
                enemies={enemies}
            />

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
                    
                    <div className={styles.battleContainer}>
                        <div className={styles.fighters}>
                            <PlayerWidget 
                                selectedCharacter={selectedCharacter}
                                currentBattle={currentBattle}
                                playerHealth={playerHealth}
                                playerStats={playerStats}
                                damageDisplay={damageDisplay}
                                availableAttackTypes={availableAttackTypes}
                                selectedAttackType={selectedAttackType}
                                onAttackTypeSelect={setSelectedAttackType}
                            />
                            {/* ENEMY */}
                            <EnemyWidget 
                                currentEnemy={currentEnemy}
                                currentBattle={currentBattle}
                                damageDisplay={damageDisplay}
                                spawnTimerUI={spawnTimerUI}
                                getStatDisplayWithAchievement={getStatDisplayWithAchievement}
                                getEnemyHpDisplayWithAchievement={getEnemyHpDisplayWithAchievement}
                            />
                            {/* Battle Log - Toggleable Widget */}
                            <BattleLog 
                                battleLogVisible={battleLogVisible}
                                battleLog={battleLog}
                                onClearBattleLog={() => setBattleLog([])}
                            />
                        </div>
                        {/* Potion System */}
                        <PotionSystem 
                            currentBattle={currentBattle}
                            potions={potions}
                            autoPotionSettings={autoPotionSettings}
                            lastPotionUsed={lastPotionUsed}
                            onUsePotion={handleUsePotionLocal}
                        />
                        {/* Widget Container - Player/Enemy Stats, Loot, etc. */}
                        <div className={styles.widgetContainer}>
                            {/* PLAYER STATS */}
                            <PlayerStats 
                                currentBattle={currentBattle}
                                currentEnemy={currentEnemy}
                                playerStats={playerStats}
                                playerHealth={playerHealth}
                                selectedAttackType={selectedAttackType}
                                getSelectedSkillInfo={getSelectedSkillInfo}
                            />

                            {/* ENEMY STATS */}
                            <EnemyStats 
                                currentEnemy={currentEnemy}
                                currentBattle={currentBattle}
                                playerStats={playerStats}
                                getStatDisplayWithAchievement={getStatDisplayWithAchievement}
                                getEnemyHpDisplayWithAchievement={getEnemyHpDisplayWithAchievement}
                            />

                            {/* LOOT TABLE */}
                            <LootTable currentEnemy={currentEnemy} />

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
            <ChestPreviewModal 
                chestPreviewModal={chestPreviewModal}
                onClose={() => setChestPreviewModal({ open: false, dungeon: null, chestItem: null })}
                onOpenChest={handleOpenChest}
            />

            <Dialog open={exitWarningOpen} onClose={() => setExitWarningOpen(false)}>
                <DialogTitle>{t('battle.dungeonExitWarningTitle')}</DialogTitle>
                <DialogContent>{t('battle.dungeonExitWarning')}</DialogContent>
                <DialogActions>
                    <Button onClick={() => setExitWarningOpen(false)}>{t('common.cancel')}</Button>
                    <Button onClick={confirmExitDungeon} color="error">{t('common.exit')}</Button>
                </DialogActions>
            </Dialog>

            {/* Chest Drop Dialog */}
            <ChestDropDialog 
                chestDropDialog={chestDropDialog}
                onClose={() => setChestDropDialog({ open: false, item: null, dungeon: null })}
            />
        </div>
    );
}

export default Battle;
