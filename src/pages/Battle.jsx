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
    getCurrentSlot,
    getStatDisplayWithAchievement,
    getEnemyHpDisplayWithAchievement
} from "../utils/battleUtils.jsx";
import { getSkillData, initializeSkillDataForCurrentSlot } from "../utils/skillExperience.js";
import { getPlayerStats } from "../utils/playerStats.js";

import { 
    getAutoPotionSettings,
    saveAutoPotionSettings
} from "../utils/potions.js";
import { recordKill, isAchievementUnlocked } from "../utils/achievements.js";
import { useTranslate } from "../hooks/useTranslate";
import { convertLootBagToEquipment } from "../utils/equipmentGenerator.js";
import { getLootDrop } from "../utils/combat.js";
import { checkPetDrop } from "../utils/pets.js";
import { saveCurrentGame } from "../utils/saveManager.js";
import { getRandomPotionDrop, getRandomTestPotion } from "../utils/potionUtils.js";
import { addPotions } from "../utils/potions.js";

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
import SkillExpWidget from "../components/SkillExpWidget";

import {
    handleTestDropPotion,
    handleTestHurtSelf,
    handleKillEnemy,
    handleTestDie,
    handleCompleteDungeon,
    completeDungeonRun
} from '../utils/BattleTestUtils';


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
        setDungeonCompleteCallback,
        refreshPotions,
        checkAutoPotion,
        handleDungeonEnemyDefeated
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
            removeFromLootBag(index);

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

    const handleSellItem = (itemName, index) => {
        const sellValue = calculateItemSellValue(itemName);
        
        try {
            removeFromLootBag(index);
            updatePlayerGold(sellValue);
            notifyItemSale(itemName, sellValue, '💰');
        } catch (err) {
            console.error('Error selling item:', err);
        }
    };

    const handleTakeAll = () => {
        try {
            const itemsToConvert = [...lootBag];
            
            clearLootBag();

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

    const handleSellAll = () => {
        try {
            let totalGold = 0;
            const itemCount = lootBag.length;
            lootBag.forEach(itemName => {
                totalGold += calculateItemSellValue(itemName);
            });
            
            clearLootBag();

            updatePlayerGold(totalGold);
            
            if (itemCount > 0 && totalGold > 0) {
                notifyBulkSale(itemCount, totalGold);
            }
        } catch (err) {
            console.error('Error selling all items:', err);
        }
    };

    const handleUsePotionLocal = (potionType) => {
        const result = handleUsePotion(potionType);
        if (result.success) {
            setTimeout(() => {
                saveCurrentGame();
            }, 500);
        }
        return result;
    };

    const handleBackToSelection = () => {
        if (dungeonRun && !dungeonRun.completed) {
            setExitWarningOpen(true);
            return;
        }
        navigate('/battle-selection');
        stopBattle();
        setDungeonRun(null);
    };







    const getSelectedSkillInfoLocal = () => {
        return getSelectedSkillInfo(selectedAttackType, getSkillData);
    };

    const getStatDisplayWithAchievementLocal = (enemyId, statType, value) => {
        return getStatDisplayWithAchievement(enemyId, statType, value, isAchievementUnlocked);
    };

    const getEnemyHpDisplayWithAchievementLocal = (enemyId, current, max) => {
        return getEnemyHpDisplayWithAchievement(enemyId, current, max, isAchievementUnlocked);
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
                if (!autoPotionSettings.enabled) {
                    const newSettings = { ...autoPotionSettings, enabled: true };
                    setAutoPotionSettings(newSettings);
                    saveAutoPotionSettings(newSettings);
                }
            }
        };

        const interval = setInterval(checkAutoPotionBuff, 5000);
        checkAutoPotionBuff();
        
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const checkAutoPotionUsage = () => {
            if (autoPotionSettings.enabled && currentBattle && isBattleActive) {
                checkAutoPotion(currentBattle);
            }
        };

        const interval = setInterval(checkAutoPotionUsage, 1000);
        checkAutoPotionUsage();
        
        return () => clearInterval(interval);
    }, [autoPotionSettings.enabled, currentBattle, isBattleActive]);
    useEffect(() => {
        initializeSkillDataForCurrentSlot();
    }, []);


    const confirmExitDungeon = () => {
        setExitWarningOpen(false);
        
        setCurrentEnemy(null);
        setCurrentBattle(null);
        setIsBattleActive(false);
        setDungeonRun(null);     
        stopBattle();
    };

    const handleChestClick = (chestItem, index) => {
        if (chestItem && chestItem.includes('🎁') && chestItem.includes('Chest')) {
            const dungeonName = chestItem.replace('🎁 ', '').replace(' Chest', '');
            const dungeon = DUNGEONS.find(d => d.name === dungeonName);
            setChestPreviewModal({ open: true, dungeon, chestItem: null });
            return;
        }
        handleChestClickLogic(chestItem, index, DUNGEONS, handleTakeItem, setChestPreviewModal);
    };

    const handleOpenChest = () => {
        if (chestPreviewModal.open && chestPreviewModal.dungeon) {
            const chestName = `🎁 ${chestPreviewModal.dungeon.name} Chest`;
            setLootBag(prev => prev.filter(item => item !== chestName));
        }
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
            setLootBag(prev => {
                const updated = prev.filter(item => item !== chestPreviewModal.chestItem);
                const currentSlot = getCurrentSlot();
                const slotKey = getSlotKey("lootBag", currentSlot);
                localStorage.setItem(slotKey, JSON.stringify(updated));
                return updated;
            });
        }
    };

    useEffect(() => {
        if (dungeonCompleteDialog.open && dungeonCompleteDialog.countdown > 0) {
            const timer = setTimeout(() => {
                setDungeonCompleteDialog(prev => {
                    if (prev.countdown <= 1) {
                        setDungeonCompleteDialog({ open: false, countdown: 5 });

                        const currentDungeon = dungeonRun?.dungeon;
                        if (currentDungeon) {
                            setDungeonRun({
                                dungeon: currentDungeon,
                                currentStage: 0,
                                completed: false,
                                chestAwarded: false,
                                stages: currentDungeon.enemies || []
                            });

                            const firstEnemyId = currentDungeon.enemies[0];
                            const firstEnemy = Object.values(enemies).find(e => e.id === firstEnemyId);
                            if (firstEnemy) {
                                startBattle(firstEnemy, selectedAttackType);
                            }
                        }

                        return { open: false, countdown: 5 };
                    }
                    if (prev.countdown === 1 && dungeonRun && dungeonRun.dungeon && !dungeonRun.chestAwarded) {
                        const chestName = `🎁 ${dungeonRun.dungeon.name} Chest`;
                        if (!lootBag.includes(chestName)) {
                            setLootBag([...lootBag, chestName]);
                        }
                        setDungeonRun({ ...dungeonRun, chestAwarded: true });
                    }
                    return { ...prev, countdown: prev.countdown - 1 };
                });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [dungeonCompleteDialog, dungeonRun, lootBag]);

    useEffect(() => {
        if (!isBattleActive && !dungeonRun && !isWaitingForEnemy) {
            navigate('/battle-selection');
        }
    }, [isBattleActive, dungeonRun, isWaitingForEnemy, navigate]);

    return (
        <div className={styles.root}>
            {(isBattleActive || dungeonRun || isWaitingForEnemy) && (
                <>
                    <div className={dungeonRun ? styles.dungeonHeader : styles.battleHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                            <Button 
                                variant="outlined" 
                                onClick={handleBackToSelection}
                                className={styles.backButton}
                                style={{ minWidth: 0 }}
                            >
                                {t('battle.backToSelection')}
                            </Button>
                        </div>
                        <div style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {dungeonRun ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Typography variant="h6" align="center">{dungeonRun.dungeon.name}</Typography>
                                    <Typography variant="subtitle1" align="center">{t('battle.dungeonStage', { stage: dungeonRun.currentStage + 1 })}</Typography>
                                </div>
                            ) : (
                                <Typography variant="h6" align="center">
                                    {(() => {
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
                        </div>
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Button 
                                variant="contained" 
                                color="error"
                                onClick={() => handleTestDie({ setIsBattleActive, showDeathDialog })}
                                style={{ marginLeft: '8px' }}
                            >
                                🏴‍☠️ TEST: Die
                            </Button>
                            <Button 
                                variant="contained" 
                                color="success"
                                onClick={() => handleKillEnemy({
                                    currentBattle, currentEnemy, setCurrentBattle, setIsBattleActive, setPlayerHealth, recordKill, dungeonRun, getLootDrop, updatePlayerGold, notifyGoldGain, addToLootBag, notifyItemDrop, getRandomPotionDrop, addPotions, refreshPotions, checkPetDrop, getCurrentSlot, getSlotKey, setBattleLog, notifyAchievement, t, spawnNewEnemy
                                })}
                                style={{ marginLeft: '8px' }}
                            >
                                ⚔️ TEST: Kill
                            </Button>
                            <Button 
                                variant="contained" 
                                color="info"
                                onClick={() => handleTestDropPotion({ getRandomTestPotion, addPotions, notifyItemDrop, refreshPotions })}
                                style={{ marginLeft: '8px' }}
                            >
                                🧪 TEST: Drop Potion
                            </Button>
                            <Button 
                                variant="contained" 
                                color="warning"
                                onClick={() => handleTestHurtSelf({ currentBattle, setCurrentBattle, setPlayerHealth, playerHealth, setDamageDisplay, setBattleLog })}
                                style={{ marginLeft: '8px' }}
                            >
                                💔 TEST: Hurt Self
                            </Button>
                            {dungeonRun && !dungeonRun.completed && (
                                <Button 
                                    variant="contained" 
                                    color="warning"
                                    onClick={() => handleCompleteDungeon({ dungeonRun, setDungeonRun, setIsBattleActive, setCurrentBattle, setCurrentEnemy, lootBag, setLootBag, setDungeonCompleteDialog })}
                                    style={{ marginLeft: '8px' }}
                                >
                                    🏆 TEST: Complete Dungeon
                                </Button>
                            )}
                        </div>
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
                            <PotionSystem 
                                currentBattle={currentBattle}
                                potions={potions}
                                autoPotionSettings={autoPotionSettings}
                                onUsePotion={handleUsePotionLocal}
                                onAutoPotionSettingsChange={(newSettings) => {
                                    setAutoPotionSettings(newSettings);
                                    saveAutoPotionSettings(newSettings);
                                }}
                            />
                            <EnemyWidget 
                                currentEnemy={currentEnemy}
                                currentBattle={currentBattle}
                                damageDisplay={damageDisplay}
                                getStatDisplayWithAchievement={getStatDisplayWithAchievementLocal}
                                getEnemyHpDisplayWithAchievement={getEnemyHpDisplayWithAchievementLocal}
                                spawnTimerUI={isWaitingForEnemy ? (
                                    <div className={styles.spawnTimerContainer}>
                                        <span className={styles.spawnTimerLabel}>
                                            {t('battle.enemyRespawn', 'Yeni düşman için geri sayım:')}
                                        </span>
                                        <span className={styles.spawnTimerCountdown}>
                                            {`${Math.ceil(5 - (enemySpawnProgress / 20))} sn`}
                                        </span>
                                    </div>
                                ) : null}
                            />
                            <BattleLog 
                                battleLogVisible={battleLogVisible}
                                battleLog={battleLog}
                                onClearBattleLog={() => setBattleLog([])}
                            />
                        </div>
                        
                        <div style={{ display: 'flex', width: '100%', marginTop: '8px' }}>
                            <SkillExpWidget selectedAttackType={selectedAttackType} />
                        </div>
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

                            {!(dungeonRun && !dungeonRun.completed) && (
                                <LootTable currentEnemy={currentEnemy} />
                            )}

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
