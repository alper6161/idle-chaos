import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../assets/styles/Battle.module.scss";
import {
    Typography,
    Button,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";

import enemies, { DUNGEONS, LOCATIONS } from "../utils/enemies.js";

import { 
    getSelectedSkillInfo,
    handleChestClickLogic,
    handleOpenChestLogic,
    calculateItemSellValue,
    getSlotKey,
    getCurrentSlot
} from "../utils/battleUtils.js";
import { getSkillData, initializeSkillDataForCurrentSlot } from "../utils/skillExperience.js";
import { getPlayerStats } from "../utils/playerStats.js";

import { 
    getAutoPotionSettings,
    saveAutoPotionSettings
} from "../utils/potions.js";
import { recordKill } from "../utils/achievements.js";
import { useTranslate } from "../hooks/useTranslate";
import { convertLootBagToEquipment } from "../utils/equipmentGenerator.js";
import { getLootDrop } from "../utils/combat.js";
import { checkPetDrop } from "../utils/pets.js";
import { saveCurrentGame } from "../utils/saveManager.js";

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



function Battle() {
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
    const [autoPotionSettings, setAutoPotionSettings] = useState(getAutoPotionSettings());


    const [battleLogVisible, setBattleLogVisible] = useState(true);
    const [exitWarningOpen, setExitWarningOpen] = useState(false);
    const [dungeonCompleteDialog, setDungeonCompleteDialog] = useState({ open: false, countdown: 5 });
    const [chestDropDialog, setChestDropDialog] = useState({ open: false, item: null, dungeon: null });
    const [chestPreviewModal, setChestPreviewModal] = useState({ open: false, dungeon: null, chestItem: null });

    useEffect(() => {
        setEnemiesData(enemies);
        setDungeonCompleteCallback(() => () => {
            setDungeonCompleteDialog({ open: true, countdown: 5 });
        });
    }, [setEnemiesData, setDungeonCompleteCallback]);



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
            // Auto save after potion use
            setTimeout(() => {
                saveCurrentGame();
            }, 500);
        }
    };

    const handleBackToSelection = () => {
        if (dungeonRun && !dungeonRun.completed) {
            setExitWarningOpen(true);
            return;
        }
        // Navigate back to battle selection page
        navigate('/battle-selection');
        stopBattle();
        setDungeonRun(null);
    };







    // Get selected skill level and bonuses
    const getSelectedSkillInfoLocal = () => {
        return getSelectedSkillInfo(selectedAttackType, getSkillData);
    };



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
                const newSettings = { ...autoPotionSettings, enabled: true };
                setAutoPotionSettings(newSettings);
                saveAutoPotionSettings(newSettings);
            } else if (autoPotionSettings.enabled) {
                const newSettings = { ...autoPotionSettings, enabled: false };
                setAutoPotionSettings(newSettings);
                saveAutoPotionSettings(newSettings);
            }
        };

        const interval = setInterval(checkAutoPotionBuff, 5000);
        checkAutoPotionBuff(); // Check immediately
        
        return () => clearInterval(interval);
    }, [autoPotionSettings.enabled]);
    useEffect(() => {
        initializeSkillDataForCurrentSlot();
    }, []);


    const confirmExitDungeon = () => {
        setExitWarningOpen(false);
        
        // Use BattleContext functions to clear state
        setCurrentEnemy(null);
        setCurrentBattle(null);
        setIsBattleActive(false);
        setDungeonRun(null);
        
        // Clear any ongoing battle
        stopBattle();
    };

    const handleChestClick = (chestItem, index) => {
        handleChestClickLogic(chestItem, index, DUNGEONS, handleTakeItem, setChestPreviewModal);
    };

    const handleOpenChest = () => {
        const result = handleOpenChestLogic(
            chestPreviewModal,
            convertLootBagToEquipment,
            (equipment) => {
                try {
                    const currentSlot = getCurrentSlot();
                    const inventorySlotKey = getSlotKey('idle-chaos-inventory', currentSlot);
                    const currentInventory = JSON.parse(localStorage.getItem(inventorySlotKey) || '[]');
                    const updatedInventory = [...currentInventory, equipment];
                    localStorage.setItem(inventorySlotKey, JSON.stringify(updatedInventory));
                } catch (err) {
                    console.error('Error adding chest item to inventory:', err);
                    throw err;
                }
            },
            setChestDropDialog,
            setChestPreviewModal,
            (notification) => {
                notifyChestOpened(notification.message, chestPreviewModal.dungeon?.name);
            }
        );
        
        if (result) {
            // Remove chest from loot bag
            setLootBag(prev => {
                const updated = prev.filter(item => item !== chestPreviewModal.chestItem);
                const currentSlot = getCurrentSlot();
                const slotKey = getSlotKey("lootBag", currentSlot);
                localStorage.setItem(slotKey, JSON.stringify(updated));
                return updated;
            });
        }
    };

    const handleTestDie = () => {
        setIsBattleActive(false);
        showDeathDialog();
    };

    const handleCompleteDungeon = () => {
        // Force complete the dungeon by setting it to final stage and then calling spawnNewEnemy
        setDungeonRun(prev => ({ ...prev, currentStage: 6 }));
        setIsBattleActive(false);
        setCurrentBattle(null);
        setCurrentEnemy(null);
        
        // Manually trigger the dungeon completion logic
        setTimeout(() => {
            spawnNewEnemy(); // This will call handleDungeonEnemyDefeated
        }, 100);
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
            {(isBattleActive || dungeonRun || isWaitingForEnemy) && (
                <>
                    <div className={dungeonRun ? styles.dungeonHeader : styles.battleHeader}>
                        {/* Header Title */}
                        {dungeonRun ? (
                            <>
                                <Typography variant="h6">{dungeonRun.dungeon.name}</Typography>
                                <Typography variant="subtitle1">{t('battle.dungeonStage', { stage: dungeonRun.currentStage + 1 })}</Typography>
                            </>
                        ) : (
                            <Typography variant="h6">
                                {(() => {
                                    // Find location based on current enemy
                                    if (currentEnemy) {
                                        const location = LOCATIONS.find(loc => 
                                            loc.enemies.includes(currentEnemy.id)
                                        );
                                        return location ? location.name : t('battle.location');
                                    }
                                    return t('battle.location');
                                })()}
                            </Typography>
                        )}
                        
                        {/* Back Button */}
                        <Button 
                            variant="outlined" 
                            onClick={handleBackToSelection}
                            className={styles.backButton}
                        >
                            {t('battle.backToSelection')}
                        </Button>
                        
                        {/* Test Buttons */}
                        <Button 
                            variant="contained" 
                            color="error"
                            onClick={handleTestDie}
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
                                onClick={handleCompleteDungeon}
                                style={{ marginLeft: '8px' }}
                            >
                                🏆 TEST: Complete Dungeon
                            </Button>
                        )}
                    </div>
                    
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
                            <EnemyWidget 
                                currentEnemy={currentEnemy}
                                currentBattle={currentBattle}
                                damageDisplay={damageDisplay}
                            />
                            <BattleLog 
                                battleLogVisible={battleLogVisible}
                                battleLog={battleLog}
                                onClearBattleLog={() => setBattleLog([])}
                            />
                        </div>
                        <PotionSystem 
                            currentBattle={currentBattle}
                            potions={potions}
                            autoPotionSettings={autoPotionSettings}
                            onUsePotion={handleUsePotionLocal}
                        />
                        <div className={styles.widgetContainer}>
                            <PlayerStats 
                                currentBattle={currentBattle}
                                currentEnemy={currentEnemy}
                                playerStats={playerStats}
                                playerHealth={playerHealth}
                                selectedAttackType={selectedAttackType}
                                getSelectedSkillInfo={getSelectedSkillInfoLocal}
                            />

                            <EnemyStats 
                                currentEnemy={currentEnemy}
                                currentBattle={currentBattle}
                                playerStats={playerStats}
                            />

                            <LootTable currentEnemy={currentEnemy} />

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

            <ChestDropDialog 
                chestDropDialog={chestDropDialog}
                onClose={() => setChestDropDialog({ open: false, item: null, dungeon: null })}
            />

            <DungeonCompleteDialog 
                dungeonCompleteDialog={dungeonCompleteDialog}
                onClose={() => setDungeonCompleteDialog({ open: false, countdown: 5 })}
                onLeave={() => {
                    setDungeonCompleteDialog({ open: false, countdown: 5 });
                    
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
        </div>
    );
}

export default Battle;
