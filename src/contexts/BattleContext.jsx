import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useTranslate } from '../hooks/useTranslate';
import { useNotificationContext } from './NotificationContext';
import { getPlayerStats, calculateSkillBuffsForAttackType, getEquippedItems } from '../utils/playerStats';
import { getLootDrop } from '../utils/combat';
import { recordKill } from '../utils/achievements';
import { 
    updateBattleState, 
    processPlayerAttack, 
    processEnemyAttack, 
    checkBattleResult 
} from '../utils/battleUtils';
import { LOOT_BAG_LIMIT } from '../utils/constants';
import { checkPetDrop } from '../utils/pets';
import { saveCurrentGame } from '../utils/saveManager';
import { getRandomEnemy } from '../utils/enemies';
import { 
    shouldUseAutoPotion,
    getAutoPotionSettings,
    usePotion,
    getPotions,
    POTION_TYPES
} from '../utils/potions';
import { getGold, addGold, subtractGold } from '../utils/gold';
import { getWeaponType, getAvailableAttackTypes } from '../utils/skillExperience';

// Helper functions
const getSlotKey = (key, slotNumber) => `${key}_slot_${slotNumber}`;

const getCurrentSlot = () => {
    try {
        const currentSlot = localStorage.getItem('idle-chaos-current-slot');
        return currentSlot ? parseInt(currentSlot) : 1;
    } catch (error) {
        console.error('Error getting current slot:', error);
        return 1;
    }
};

const BattleContext = createContext();

export const useBattleContext = () => {
    const context = useContext(BattleContext);
    if (!context) {
        throw new Error('useBattleContext must be used within a BattleProvider');
    }
    return context;
};

export const BattleProvider = ({ children }) => {
    const { t } = useTranslate();
    const { 
        notifyItemDrop, 
        notifyGoldGain, 
        notifyAchievement 
    } = useNotificationContext();

    // Battle state
    const [isBattleActive, setIsBattleActive] = useState(false);
    const [currentBattle, setCurrentBattle] = useState(null);
    const [currentEnemy, setCurrentEnemy] = useState(null);
    const [selectedAttackType, setSelectedAttackType] = useState('stab');
    const [isWaitingForEnemy, setIsWaitingForEnemy] = useState(false);
    const [enemySpawnProgress, setEnemySpawnProgress] = useState(0);
    const [battleLog, setBattleLog] = useState([]);
    const [damageDisplay, setDamageDisplay] = useState({ player: null, enemy: null });
    
    // Sync currentBattle.battleLog to global battleLog state
    useEffect(() => {
        if (currentBattle && currentBattle.battleLog && currentBattle.battleLog.length > 0) {
            // Only update if the length is different (new entries added)
            if (currentBattle.battleLog.length !== battleLog.length) {
                setBattleLog([...currentBattle.battleLog]);
            }
        }
    }, [currentBattle?.battleLog?.length, battleLog.length]);
    
    // Global game state
    const [lootBag, setLootBag] = useState([]);
    const [playerGold, setPlayerGold] = useState(getGold());
    const [potions, setPotions] = useState(getPotions());
    const [playerHealth, setPlayerHealth] = useState(() => {
        const currentSlot = getCurrentSlot();
        const healthSlotKey = getSlotKey("playerHealth", currentSlot);
        const savedHealth = localStorage.getItem(healthSlotKey);
        const playerStats = getPlayerStats();
        return savedHealth ? Math.min(parseInt(savedHealth), playerStats.HEALTH) : playerStats.HEALTH;
    });
    const [availableAttackTypes, setAvailableAttackTypes] = useState([]);
    
    // Death Dialog State
    const [deathDialog, setDeathDialog] = useState({
        open: false,
        countdown: 15,
        goldLost: 0,
        equipmentLost: []
    });
    
    // Dungeon State
    const [dungeonRun, setDungeonRun] = useState(null);
    
    // Refs for intervals
    const battleIntervalRef = useRef(null);
    const spawnIntervalRef = useRef(null);

    // Load battle state from localStorage on mount
    useEffect(() => {
        loadBattleState();
        loadGlobalGameState();
    }, []);

    // Save battle state to localStorage whenever it changes
    useEffect(() => {
        saveBattleState();
    }, [isBattleActive, currentBattle, currentEnemy, selectedAttackType, isWaitingForEnemy, enemySpawnProgress, damageDisplay]);

    // Save global game state to localStorage whenever it changes
    useEffect(() => {
        saveGlobalGameState();
    }, [lootBag, playerGold, potions, playerHealth]);

    // Main battle loop - runs independently of current page
    useEffect(() => {
        if (!isBattleActive || !currentBattle) {
            if (battleIntervalRef.current) {
                clearInterval(battleIntervalRef.current);
                battleIntervalRef.current = null;
            }
            return;
        }

        battleIntervalRef.current = setInterval(() => {
            setCurrentBattle(prev => {
                if (!prev) return prev;

                // Calculate skill buffs for attack speed
                const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                const attackSpeedBonus = skillBuffs.ATTACK_SPEED || 0;
                const effectiveAttackSpeed = prev.player.ATTACK_SPEED + attackSpeedBonus;
                
                const playerSpeed = Math.max(1, effectiveAttackSpeed);
                const enemySpeed = Math.max(1, Math.min(5, prev.enemy.ATTACK_SPEED));
                let newBattle = updateBattleState(prev, playerSpeed, enemySpeed);

                // Process player attack
                if (newBattle.playerProgress >= 100) {
                    newBattle = processPlayerAttack(newBattle, setDamageDisplay, selectedAttackType);
                }

                // Process enemy attack
                if (newBattle.enemyProgress >= 100) {
                    newBattle = processEnemyAttack(newBattle, setDamageDisplay);
                }

                // Check for battle result
                const battleResult = checkBattleResult(newBattle);
                if (battleResult) {
                    handleBattleEnd(battleResult, newBattle);
                    return prev; // Return previous state as we handle the end separately
                }

                // Auto-potion check
                checkAutoPotion(newBattle);

                // Force re-render by creating new battle object
                return { ...newBattle };
            });
        }, 200); // 200ms interval for smooth battle

        return () => {
            if (battleIntervalRef.current) {
                clearInterval(battleIntervalRef.current);
                battleIntervalRef.current = null;
            }
        };
    }, [isBattleActive, currentBattle, selectedAttackType]);

    // Enemy spawn timer
    useEffect(() => {
        if (!isWaitingForEnemy) {
            if (spawnIntervalRef.current) {
                clearInterval(spawnIntervalRef.current);
                spawnIntervalRef.current = null;
            }
            return;
        }

        spawnIntervalRef.current = setInterval(() => {
            setEnemySpawnProgress(prev => {
                const newProgress = prev + 2; // 2% per interval
                if (newProgress >= 100) {
                    setIsWaitingForEnemy(false);
                    setEnemySpawnProgress(0);
                    spawnNewEnemy();
                    return 0;
                }
                return newProgress;
            });
        }, 100); // 100ms for smooth progress

        return () => {
            if (spawnIntervalRef.current) {
                clearInterval(spawnIntervalRef.current);
                spawnIntervalRef.current = null;
            }
        };
    }, [isWaitingForEnemy]);

    // Update attack types when equipment changes
    useEffect(() => {
        const updateAttackTypes = () => {
            const currentSlot = getCurrentSlot();
            const slotKey1 = getSlotKey("equippedItems", currentSlot);
            const slotKey2 = getSlotKey("idle-chaos-equipped-items", currentSlot);
            const equippedItems1 = JSON.parse(localStorage.getItem(slotKey1) || "{}");
            const equippedItems2 = JSON.parse(localStorage.getItem(slotKey2) || "{}");
            
            const equippedWeapon = equippedItems1.weapon || equippedItems2.weapon;
            const weaponType = getWeaponType(equippedWeapon);
            const attackTypes = getAvailableAttackTypes(weaponType);
            
            setAvailableAttackTypes(attackTypes);
            
            // If current selected attack type is not available, select the first one
            if (!attackTypes.find(at => at.type === selectedAttackType)) {
                setSelectedAttackType(attackTypes[0]?.type || 'stab');
            }
        };

        updateAttackTypes();
        
        // Listen for equipment changes - check every 2 seconds
        const interval = setInterval(updateAttackTypes, 2000);
        
        // Also listen for storage events (other tabs)
        const handleStorageChange = () => {
            updateAttackTypes();
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [selectedAttackType]);

    // Update player stats when equipment changes
    useEffect(() => {
        const checkPlayerStatsChanges = () => {
            const currentPlayerStats = getPlayerStats();
            
            // Update health if max health changed
            const newMaxHealth = currentPlayerStats.HEALTH;
            setPlayerHealth(prev => Math.min(prev, newMaxHealth));
            
            // Update current battle if active
            if (currentBattle) {
                setCurrentBattle(prev => ({
                    ...prev,
                    player: { 
                        ...currentPlayerStats, 
                        currentHealth: Math.min(prev.player.currentHealth, newMaxHealth),
                        maxHealth: newMaxHealth
                    }
                }));
            }
        };

        const interval = setInterval(checkPlayerStatsChanges, 1000);
        
        const handleFocus = () => {
            checkPlayerStatsChanges();
        };
        
        window.addEventListener('focus', handleFocus);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
        };
    }, [currentBattle]);

    const loadBattleState = () => {
        try {
            const currentSlot = getCurrentSlot();
            const battleStateKey = getSlotKey('battle-state', currentSlot);
            const savedState = localStorage.getItem(battleStateKey);
            
            if (savedState) {
                const state = JSON.parse(savedState);
                setIsBattleActive(state.isBattleActive || false);
                setCurrentBattle(state.currentBattle || null);
                setCurrentEnemy(state.currentEnemy || null);
                setSelectedAttackType(state.selectedAttackType || 'stab');
                setIsWaitingForEnemy(state.isWaitingForEnemy || false);
                setEnemySpawnProgress(state.enemySpawnProgress || 0);
                setBattleLog(state.battleLog || []);
                setDamageDisplay(state.damageDisplay || { player: null, enemy: null });
            }
        } catch (error) {
            console.error('Error loading battle state:', error);
        }
    };

    const loadGlobalGameState = () => {
        try {
            const currentSlot = getCurrentSlot();
            
            // Load loot bag
            const lootBagKey = getSlotKey("lootBag", currentSlot);
            const savedLootBag = localStorage.getItem(lootBagKey);
            if (savedLootBag) {
                setLootBag(JSON.parse(savedLootBag));
            }

            // Load player gold
            setPlayerGold(getGold());

            // Load potions
            setPotions(getPotions());

            // Load player health
            const healthSlotKey = getSlotKey("playerHealth", currentSlot);
            const savedHealth = localStorage.getItem(healthSlotKey);
            const playerStats = getPlayerStats();
            if (savedHealth) {
                setPlayerHealth(Math.min(parseInt(savedHealth), playerStats.HEALTH));
            } else {
                setPlayerHealth(playerStats.HEALTH);
            }

        } catch (error) {
            console.error('Error loading global game state:', error);
        }
    };

    const saveBattleState = () => {
        try {
            const currentSlot = getCurrentSlot();
            const battleStateKey = getSlotKey('battle-state', currentSlot);
            const state = {
                isBattleActive,
                currentBattle,
                currentEnemy,
                selectedAttackType,
                isWaitingForEnemy,
                enemySpawnProgress,
                battleLog: battleLog.slice(-50), // Keep only last 50 log entries
                damageDisplay
            };
            localStorage.setItem(battleStateKey, JSON.stringify(state));
        } catch (error) {
            console.error('Error saving battle state:', error);
        }
    };

    const saveGlobalGameState = () => {
        try {
            const currentSlot = getCurrentSlot();
            
            // Save loot bag
            const lootBagKey = getSlotKey("lootBag", currentSlot);
            localStorage.setItem(lootBagKey, JSON.stringify(lootBag));

            // Save player health
            const healthSlotKey = getSlotKey("playerHealth", currentSlot);
            localStorage.setItem(healthSlotKey, playerHealth.toString());

            // Gold and potions are handled by their respective utility functions

        } catch (error) {
            console.error('Error saving global game state:', error);
        }
    };

    const startBattle = (enemy, attackType = 'stab') => {
        if (!enemy) return;

        const currentPlayerStats = getPlayerStats();
        const currentHealth = Math.min(playerHealth, currentPlayerStats.HEALTH);

        const battleState = {
            player: {
                ...currentPlayerStats,
                currentHealth: currentHealth,
                maxHealth: currentPlayerStats.HEALTH
            },
            enemy: {
                ...enemy,
                currentHealth: enemy.maxHp || enemy.HEALTH,
                maxHealth: enemy.maxHp || enemy.HEALTH,
                HEALTH: enemy.maxHp || enemy.HEALTH
            },
            playerProgress: 0,
            enemyProgress: 0,
            battleLog: []
        };

        setCurrentEnemy(enemy);
        setCurrentBattle(battleState);
        setSelectedAttackType(attackType);
        setIsBattleActive(true);
        setIsWaitingForEnemy(false);
        setEnemySpawnProgress(0);
        
        setBattleLog(prev => [...prev, {
            type: 'battle_start',
            message: `${t('battle.battleStarted')}: ${enemy.name}`
        }]);
    };

    const stopBattle = () => {
        setIsBattleActive(false);
        setCurrentBattle(null);
        setCurrentEnemy(null);
        setIsWaitingForEnemy(false);
        setEnemySpawnProgress(0);
    };

    const handleBattleEnd = (battleResult, battle) => {
        setIsBattleActive(false);
        
        // Update player health
        setPlayerHealth(battleResult.playerFinalHealth);

        if (battleResult.winner === 'player') {
            handlePlayerVictory(battle);
        } else {
            handlePlayerDefeat();
        }
    };

    const handlePlayerVictory = (battle) => {
        if (!currentEnemy) return;

        // Record achievement for enemy kill
        const achievementResult = recordKill(currentEnemy.id);
        
        // Check if we're in a dungeon - if so, don't drop loot from individual enemies
        const isInDungeon = dungeonRun && !dungeonRun.completed;
        
        if (!isInDungeon) {
            // Get loot drops (only for location battles, not dungeon)
            const lootResult = getLootDrop(currentEnemy.drops);
            
            // Handle gold drops
            if (lootResult.goldItems && lootResult.goldItems.length > 0) {
                const newGold = addGold(lootResult.gold);
                setPlayerGold(newGold);
                if (lootResult.gold > 0) {
                    notifyGoldGain(lootResult.gold, `${currentEnemy.name} drops`);
                }
            }
            
            // Handle item drops to loot bag
            if (lootResult.items.length > 0) {
                const availableSpace = LOOT_BAG_LIMIT - lootBag.length;
                const itemsToAdd = lootResult.items.slice(0, availableSpace);
                
                setLootBag(prev => [...prev, ...itemsToAdd]);
                
                // Notify for each item drop
                itemsToAdd.forEach(itemName => {
                    notifyItemDrop(itemName, '📦');
                });
            }

            // Handle pet drops (only for location battles)
            const pet = checkPetDrop(currentEnemy.id);
            if (pet) {
                const currentSlot = getCurrentSlot();
                const petKey = getSlotKey('idle-chaos-pets', currentSlot);
                const ownedPets = JSON.parse(localStorage.getItem(petKey) || '[]');
                if (!ownedPets.includes(pet.id)) {
                    ownedPets.push(pet.id);
                    localStorage.setItem(petKey, JSON.stringify(ownedPets));
                }
            }
        }

        // Handle achievements (always awarded regardless of dungeon/location)
        if (achievementResult.newAchievements.length > 0) {
            achievementResult.newAchievements.forEach(achievement => {
                notifyAchievement(achievement.description);
            });
        }

        // Add battle log entries
        const victoryMessages = [
            {
                type: 'victory',
                message: `🎉 ${currentEnemy.name} defeated!`
            }
        ];

        setBattleLog(prev => [...prev, ...victoryMessages]);

        // Auto save
        setTimeout(() => {
            saveCurrentGame();
        }, 1000);

        // Start enemy spawn timer (for both location and dungeon battles)
        // But for final dungeon stage, go immediately to completion
        const isFinalDungeonStage = dungeonRun && !dungeonRun.completed && dungeonRun.currentStage >= 6;
        if (isFinalDungeonStage) {
            // Final stage - complete immediately without timer
            setTimeout(() => {
                spawnNewEnemy();
            }, 500);
        } else {
            startEnemySpawnTimer();
        }
    };

    const handlePlayerDefeat = () => {
        setBattleLog(prev => [...prev, {
            type: 'defeat',
            message: `💀 ${t('battle.playerDefeated')}`
        }]);

        // Stop battle and wait for manual restart
        setCurrentBattle(null);
        setCurrentEnemy(null);
        setIsWaitingForEnemy(false);
        setEnemySpawnProgress(0);
        
        // Show death dialog
        showDeathDialog();
    };

    const startEnemySpawnTimer = () => {
        setBattleLog(prev => [...prev, {
            type: 'info',
            message: t('battle.searchingForEnemy')
        }]);
        
        setIsWaitingForEnemy(true);
        setEnemySpawnProgress(0);
    };

    // Store enemies data and other callbacks from Battle.jsx
    const [enemiesData, setEnemiesData] = useState(null);
    const [dungeonCompleteCallback, setDungeonCompleteCallback] = useState(null);

    const handleDungeonEnemyDefeated = () => {
        if (!dungeonRun || !enemiesData) return;
        
        if (dungeonRun.currentStage < 6) {
            const nextStage = dungeonRun.currentStage + 1;
            setDungeonRun(prev => ({ ...prev, currentStage: nextStage }));
            const nextEnemy = Object.values(enemiesData).find(e => e.id === dungeonRun.stages[nextStage]);
            
            if (nextEnemy) {
                // Set current enemy first, then start battle
                setCurrentEnemy(nextEnemy);
                
                // Keep battle active during dungeon progression
                setIsBattleActive(true);
                
                // Start next battle
                setTimeout(() => {
                    if (nextEnemy) {
                        startBattle(nextEnemy, selectedAttackType);
                    }
                }, 100);
            }
                         } else {
            setDungeonRun(prev => ({ ...prev, completed: true }));
            setIsBattleActive(false);
            
            // Add dungeon chest loot to loot bag
            if (!dungeonRun.chestAwarded && dungeonRun.dungeon && dungeonRun.dungeon.chest) {
                const chestLoot = [];
                
                // Process chest items based on their chance
                dungeonRun.dungeon.chest.forEach(chestItem => {
                    const roll = Math.random() * 100;
                    if (roll <= chestItem.chance) {
                        chestLoot.push(chestItem.name);
                    }
                });
                
                // Add chest loot to loot bag if there's space
                if (chestLoot.length > 0) {
                    const availableSpace = LOOT_BAG_LIMIT - lootBag.length;
                    const itemsToAdd = chestLoot.slice(0, availableSpace);
                    
                    setLootBag(prev => [...prev, ...itemsToAdd]);
                    
                    // Notify for each chest item
                    itemsToAdd.forEach(itemName => {
                        notifyItemDrop(itemName, '🎁');
                    });
                    
                    // Add a general chest notification
                    setBattleLog(prev => [...prev, {
                        type: 'chest_opened',
                        message: `🎁 ${dungeonRun.dungeon.name} chest opened! Found ${itemsToAdd.length} items.`
                    }]);
                }
                
                setDungeonRun(prev => ({ ...prev, chestAwarded: true }));
            }
            
            // Trigger dungeon complete callback
            if (dungeonCompleteCallback) {
                dungeonCompleteCallback();
            }
        }
    };

    const spawnNewEnemy = () => {
        // Check if we're in a dungeon
        if (dungeonRun && !dungeonRun.completed) {
            handleDungeonEnemyDefeated();
            return;
        }
        
        // Location logic: spawn same enemy type
        if (!currentEnemy) return;
        
        const nextEnemy = { ...currentEnemy };
        setCurrentEnemy(nextEnemy);
        
        // Small delay before starting next battle
        setTimeout(() => {
            // Use the same health logic as startBattle
            const enemyMaxHealth = nextEnemy.maxHp || nextEnemy.HEALTH;
            const battleState = {
                player: {
                    ...getPlayerStats(),
                    currentHealth: playerHealth,
                    maxHealth: getPlayerStats().HEALTH
                },
                enemy: {
                    ...nextEnemy,
                    currentHealth: enemyMaxHealth,
                    maxHealth: enemyMaxHealth,
                    HEALTH: enemyMaxHealth
                },
                playerProgress: 0,
                enemyProgress: 0,
                battleLog: []
            };
            
            setCurrentBattle(battleState);
            setIsBattleActive(true);
        }, 500);
    };

    const checkAutoPotion = (battle) => {
        const autoPotionSettings = getAutoPotionSettings();
        if (!autoPotionSettings.enabled) return;
        
        const potionToUse = shouldUseAutoPotion(
            battle.player.currentHealth,
            battle.player.HEALTH
        );
        
        if (potionToUse) {
            const result = usePotion(potionToUse);
            if (result.success) {
                // Update potions state
                setPotions(result.remainingPotions);
                
                // Update battle health
                const newHealth = Math.min(
                    battle.player.currentHealth + result.healAmount,
                    battle.player.HEALTH
                );
                
                setCurrentBattle(prev => ({
                    ...prev,
                    player: { 
                        ...prev.player, 
                        currentHealth: newHealth
                    }
                }));

                // Update global player health
                setPlayerHealth(newHealth);
            }
        }
    };

    // Utility functions for managing global state
    const handleUsePotion = (potionType) => {
        const result = usePotion(potionType);
        if (result.success) {
            setPotions(result.remainingPotions);
            
            // Heal the player
            if (currentBattle) {
                const newHealth = Math.min(
                    currentBattle.player.currentHealth + result.healAmount,
                    currentBattle.player.HEALTH
                );
                
                setCurrentBattle(prev => ({
                    ...prev,
                    player: { ...prev.player, currentHealth: newHealth }
                }));
                
                setPlayerHealth(newHealth);
            } else {
                // Heal even when not in battle
                const newHealth = Math.min(playerHealth + result.healAmount, getPlayerStats().HEALTH);
                setPlayerHealth(newHealth);
            }
            
            return { success: true, healAmount: result.healAmount };
        }
        return { success: false };
    };

    const addToLootBag = (items) => {
        if (!Array.isArray(items)) items = [items];
        
        const availableSpace = LOOT_BAG_LIMIT - lootBag.length;
        const itemsToAdd = items.slice(0, availableSpace);
        
        setLootBag(prev => [...prev, ...itemsToAdd]);
        return itemsToAdd;
    };

    const removeFromLootBag = (index) => {
        setLootBag(prev => prev.filter((_, idx) => idx !== index));
    };

    const clearLootBag = () => {
        setLootBag([]);
    };

    const updatePlayerGold = (amount) => {
        const newGold = addGold(amount);
        setPlayerGold(newGold);
        return newGold;
    };

    const subtractPlayerGold = (amount) => {
        const newGold = subtractGold(amount);
        setPlayerGold(newGold);
        return newGold;
    };

    // Death handling functions
    const applyDeathPenalties = () => {
        const penalties = { goldLost: 0, equipmentLost: [] };
        
        // Gold loss - lose half of current gold
        const currentGold = playerGold;
        const goldLoss = Math.floor(currentGold / 2);
        if (goldLoss > 0) {
            subtractPlayerGold(goldLoss);
            penalties.goldLost = goldLoss;
        }
        
        // Equipment loss - random chance for each equipped item
        const equippedItems = getEquippedItems();
        const currentSlot = getCurrentSlot();
        const equipmentSlotKey = getSlotKey('idle-chaos-equipped-items', currentSlot);
        const updatedEquippedItems = { ...equippedItems };
        
        Object.entries(equippedItems).forEach(([slot, item]) => {
            if (item && Math.random() < 0.25) { // 25% chance to lose each item
                penalties.equipmentLost.push({ slot, item: item.name || item.type || 'Unknown Item' });
                delete updatedEquippedItems[slot];
            }
        });
        
        if (penalties.equipmentLost.length > 0) {
            localStorage.setItem(equipmentSlotKey, JSON.stringify(updatedEquippedItems));
        }
        
        return penalties;
    };

    const showDeathDialog = () => {
        // Apply death penalties
        const penalties = applyDeathPenalties();
        
        setDeathDialog({
            open: true,
            countdown: 15,
            goldLost: penalties.goldLost,
            equipmentLost: penalties.equipmentLost
        });
        
        const countdownInterval = setInterval(() => {
            setDeathDialog(prev => {
                if (prev.countdown <= 1) {
                    clearInterval(countdownInterval);
                    respawnPlayer();
                    return { open: false, countdown: 15, goldLost: 0, equipmentLost: [] };
                }
                return { ...prev, countdown: prev.countdown - 1 };
            });
        }, 1000);
    };

    const respawnPlayer = () => {
        const currentPlayerStats = getPlayerStats();
        setPlayerHealth(currentPlayerStats.HEALTH);
        
        // If was in dungeon, exit dungeon on death
        if (dungeonRun && !dungeonRun.completed) {
            // Clear all battle state and exit dungeon
            setCurrentBattle(null);
            setCurrentEnemy(null);
            setIsBattleActive(false);
            setIsWaitingForEnemy(false);
            setEnemySpawnProgress(0);
            setDungeonRun(null);
        } else {
            // For location battles, continue with same enemy after respawn
            if (currentEnemy) {
                // Reset battle state but keep current enemy
                setCurrentBattle(null);
                setIsBattleActive(false);
                setIsWaitingForEnemy(false);
                setEnemySpawnProgress(0);
                
                // Restart battle with same enemy after a short delay
                setTimeout(() => {
                    startBattle(currentEnemy, selectedAttackType);
                }, 1000);
            } else {
                // No enemy to continue with, clear everything
                setCurrentBattle(null);
                setCurrentEnemy(null);
                setIsBattleActive(false);
                setIsWaitingForEnemy(false);
                setEnemySpawnProgress(0);
            }
        }
        
        // Close death dialog
        setDeathDialog({ open: false, countdown: 15, goldLost: 0, equipmentLost: [] });
    };

    const value = {
        // Battle State
        isBattleActive,
        currentBattle,
        currentEnemy,
        selectedAttackType,
        isWaitingForEnemy,
        enemySpawnProgress,
        battleLog,
        damageDisplay,
        availableAttackTypes,
        
        // Global Game State
        lootBag,
        playerGold,
        potions,
        playerHealth,
        deathDialog,
        dungeonRun,
        setDungeonRun,
        
        // Battle Actions
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
        
        // Global State Actions
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
        setEnemiesData,
        setDungeonCompleteCallback,
        
        // Utilities
        saveBattleState,
        loadBattleState,
        loadGlobalGameState,
        saveGlobalGameState
    };

    return (
        <BattleContext.Provider value={value}>
            {children}
        </BattleContext.Provider>
    );
}; 