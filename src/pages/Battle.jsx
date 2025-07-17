import { useEffect, useState } from "react";
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
    Tabs,
    Tab,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { LocalDrink } from "@mui/icons-material";
import { getLootDrop, saveLoot } from "../utils/combat.js";
import enemies, { LOCATIONS, DUNGEONS } from "../utils/enemies.js";
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
    createSpawnTimer 
} from "../utils/battleUtils.js";
import { awardBattleActionXP, getWeaponType, getAvailableAttackTypes, getSkillData, initializeSkillDataForCurrentSlot } from "../utils/skillExperience.js";
import { getPlayerStats, getEquipmentBonuses, calculateSkillBuffs, calculateSkillBuffsForAttackType, getEquippedItems } from "../utils/playerStats.js";
import { getRandomEnemy } from "../utils/enemies.js";
import { getGold, addGold, formatGold, subtractGold } from "../utils/gold.js";
import { 
    POTION_TYPES, 
    getPotions, 
    usePotion, 
    shouldUseAutoPotion,
    getAutoPotionSettings,
    saveAutoPotionSettings
} from "../utils/potions.js";
import { recordKill, isAchievementUnlocked } from "../utils/achievements.js";
import { useTranslate } from "../hooks/useTranslate";
import { convertLootBagToEquipment } from "../utils/equipmentGenerator.js";
import { checkPetDrop, getPetByEnemy } from "../utils/pets.js";
import { saveCurrentGame } from "../utils/saveManager.js";
import { getEnemyById } from "../utils/enemies.js";
import { LOOT_BAG_LIMIT } from "../utils/constants.js";

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

function Battle({ player }) {
    const [battleMode, setBattleMode] = useState('selection');
    const [currentEnemy, setCurrentEnemy] = useState(null);
    const [selectedCharacter, setSelectedCharacter] = useState('warrior');
    const [playerStats, setPlayerStats] = useState(getPlayerStats());
    const [playerHealth, setPlayerHealth] = useState(playerStats.HEALTH);
    const { t } = useTranslate();

    const [lootBag, setLootBag] = useState([]);
    const [playerGold, setPlayerGold] = useState(getGold());
    // Potion state
    const [potions, setPotions] = useState(getPotions());
    const [autoPotionSettings, setAutoPotionSettings] = useState(getAutoPotionSettings());
    const [lastPotionUsed, setLastPotionUsed] = useState(null);
    const [battleResult, setBattleResult] = useState(null);
    const [battleLog, setBattleLog] = useState([]);
    const [isBattleActive, setIsBattleActive] = useState(false);
    const [currentBattle, setCurrentBattle] = useState(null);
    const [damageDisplay, setDamageDisplay] = useState({ player: null, enemy: null });
    const [isWaitingForEnemy, setIsWaitingForEnemy] = useState(false);
    const [enemySpawnProgress, setEnemySpawnProgress] = useState(0);
    const [deathDialog, setDeathDialog] = useState({ open: false, countdown: 15, goldLost: 0, equipmentLost: [] });
    const [battleLogVisible, setBattleLogVisible] = useState(true);
    const [selectedAttackType, setSelectedAttackType] = useState('stab');
    const [availableAttackTypes, setAvailableAttackTypes] = useState([]);
    const [battleTab, setBattleTab] = useState('locations');
    const [openLocations, setOpenLocations] = useState(() => LOCATIONS.map((_, i) => i === 0));
    const [openDungeons, setOpenDungeons] = useState(() => DUNGEONS.map((_, i) => i === 0));
    const [dungeonRun, setDungeonRun] = useState(null); // { dungeon, stages, currentStage, completed, chestAwarded }
    const [exitWarningOpen, setExitWarningOpen] = useState(false);
    const [dungeonCompleteDialog, setDungeonCompleteDialog] = useState({ open: false, countdown: 5 });
    const [chestDropDialog, setChestDropDialog] = useState({ open: false, item: null, dungeon: null });
    const [chestPreviewModal, setChestPreviewModal] = useState({ open: false, dungeon: null, chestItem: null });

    // Calculate item sell value based on estimated rarity and level
    const calculateItemSellValue = (itemName) => {
        // Base values per estimated rarity (based on item name patterns)
        const baseValues = {
            common: 10,
            uncommon: 25,
            rare: 60,
            epic: 150,
            legendary: 400
        };
        
        // Estimate rarity based on item name patterns
        let rarity = 'common';
        const itemLower = itemName.toLowerCase();
        
        if (itemLower.includes('legendary') || itemLower.includes('dragon') || itemLower.includes('celestial') || itemLower.includes('ancient') || itemLower.includes('void')) {
            rarity = 'legendary';
        } else if (itemLower.includes('epic') || itemLower.includes('demon') || itemLower.includes('infernal') || itemLower.includes('archdemon')) {
            rarity = 'epic';
        } else if (itemLower.includes('rare') || itemLower.includes('bone') || itemLower.includes('spider') || itemLower.includes('skeleton')) {
            rarity = 'rare';
        } else if (itemLower.includes('uncommon') || itemLower.includes('slime') || itemLower.includes('orc')) {
            rarity = 'uncommon';
        }
        
        // Deterministic level based on item name (same item = same level)
        let hash = 0;
        for (let i = 0; i < itemName.length; i++) {
            const char = itemName.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        const estimatedLevel = Math.abs(hash % 50) + 1; // 1-50 range
        const levelMultiplier = 1 + (estimatedLevel - 1) * 0.1;
        
        const rarityMultiplier = baseValues[rarity];
        const totalValue = Math.floor(rarityMultiplier * levelMultiplier);
        
        return Math.max(5, totalValue); // Minimum 5 gold
    };

    // Take item from loot bag to inventory
    const handleTakeItem = (itemName, index) => {
        try {
            // Remove from loot bag
            setLootBag(prev => {
                const updated = prev.filter((_, idx) => idx !== index);
                const currentSlot = getCurrentSlot();
                const slotKey = getSlotKey("lootBag", currentSlot);
                localStorage.setItem(slotKey, JSON.stringify(updated));
                return updated;
            });

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
            setLootBag(prev => {
                const updated = prev.filter((_, idx) => idx !== index);
                const currentSlot = getCurrentSlot();
                const slotKey = getSlotKey("lootBag", currentSlot);
                localStorage.setItem(slotKey, JSON.stringify(updated));
                return updated;
            });

            // Add gold
            const newGold = addGold(sellValue);
            setPlayerGold(newGold);
        } catch (err) {
            console.error('Error selling item:', err);
        }
    };

    // Take all items to inventory
    const handleTakeAll = () => {
        try {
            const itemsToConvert = [...lootBag];
            
            // Clear loot bag
            setLootBag([]);
            const currentSlot = getCurrentSlot();
            const slotKey = getSlotKey("lootBag", currentSlot);
            localStorage.setItem(slotKey, JSON.stringify([]));

            // Convert all items to equipment and add to inventory
            const equipment = convertLootBagToEquipment(itemsToConvert);
            if (equipment.length > 0) {
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
            lootBag.forEach(itemName => {
                totalGold += calculateItemSellValue(itemName);
            });
            
            // Clear loot bag
            setLootBag([]);
            const currentSlot = getCurrentSlot();
            const slotKey = getSlotKey("lootBag", currentSlot);
            localStorage.setItem(slotKey, JSON.stringify([]));

            // Add total gold
            const newGold = addGold(totalGold);
            setPlayerGold(newGold);
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
            
            setIsBattleActive(false);
            setBattleResult(battleResult);
            
            setPlayerHealth(battleResult.playerFinalHealth);
            const battleCurrentSlot = getCurrentSlot();
            const battleHealthSlotKey = getSlotKey("playerHealth", battleCurrentSlot);
            localStorage.setItem(battleHealthSlotKey, battleResult.playerFinalHealth.toString());
            
            // Process victory rewards
            const achievementResult = currentEnemy ? recordKill(currentEnemy.id) : { achievements: {}, newAchievements: [] };
            
            const lootResult = currentEnemy ? getLootDrop(currentEnemy.drops) : { items: [], gold: 0, goldItems: [] };
            
            // Only add equipment items to loot bag, not gold items
            const newLoot = [...lootResult.items];
            
            // Auto-convert gold items directly without showing in loot bag
            if (lootResult.goldItems && lootResult.goldItems.length > 0) {
                const newGold = addGold(lootResult.gold);
                setPlayerGold(newGold);
            }
            
            // Add to loot bag with limit enforcement
            setLootBag(prev => {
                const availableSpace = LOOT_BAG_LIMIT - prev.length;
                const itemsToAdd = newLoot.slice(0, availableSpace);
                const updated = [...prev, ...itemsToAdd];
                const currentSlot = getCurrentSlot();
                const slotKey = getSlotKey("lootBag", currentSlot);
                localStorage.setItem(slotKey, JSON.stringify(updated));
                return updated;
            });

            // --- PET DROP LOGIC ---
            let petDropMessage = null;
            if (currentEnemy) {
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

            // Add loot and achievement messages to battle log
            const battleLogMessages = [
                {
                    type: 'victory',
                    message: `🎉 ${t('battle.playerWins')}! Enemy defeated!`
                }
            ];
            
            // Add achievement messages if any new achievements unlocked
            if (achievementResult.newAchievements.length > 0) {
                achievementResult.newAchievements.forEach(achievement => {
                    battleLogMessages.push({
                        type: 'achievement',
                        message: `🏆 Achievement Unlocked: ${achievement.description}!`
                    });
                });
            }
            
            // Add loot messages
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
            
            setBattleLog(prev => [...prev, ...battleLogMessages]);
            
            // Handle dungeon progression
            if (dungeonRun && !dungeonRun.completed) {
                handleDungeonEnemyDefeated();
            } else {
                // Start enemy spawn timer for regular battles
                startEnemySpawnTimer();
            }
        }
    };

    // Potion usage function
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
                const currentSlot = getCurrentSlot();
                const healthSlotKey = getSlotKey("playerHealth", currentSlot);
                localStorage.setItem(healthSlotKey, newHealth.toString());
                
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
        }
    };

    // Auto potion check
    const checkAutoPotion = () => {
        if (!currentBattle || !autoPotionSettings.enabled) return;
        
        const potionToUse = shouldUseAutoPotion(
            currentBattle.player.currentHealth,
            currentBattle.player.HEALTH
        );
        
        if (potionToUse) {
            handleUsePotion(potionToUse);
        }
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

    const applyDeathPenalties = () => {
        const penalties = { goldLost: 0, equipmentLost: [] };
        
        // Gold loss - lose half of current gold
        const currentGold = getGold();
        const goldLoss = Math.floor(currentGold / 2);
        if (goldLoss > 0) {
            subtractGold(goldLoss);
            penalties.goldLost = goldLoss;
            setPlayerGold(getGold());
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

    const respawnPlayer = () => {
        const currentPlayerStats = getPlayerStats();
        setPlayerStats(currentPlayerStats);
        setPlayerHealth(currentPlayerStats.HEALTH);
        const currentSlot = getCurrentSlot();
        const healthSlotKey = getSlotKey("playerHealth", currentSlot);
        localStorage.setItem(healthSlotKey, currentPlayerStats.HEALTH.toString());
        setBattleMode('selection');
        setCurrentEnemy(null);
        setBattleResult(null);
        setCurrentBattle(null);
        setIsBattleActive(false);
    };

    const startEnemySpawnTimer = () => {
        setBattleLog(prev => [
            ...prev,
            { type: 'info', message: t('battle.searchingForEnemy') }
        ]);
        createSpawnTimer(
            setIsWaitingForEnemy, 
            setEnemySpawnProgress, 
            spawnNewEnemy
        );
    };
    
    const spawnNewEnemy = () => {
        setBattleResult(null);
        setCurrentBattle(null);
        
        const currentSlot = getCurrentSlot();
        const healthSlotKey = getSlotKey("playerHealth", currentSlot);
        const savedHealth = localStorage.getItem(healthSlotKey);
        const currentPlayerStats = getPlayerStats();
        const currentHealth = savedHealth ? parseInt(savedHealth) : currentPlayerStats.HEALTH;
        
        setTimeout(() => {
            if (currentEnemy) {
                startRealTimeBattle(currentEnemy, currentHealth);
            }
        }, 0);
    };

    const handleEnemySelect = (enemy) => {
        setCurrentEnemy(enemy);
        setBattleMode('battle');
        startRealTimeBattle(enemy);
    };

    const handleBackToSelection = () => {
        if (dungeonRun && !dungeonRun.completed) {
            setExitWarningOpen(true);
            return;
        }
        setBattleMode('selection');
        setCurrentEnemy(null);
        setBattleResult(null);
        setCurrentBattle(null);
        setIsBattleActive(false);
        setIsWaitingForEnemy(false);
        setEnemySpawnProgress(0);
        setDungeonRun(null);
    };

    const startRealTimeBattle = (enemy = currentEnemy, health = playerHealth) => {
        
        if (!enemy) {
            console.warn('startRealTimeBattle called with null enemy');
            return;
        }
        
        const currentPlayerStats = getPlayerStats();
        
        setPlayerStats(currentPlayerStats);
        const adjustedHealth = Math.min(health, currentPlayerStats.HEALTH);
        
        const hpXP = awardBattleActionXP('battle_participation', 0, false, true);
        
        const battleState = {
            player: { ...currentPlayerStats, currentHealth: adjustedHealth },
            enemy: { ...enemy, currentHealth: enemy.maxHp },
            playerProgress: 0,
            enemyProgress: 0,
            battleLog: []
        };
        
        setCurrentBattle(battleState);
        
        setIsBattleActive(true);
        setBattleResult(null);
        setDamageDisplay({ player: null, enemy: null });
    };

    const getDifficultyColor = (enemy) => {
        // Easy enemies (HP <= 40)
        if (enemy.maxHp <= 40) return '#4caf50'; // Easy - Green
        // Normal enemies (HP 41-90)
        if (enemy.maxHp <= 90) return '#ff9800'; // Normal - Orange
        // Hard enemies (HP 91-130)
        if (enemy.maxHp <= 130) return '#f44336'; // Hard - Red
        // Very Hard enemies (HP 131-200)
        if (enemy.maxHp <= 200) return '#9c27b0'; // Very Hard - Purple
        // Impossible enemies (HP > 200)
        return '#212121'; // Impossible - Dark Gray/Black
    };

    const getDifficultyText = (enemy) => {
        // Easy enemies (HP <= 40)
        if (enemy.maxHp <= 40) return 'Easy';
        // Normal enemies (HP 41-90)
        if (enemy.maxHp <= 90) return 'Normal';
        // Hard enemies (HP 91-130)
        if (enemy.maxHp <= 130) return 'Hard';
        // Very Hard enemies (HP 131-200)
        if (enemy.maxHp <= 200) return 'Very Hard';
        // Impossible enemies (HP > 200)
        return 'Impossible';
    };

    // Achievement-based stat display functions
    const getStatDisplay = (enemyId, statType, value) => {
        const isUnlocked = isAchievementUnlocked(enemyId, getThresholdForStat(statType));
        if (isUnlocked) {
            return value !== undefined && value !== null ? value.toString() : "0";
        } else {
            return "";
        }
    };

    // Helper to display enemy HP safely
    const getEnemyHpDisplay = (enemyId, current, max) => {
        return getStatDisplay(enemyId, 'hp', max) === "" ? "???" : `${current}/${max}`;
    };

    const getThresholdForStat = (statType) => {
        switch (statType) {
            case 'hp': return 10;
            case 'atk': return 25;
            case 'def': return 50;
            case 'attack_speed': return 25; // ATK ile birlikte açılsın
            case 'crit_chance': return 25; // ATK ile birlikte açılsın
            case 'crit_damage': return 25; // ATK ile birlikte açılsın
            case 'hit_chance': return 25; // ATK ile birlikte açılsın
            default: return 100;
        }
    };

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
                if (currentBattle) {
                    setCurrentBattle(prev => ({
                        ...prev,
                        player: { ...currentPlayerStats, currentHealth: Math.min(prev.player.currentHealth, currentPlayerStats.HEALTH) }
                    }));
                }
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
    }, [playerStats, currentBattle]);

    useEffect(() => {
        if (!isBattleActive || !currentBattle || dungeonCompleteDialog.open) {
            return;
        }

        const interval = setInterval(() => {
            setCurrentBattle(prev => {
                if (!prev) return prev;
                
                // Stop battle if dungeon complete dialog is open
                if (dungeonCompleteDialog.open) {
                    return prev;
                }

                // Calculate skill buffs for attack speed
                const skillBuffs = calculateSkillBuffsForAttackType(selectedAttackType);
                const attackSpeedBonus = skillBuffs.ATTACK_SPEED || 0;
                const effectiveAttackSpeed = prev.player.ATTACK_SPEED + attackSpeedBonus;
                
                const playerSpeed = Math.max(1, effectiveAttackSpeed);
                const enemySpeed = Math.max(1, Math.min(5, prev.enemy.ATTACK_SPEED));
                let newBattle = updateBattleState(prev, playerSpeed, enemySpeed);

                if (newBattle.playerProgress >= 100) {
                    newBattle = processPlayerAttack(newBattle, setDamageDisplay, selectedAttackType);
                }

                if (newBattle.enemyProgress >= 100) {
                    newBattle = processEnemyAttack(newBattle, setDamageDisplay);
                }

                const battleResult = checkBattleResult(newBattle);
                if (battleResult) {
                    setIsBattleActive(false);
                    setBattleResult(battleResult);
                    
                    setPlayerHealth(battleResult.playerFinalHealth);
                    const battleCurrentSlot = getCurrentSlot();
                    const battleHealthSlotKey = getSlotKey("playerHealth", battleCurrentSlot);
                    localStorage.setItem(battleHealthSlotKey, battleResult.playerFinalHealth.toString());
                    
                    if (battleResult.winner === 'player') {
                        // Record achievement for enemy kill
                        const achievementResult = currentEnemy ? recordKill(currentEnemy.id) : { achievements: {}, newAchievements: [] };
                        
                        const lootResult = currentEnemy ? getLootDrop(currentEnemy.drops) : { items: [], gold: 0, goldItems: [] };
                        
                        // Only add equipment items to loot bag, not gold items
                        const newLoot = [...lootResult.items];
                        
                        // Auto-convert gold items directly without showing in loot bag
                        if (lootResult.goldItems && lootResult.goldItems.length > 0) {
                            const newGold = addGold(lootResult.gold);
                            setPlayerGold(newGold);
                        }
                        
                        // Add to loot bag with limit enforcement
                        setLootBag(prev => {
                            const availableSpace = LOOT_BAG_LIMIT - prev.length;
                            const itemsToAdd = newLoot.slice(0, availableSpace);
                            const updated = [...prev, ...itemsToAdd];
                            const currentSlot = getCurrentSlot();
                            const slotKey = getSlotKey("lootBag", currentSlot);
                            localStorage.setItem(slotKey, JSON.stringify(updated));
                            return updated;
                        });
                        // Don't auto-save loot to inventory anymore - player must manually take items

                        // --- PET DROP LOGIC ---
                        let petDropMessage = null;
                        if (currentEnemy) {
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
                        // --- SONU ---

                        // Add loot and achievement messages to battle log
                        const battleLogMessages = [
                            {
                                type: 'victory',
                                message: `🎉 ${t('battle.playerWins')}! Enemy defeated!`
                            }
                        ];
                        
                        // Add achievement messages if any new achievements unlocked
                        if (achievementResult.newAchievements.length > 0) {
                            achievementResult.newAchievements.forEach(achievement => {
                                battleLogMessages.push({
                                    type: 'achievement',
                                    message: `🏆 Achievement Unlocked: ${achievement.description}!`
                                });
                            });
                        }
                        
                        // Add loot messages
                        battleLogMessages.push(...newLoot.map(item => ({
                            type: 'loot',
                            message: `📦 Loot: ${item}`
                        })));
                        
                        // Add pet drop message if any
                        if (petDropMessage) {
                            battleLogMessages.push({
                                type: 'pet',
                                message: petDropMessage
                            });
                        }
                        
                        // Add messages to both battleLog state and currentBattle.battleLog
                        battleLogMessages.forEach(msg => setBattleLog(prev => [...prev, msg]));
                        
                        // Update currentBattle with the new battle log entries
                        const updatedBattle = {
                            ...newBattle,
                            battleLog: [...(newBattle.battleLog || []), ...battleLogMessages]
                        };
                        
                        setCurrentBattle(updatedBattle);
                        startEnemySpawnTimer();
                        
                        // Auto save after successful battle
                        setTimeout(() => {
                            saveCurrentGame();
                        }, 1000);

                        // Savaş sonucu işlenirken, eğer currentEnemy bir lokasyon düşmanı ise, uniqueLoot drop ihtimalini kontrol et
                        if (currentEnemy) {
                            const location = LOCATIONS.find(loc => loc.enemies.includes(currentEnemy.id));
                            if (location && location.uniqueLoot) {
                                if (Math.random() < location.uniqueLoot.chance) {
                                    setLootBag(prev => {
                                        const updated = [...prev, location.uniqueLoot.name];
                                        const currentSlot = getCurrentSlot();
                                        const slotKey = getSlotKey("lootBag", currentSlot);
                                        localStorage.setItem(slotKey, JSON.stringify(updated));
                                        return updated;
                                    });
                                    // Battle log'a ekle
                                    setBattleLog(prev => [...prev, { type: 'loot', message: `✨ ${t('battle.uniqueLocationLoot')}: ${location.uniqueLoot.name}` }]);
                                }
                            }
                        }
                        // At the end of the player victory block, before startEnemySpawnTimer():
                        if (battleMode === 'dungeon') {
                            handleDungeonEnemyDefeated();
                            // If dungeon is completed, stop the battle
                            if (dungeonRun && dungeonRun.completed) {
                                return prev;
                            }
                        }
                    } else if (battleResult.winner === 'enemy') {
                        // Auto save before death
                        saveCurrentGame();
                        showDeathDialog();
                    }
                    return prev;
                }

                return newBattle;
            });
            
            // Check for auto potion usage
            checkAutoPotion();
        }, 200);

        return () => clearInterval(interval);
    }, [isBattleActive, currentBattle, autoPotionSettings, dungeonCompleteDialog.open]);

    // Synchronize currentBattle.battleLog with battleLog state
    useEffect(() => {
        if (currentBattle && currentBattle.battleLog) {
            // Merge battle logs instead of overwriting
            setBattleLog(prev => {
                const currentBattleLog = currentBattle.battleLog || [];
                
                const mergedLog = [...prev];
                
                // Add new entries from currentBattle.battleLog that aren't already in prev
                currentBattleLog.forEach(newEntry => {
                    const exists = mergedLog.some(existingEntry => 
                        existingEntry.type === newEntry.type && 
                        existingEntry.message === newEntry.message &&
                        existingEntry.damage === newEntry.damage
                    );
                    if (!exists) {
                        mergedLog.push(newEntry);
                    }
                });
                
                return mergedLog;
            });
        }
    }, [currentBattle?.battleLog]);

    // Monitor battle state changes
    useEffect(() => {
    }, [isBattleActive]);

    useEffect(() => {
    }, [currentBattle]);

    // Monitor battle mode changes
    useEffect(() => {
    }, [battleMode]);

    // playerStats değiştiğinde playerHealth'i de güncelle
    useEffect(() => {
        setPlayerHealth(playerStats.HEALTH);
        const statsCurrentSlot = getCurrentSlot();
        const statsHealthSlotKey = getSlotKey("playerHealth", statsCurrentSlot);
        localStorage.setItem(statsHealthSlotKey, playerStats.HEALTH.toString());
    }, [playerStats.HEALTH]);

    // Update attack types when equipment changes
    useEffect(() => {
        const updateAttackTypes = () => {
            // Check both possible localStorage keys
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

    // Update auto potion settings when buffs change
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

    // Example locations and monsters (static for now)
    // Aşağıdaki LOCATIONS ve DUNGEONS sabitlerini tamamen kaldır:
    // const LOCATIONS = [
    //   {
    //     name: 'Sewer',
    //     monsters: [
    //       { id: 'rat', name: 'Rat' },
    //       { id: 'slime', name: 'Slime' },
    //       { id: 'spider', name: 'Spider' },
    //       { id: 'ghost', name: 'Ghost' }
    //     ],
    //     loot: [
    //       { id: 'ring', name: 'Sewer Ring', chance: 0.5 }
    //     ]
    //   },
    //   {
    //     name: 'Farmland',
    //     monsters: [
    //       { id: 'goblin', name: 'Goblin' },
    //       { id: 'orc', name: 'Orc' },
    //       { id: 'skeleton', name: 'Skeleton' },
    //       { id: 'troll', name: 'Troll' },
    //       { id: 'dragon', name: 'Dragon' }
    //     ],
    //     loot: [
    //       { id: 'cape', name: 'Farmland Cape', chance: 0.3 }
    //     ]
    //   }
    // ];

    // Example dungeons and chest rewards (static for now)
    // Aşağıdaki LOCATIONS ve DUNGEONS sabitlerini tamamen kaldır:
    // const DUNGEONS = [
    //   {
    //     name: 'Ancient Catacombs',
    //     stages: 7,
    //     chest: [
    //       { id: 'legendarySword', name: 'Legendary Sword', chance: 1 },
    //       { id: 'armor', name: 'Ancient Armor', chance: 3 },
    //       { id: 'ring', name: 'Mystic Ring', chance: 5 }
    //     ]
    //   },
    //   {
    //     name: 'Haunted Tower',
    //     stages: 9,
    //     chest: [
    //       { id: 'cape', name: 'Ghostly Cape', chance: 2 },
    //       { id: 'shield', name: 'Haunted Shield', chance: 4 },
    //       { id: 'gloves', name: 'Specter Gloves', chance: 6 }
    //     ]
    //   }
    // ];

    const handleToggleLocation = (idx) => {
        setOpenLocations((prev) => prev.map((open, i) => (i === idx ? !open : open)));
    };
    const handleToggleDungeon = (idx) => {
        setOpenDungeons((prev) => prev.map((open, i) => (i === idx ? !open : open)));
    };

    const startDungeonRun = (dungeon) => {
        const enemyPool = dungeon.enemies;
        const stages = [];
        for (let i = 0; i < 6; i++) {
            const rand = enemyPool[Math.floor(Math.random() * enemyPool.length)];
            stages.push(rand);
        }
        stages.push(dungeon.boss);
        setDungeonRun({ dungeon, stages, currentStage: 0, completed: false, chestAwarded: false });
        setBattleMode('dungeon');
        const firstEnemy = Object.values(enemies).find(e => e.id === stages[0]);
        setCurrentEnemy(firstEnemy);
        setTimeout(() => startRealTimeBattle(firstEnemy), 0);
    };
    const handleDungeonEnemyDefeated = () => {
        if (!dungeonRun) return;
        if (dungeonRun.currentStage < 6) {
            const nextStage = dungeonRun.currentStage + 1;
            setDungeonRun(prev => ({ ...prev, currentStage: nextStage }));
            const nextEnemy = Object.values(enemies).find(e => e.id === dungeonRun.stages[nextStage]);
            setCurrentEnemy(nextEnemy);
            setTimeout(() => startRealTimeBattle(nextEnemy), 0);
        } else {
            setDungeonRun(prev => ({ ...prev, completed: true }));
            setIsBattleActive(false);
            setDungeonCompleteDialog({ open: true, countdown: 5 });
            
            // Add dungeon chest to loot bag
            if (!dungeonRun.chestAwarded) {
                setLootBag(prev => {
                    const chestItem = `🎁 ${dungeonRun.dungeon.name} Chest`;
                    const updated = [...prev, chestItem];
                    const currentSlot = getCurrentSlot();
                    const slotKey = getSlotKey("lootBag", currentSlot);
                    localStorage.setItem(slotKey, JSON.stringify(updated));
                    return updated;
                });
                setDungeonRun(prev => ({ ...prev, chestAwarded: true }));
            }
        }
    };

    const confirmExitDungeon = () => {
        setExitWarningOpen(false);
        setBattleMode('selection');
        setCurrentEnemy(null);
        setBattleResult(null);
        setCurrentBattle(null);
        setIsBattleActive(false);
        setIsWaitingForEnemy(false);
        setEnemySpawnProgress(0);
        setDungeonRun(null);
    };

    const handleChestClick = (chestItem) => {
        // Extract dungeon name from chest item
        const dungeonName = chestItem.replace('🎁 ', '').replace(' Chest', '');
        const dungeon = DUNGEONS.find(d => d.name === dungeonName);
        
        if (!dungeon || !dungeon.chest) return;
        
        // Show preview modal instead of immediately opening
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
                        setDungeonRun(prevRun => prevRun ? { ...prevRun, currentStage: 0, completed: false, chestAwarded: false } : prevRun);
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
                                setCurrentEnemy(null);
                                setBattleResult(null);
                                setCurrentBattle(null);
                                setIsBattleActive(false);
                                setIsWaitingForEnemy(false);
                                setEnemySpawnProgress(0);
                                setDungeonRun(null);
                            }}>{t('battle.leave')}</Button>
                            <Button variant="contained" color="primary" onClick={() => {
                                setDungeonCompleteDialog({ open: false, countdown: 5 });
                                setDungeonRun(prev => ({ ...prev, currentStage: 0, completed: false, chestAwarded: false }));
                            }}>
                                {t('battle.restart')} ({dungeonCompleteDialog.countdown})
                            </Button>
                        </Box>
                    </DialogContent>
                </Dialog>
            )}
            {battleMode === 'selection' && (
                <>
                    <Tabs
                        value={battleTab}
                        onChange={(e, v) => setBattleTab(v)}
                        centered
                        sx={{
                            marginBottom: 2,
                            background: '#3a3a5a',
                            borderRadius: 2,
                            minHeight: 48,
                            '& .MuiTab-root': {
                                color: '#e0e0e0',
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                minHeight: 48,
                                transition: 'color 0.2s',
                            },
                            '& .Mui-selected': {
                                color: '#ffd700',
                                background: 'rgba(60,60,90,0.7)',
                                borderRadius: 8,
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#ffd700',
                                height: 4,
                                borderRadius: 2,
                            },
                        }}
                    >
                        <Tab label={t('battle.locations')} value="locations" />
                        <Tab label={t('battle.dungeons')} value="dungeons" />
                    </Tabs>
                    {battleTab === 'locations' && (
                        <div>
                            {Array.isArray(LOCATIONS) && LOCATIONS.map((loc, idx) => (
                                <div key={loc.id} style={{ marginBottom: 24, border: '1px solid #444', borderRadius: 8, padding: 12, background: 'rgba(0,0,0,0.08)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => handleToggleLocation(idx)}>
                                        <Typography variant="h6" style={{ color: '#ffd700', marginBottom: 8 }}>{loc.name}</Typography>
                                        <IconButton size="small" aria-label={openLocations[idx] ? t('common.collapse') : t('common.expand')} sx={{ color: '#ffd700' }}>
                                            {openLocations[idx] ? <ExpandLess /> : <ExpandMore />}
                                        </IconButton>
                                    </div>
                                    {openLocations[idx] && <>
                                        <Typography variant="body2" style={{ color: '#bada55', marginBottom: 8 }}>{loc.description}</Typography>
                                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                            {Array.isArray(loc.enemies) && loc.enemies.map((enemyId) => {
                                                const enemy = Object.values(enemies).find(e => e.id === enemyId);
                                                if (!enemy) return null;
                                                return (
                                                    <div key={enemy.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80, marginBottom: 8, background: 'rgba(0,0,0,0.12)', borderRadius: 6, padding: 8 }}>
                                                        <img src={getEnemyIcon(enemy.id)} alt={enemy.name} style={{ width: 80, height: 80, marginBottom: 4 }} />
                                                        <Typography variant="body2" style={{ color: '#fff', fontWeight: 500 }}>{enemy.name}</Typography>
                                                        <Button size="small" variant="contained" color="primary" style={{ marginTop: 4 }} onClick={() => handleEnemySelect(enemy)}>
                                                            {t('battle.fight')}
                                                        </Button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {loc.uniqueLoot && (
                                            <Tooltip
                                                title={
                                                    <div style={{ maxWidth: 220 }}>
                                                        <Typography variant="body2" sx={{ color: '#ffd700', fontWeight: 'bold', mb: 1 }}>{loc.uniqueLoot.name}</Typography>
                                                        {loc.uniqueLoot.rarity && (
                                                            <Typography variant="caption" sx={{ color: '#b45af2', textTransform: 'uppercase', display: 'block', mb: 1 }}>{loc.uniqueLoot.rarity}</Typography>
                                                        )}
                                                        <Typography variant="caption" sx={{ color: '#fff', display: 'block', mb: 1 }}>{t('battle.uniqueLocationLoot')}</Typography>
                                                        <Typography variant="caption" sx={{ color: '#ffd700', display: 'block' }}>{(loc.uniqueLoot.chance * 100).toFixed(2)}% {t('battle.dropChance')}</Typography>
                                                    </div>
                                                }
                                                arrow
                                                placement="top"
                                                componentsProps={{
                                                    tooltip: {
                                                        sx: {
                                                            backgroundColor: 'rgba(26, 26, 46, 0.95)',
                                                            border: '2px solid #ffd700',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 0 20px #ffd70040',
                                                            backdropFilter: 'blur(10px)',
                                                            maxWidth: '250px'
                                                        }
                                                    },
                                                    arrow: {
                                                        sx: {
                                                            color: '#ffd700'
                                                        }
                                                    }
                                                }}
                                            >
                                                <div style={{ marginTop: 10, background: 'rgba(0,0,0,0.18)', borderRadius: 6, padding: 8, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                                    <span style={{ color: '#bada55', fontWeight: 500 }}>{t('battle.uniqueLocationLoot')}</span>
                                                    <span style={{ color: '#fff' }}>{loc.uniqueLoot.name}</span>
                                                    <span style={{ color: '#ffd700', fontSize: '0.95em' }}>{(loc.uniqueLoot.chance * 100).toFixed(2)}%</span>
                                                </div>
                                            </Tooltip>
                                        )}
                                    </>}
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Dungeons sekmesi burada benzer şekilde olacak */}
                    {battleTab === 'dungeons' && (
                        <div>
                            {Array.isArray(DUNGEONS) && DUNGEONS.map((dungeon, idx) => (
                                <div key={dungeon.id} style={{ marginBottom: 24, border: '2px solid #b45af2', borderRadius: 10, padding: 16, background: 'rgba(30,0,60,0.13)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => handleToggleDungeon(idx)}>
                                        <Typography variant="h6" style={{ color: '#b45af2', marginBottom: 8 }}>{dungeon.name}</Typography>
                                        <IconButton size="small" aria-label={openDungeons[idx] ? t('common.collapse') : t('common.expand')} sx={{ color: '#ffd700' }}>
                                            {openDungeons[idx] ? <ExpandLess /> : <ExpandMore />}
                                        </IconButton>
                                    </div>
                                    {openDungeons[idx] && <>
                                        <Typography variant="body2" style={{ color: '#fff', marginBottom: 6 }}>{dungeon.description}</Typography>
                                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
                                            {dungeon.enemies.map((enemyId) => {
                                                const enemy = Object.values(enemies).find(e => e.id === enemyId);
                                                if (!enemy) return null;
                                                return (
                                                    <div key={enemy.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80, background: 'rgba(0,0,0,0.12)', borderRadius: 6, padding: 8 }}>
                                                        <img src={getEnemyIcon(enemy.id)} alt={enemy.name} style={{ width: 80, height: 80, marginBottom: 2 }} />
                                                        <Typography variant="body2" style={{ color: '#fff', fontWeight: 500 }}>{enemy.name}</Typography>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div style={{ marginBottom: 8 }}>
                                            <Typography variant="subtitle2" style={{ color: '#ffb300' }}>{t('battle.boss')}</Typography>
                                            {(() => {
                                                const boss = Object.values(enemies).find(e => e.id === dungeon.boss);
                                                if (!boss) return null;
                                                return (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                                                        <img src={getEnemyIcon(boss.id)} alt={boss.name} style={{ width: 48, height: 48 }} />
                                                        <Typography variant="body1" style={{ color: '#ff5252', fontWeight: 600 }}>{boss.name}</Typography>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                        <div style={{ marginTop: 8, background: 'rgba(0,0,0,0.18)', borderRadius: 6, padding: 8 }}>
                                            <Typography variant="subtitle2" style={{ color: '#ffd700', marginBottom: 4 }}>
                                                {t('battle.dungeonChestRewards')}
                                            </Typography>
                                            {dungeon.chest.map(reward => (
                                                <Tooltip
                                                    key={reward.id}
                                                    title={
                                                        <div style={{ maxWidth: 220 }}>
                                                            <Typography variant="body2" sx={{ color: '#ffd700', fontWeight: 'bold', mb: 1 }}>{reward.name}</Typography>
                                                            <Typography variant="caption" sx={{ color: '#fff', display: 'block', mb: 1 }}>{t('battle.dungeonChestRewards')}</Typography>
                                                            <Typography variant="caption" sx={{ color: '#ffd700', display: 'block' }}>{reward.chance}% {t('battle.dropChance')}</Typography>
                                                        </div>
                                                    }
                                                    arrow
                                                    placement="top"
                                                    componentsProps={{
                                                        tooltip: {
                                                            sx: {
                                                                backgroundColor: 'rgba(26, 26, 46, 0.95)',
                                                                border: '2px solid #ffd700',
                                                                borderRadius: '8px',
                                                                boxShadow: '0 0 20px #ffd70040',
                                                                backdropFilter: 'blur(10px)',
                                                                maxWidth: '250px'
                                                            }
                                                        },
                                                        arrow: {
                                                            sx: {
                                                                color: '#ffd700'
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, cursor: 'pointer' }}>
                                                        <span style={{ color: '#fff' }}>{reward.name}</span>
                                                        <span style={{ color: '#ffd700', fontSize: '0.85em' }}>{reward.chance}%</span>
                                                    </div>
                                                </Tooltip>
                                            ))}
                                        </div>
                                        <Button size="medium" variant="contained" color="secondary" style={{ marginTop: 12 }} onClick={() => startDungeonRun(dungeon)}>
                                            {t('battle.enterDungeon')}
                                        </Button>
                                    </>}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
            {/* Normal Battle UI */}
            {battleMode === 'battle' && (
                <>
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
                    </div>
                    <div className={styles.battleContainer}>
                        {/* Fighters Row */}
                        <div className={styles.fighters}>
                            {/* PLAYER */}
                            <div className={styles.fighter}>
                                <Avatar src={getCharacterIcon(selectedCharacter)} className={styles.avatar} />
                                <Typography variant="h6">{getCharacterName(selectedCharacter)}</Typography>
                                {damageDisplay.player && (
                                    <Typography 
                                        variant="h4" 
                                        className={`${styles.damageDisplay} ${
                                            damageDisplay.player === 'MISS' ? styles.missDisplay : 
                                            damageDisplay.playerType === 'crit' ? styles.enemyCritDamage : styles.enemyDamage
                                        }`}
                                    >
                                        {damageDisplay.player}
                                    </Typography>
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
                                    <Typography 
                                        variant="h4" 
                                        className={`${styles.damageDisplay} ${
                                            damageDisplay.enemy === 'MISS' ? styles.missDisplay : 
                                            damageDisplay.enemyType === 'crit' ? styles.playerCritDamage : styles.playerDamage
                                        }`}
                                    >
                                        {damageDisplay.enemy}
                                    </Typography>
                                )}
                                {isWaitingForEnemy ? (
                                    <div className={styles.enemySpawnContainer}>
                                        <Typography className={styles.spawnText}>
                                            Spawning Enemy...
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
                                ) : (
                                    <>
                                        <div className={styles.hpBarContainer}>
                                            <Typography 
                                                className={`${styles.hpText} ${
                                                    getStatDisplay(currentEnemy?.id, 'hp', currentEnemy?.maxHp) === "" ? styles.hiddenStat : styles.revealedStat
                                                }`}
                                            >
                                                HP: {getEnemyHpDisplay(currentEnemy?.id, currentBattle?.enemy?.currentHealth || 0, currentBattle?.enemy?.maxHp || currentEnemy?.maxHp)}
                                            </Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={currentBattle ? (getStatDisplay(currentEnemy?.id, 'hp', currentBattle.enemy.maxHp) === "" ? 100 : (currentBattle.enemy.currentHealth / currentBattle.enemy.maxHp) * 100) : 100}
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
                                        <Tooltip title={t('battle.closeBattleLog')} arrow>
                                            <IconButton
                                                onClick={() => setBattleLogVisible(false)}
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
                                                <ExpandLess />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                    <div className={styles.battleLog}>
                                        {battleLog.length === 0 ? (
                                            <Typography variant="body2" sx={{ color: '#ffffff', fontFamily: 'Press Start 2P', fontSize: '0.7rem' }}>{t('battle.noBattleLog')}</Typography>
                                        ) : (
                                            battleLog.map((entry, idx) => (
                                                <Typography key={idx} variant="body2" className={styles[`${entry.type}Log`] || styles.battleLogEntry}>
                                                    {entry.message}
                                                </Typography>
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
                                                onClick={() => handleUsePotion(potion.id)}
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
                                        <Typography className={getStatDisplay(currentEnemy?.id, 'atk', currentBattle.enemy.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            ⚔️ Attack: {getStatDisplay(currentEnemy?.id, 'atk', currentBattle.enemy.ATK)}
                                        </Typography>
                                        <Typography className={getStatDisplay(currentEnemy?.id, 'attack_type', currentBattle.enemy.ATTACK_TYPE) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            🎯 Attack Type: {getStatDisplay(currentEnemy?.id, 'attack_type', currentBattle.enemy.ATTACK_TYPE) === "" ? "" : `${currentBattle.enemy.ATTACK_TYPE || "Melee"}`}
                                        </Typography>
                                        <Typography className={getStatDisplay(currentEnemy?.id, 'def', currentBattle.enemy.DEF) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            🛡️ Def: {getStatDisplay(currentEnemy?.id, 'def', currentBattle.enemy.DEF)}
                                        </Typography>
                                        <Typography className={getStatDisplay(currentEnemy?.id, 'magic_def', currentBattle.enemy.MAGIC_DEF) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            🧙 Magic Def: {getStatDisplay(currentEnemy?.id, 'magic_def', currentBattle.enemy.MAGIC_DEF) === "" ? "" : `${currentBattle.enemy.MAGIC_DEF || 0}`}
                                        </Typography>
                                        <Typography className={getStatDisplay(currentEnemy?.id, 'hp', currentBattle.enemy.maxHp) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            ❤️ HP: {getEnemyHpDisplay(currentEnemy?.id, currentBattle.enemy.currentHealth, currentBattle.enemy.maxHp)}
                                        </Typography>
                                        <Typography className={getStatDisplay(currentEnemy?.id, 'energy_shield', currentBattle.enemy.ENERGY_SHIELD) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            🛡️ Energy Shield: {getStatDisplay(currentEnemy?.id, 'energy_shield', currentBattle.enemy.ENERGY_SHIELD) === "" ? "" : `${currentBattle.enemy.ENERGY_SHIELD || 0}`}
                                        </Typography>
                                        <Typography className={getStatDisplay(currentEnemy?.id, 'base_damage', currentBattle.enemy.BASE_DAMAGE_MIN) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            ⚔️ Base Damage: {getStatDisplay(currentEnemy?.id, 'base_damage', currentBattle.enemy.BASE_DAMAGE_MIN) === "" ? "" : `${currentBattle.enemy.BASE_DAMAGE_MIN || 0}-${currentBattle.enemy.BASE_DAMAGE_MAX || 0}`}
                                        </Typography>
                                        <Typography className={getStatDisplay(currentEnemy?.id, 'attack_speed', currentBattle.enemy.ATTACK_SPEED) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            ⚡ {t('battle.attackSpeed')}: {getStatDisplay(currentEnemy?.id, 'attack_speed', currentBattle.enemy.ATTACK_SPEED) === "" ? "" : currentBattle.enemy.ATTACK_SPEED}
                                        </Typography>
                                        <Typography className={getStatDisplay(currentEnemy?.id, 'crit_chance', currentBattle.enemy.CRIT_CHANCE || 3) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            🎯 {t('battle.criticalChance')}: {getStatDisplay(currentEnemy?.id, 'crit_chance', currentBattle.enemy.CRIT_CHANCE || 3) === "" ? "" : `${currentBattle.enemy.CRIT_CHANCE || 3}%`}
                                        </Typography>
                                        <Typography className={getStatDisplay(currentEnemy?.id, 'crit_damage', currentBattle.enemy.CRIT_DAMAGE || 120) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            💥 {t('battle.criticalDamage')}: {getStatDisplay(currentEnemy?.id, 'crit_damage', currentBattle.enemy.CRIT_DAMAGE || 120) === "" ? "" : `${currentBattle.enemy.CRIT_DAMAGE || 120}%`}
                                        </Typography>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography className={getStatDisplay(currentEnemy?.id, 'hit_chance', 0) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            🎲 {t('battle.hitChance')}: {getStatDisplay(currentEnemy?.id, 'hit_chance', 0) === "" ? "" : `${calculateHitChance(currentEnemy?.ATK || 0, playerStats.DEF)}%`}
                                        </Typography>
                                        {(() => {
                                            const damageRange = calculateDamageRange(currentBattle.enemy.ATK, currentBattle.player.DEF);
                                            const critDamageRange = {
                                                min: Math.floor(damageRange.min * ((currentBattle.enemy.CRIT_DAMAGE || 120) / 100)),
                                                max: Math.floor(damageRange.max * ((currentBattle.enemy.CRIT_DAMAGE || 120) / 100))
                                            };
                                            return (
                                                <>
                                                    <Typography className={getStatDisplay(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                        ⚔️ {t('battle.baseDamage')}: {getStatDisplay(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? "" : `${damageRange.min}-${damageRange.max}`}
                                                    </Typography>
                                                    <Typography className={getStatDisplay(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                        💥 {t('battle.critDamage')}: {getStatDisplay(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? "" : `${critDamageRange.min}-${critDamageRange.max}`}
                                                    </Typography>
                                                </>
                                            );
                                        })()}
                                    </>
                                ) : (
                                    <>
                                        <Typography className={getStatDisplay(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            ⚔️ {t('battle.attack')}: {getStatDisplay(currentEnemy?.id, 'atk', currentEnemy?.ATK)}
                                        </Typography>
                                        <Typography className={getStatDisplay(currentEnemy?.id, 'def', currentEnemy?.DEF) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            🛡️ {t('battle.defense')}: {getStatDisplay(currentEnemy?.id, 'def', currentEnemy?.DEF)}
                                        </Typography>
                                        <Typography className={getStatDisplay(currentEnemy?.id, 'hp', currentEnemy?.maxHp) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            ❤️ {t('battle.health')}: {getStatDisplay(currentEnemy?.id, 'hp', currentEnemy?.maxHp) === "" ? "" : `${currentEnemy?.maxHp}/${currentEnemy?.maxHp}`}
                                        </Typography>
                                        <Typography className={getStatDisplay(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            ⚡ {t('battle.attackSpeed')}: {currentEnemy?.ATTACK_SPEED || 1.5}
                                        </Typography>
                                        <Typography className={getStatDisplay(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            🎯 {t('battle.criticalChance')}: 3%
                                        </Typography>
                                        <Typography className={getStatDisplay(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            💥 {t('battle.criticalDamage')}: 120%
                                        </Typography>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography className={getStatDisplay(currentEnemy?.id, 'hit_chance', 0) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            🎲 {t('battle.hitChance')}: {calculateHitChance(currentEnemy?.ATK || 0, playerStats.DEF)}%
                                        </Typography>
                                        <Typography className={getStatDisplay(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                            ⚔️ {t('battle.baseDamage')}: {calculateDamage(currentEnemy?.ATK || 0, playerStats.DEF, 0)}
                                        </Typography>
                                        <Typography className={getStatDisplay(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
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
                            <div className={styles.section}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="h6">{t('battle.lootGained')}</Typography>
                                    <Typography variant="caption" sx={{ color: '#999' }}>
                                        {lootBag.length}/{LOOT_BAG_LIMIT} {t('battle.items')}
                                    </Typography>
                                </Box>
                                <Divider />
                                
                                {lootBag.length === 0 ? (
                                    <Typography>{t('battle.noLootYet')}</Typography>
                                ) : (
                                    <>
                                        {/* Bulk Action Buttons */}
                                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={handleTakeAll}
                                                sx={{
                                                    fontFamily: 'Press Start 2P',
                                                    fontSize: '0.6rem',
                                                    px: 2,
                                                    py: 0.5,
                                                    background: 'linear-gradient(145deg, #4ade80 0%, #22c55e 100%)',
                                                    color: '#000000',
                                                    '&:hover': {
                                                        background: 'linear-gradient(145deg, #22c55e 0%, #16a34a 100%)',
                                                    }
                                                }}
                                            >
                                                {t('battle.takeAll')}
                                            </Button>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={handleSellAll}
                                                sx={{
                                                    fontFamily: 'Press Start 2P',
                                                    fontSize: '0.6rem',
                                                    px: 2,
                                                    py: 0.5,
                                                    background: 'linear-gradient(145deg, #ffd700 0%, #f59e0b 100%)',
                                                    color: '#000000',
                                                    '&:hover': {
                                                        background: 'linear-gradient(145deg, #f59e0b 0%, #d97706 100%)',
                                                    }
                                                }}
                                            >
                                                {t('battle.sellAll')}
                                            </Button>
                                        </Box>
                                        
                                        {/* Individual Items */}
                                        <div className={styles.lootListContainer}>
                                            {lootBag.map((item, idx) => {
                                                const isChest = item.includes('🎁') && item.includes('Chest');
                                                const sellValue = isChest ? 0 : calculateItemSellValue(item);
                                                
                                                if (isChest) {
                                                    // Render chest with existing logic
                                                    const dungeonName = item.replace('🎁 ', '').replace(' Chest', '');
                                                    const dungeon = DUNGEONS.find(d => d.name === dungeonName);
                                                    
                                                    let tooltipContent = item;
                                                    if (dungeon && dungeon.chest) {
                                                        tooltipContent = (
                                                            <Box sx={{ p: 1 }}>
                                                                <Typography variant="h6" sx={{ mb: 1, color: '#ffd700' }}>
                                                                    {dungeonName} Chest
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ mb: 1, color: '#e0e0e0' }}>
                                                                    {t('battle.possibleDrops')}:
                                                                </Typography>
                                                                {dungeon.chest.map((chestItem, chestIdx) => (
                                                                    <Typography key={chestIdx} variant="body2" sx={{ mb: 0.5, color: '#ffffff' }}>
                                                                        {chestItem.name} - {chestItem.chance}%
                                                                    </Typography>
                                                                ))}
                                                                <Typography variant="body2" sx={{ mt: 1, color: '#4ade80', fontStyle: 'italic' }}>
                                                                    Click to open!
                                                                </Typography>
                                                            </Box>
                                                        );
                                                    }
                                                    
                                                    return (
                                                        <Tooltip 
                                                            key={`loot-${idx}-${item}`} 
                                                            title={tooltipContent}
                                                            arrow
                                                            placement="top"
                                                        >
                                                            <div 
                                                                className={`${styles.lootSymbol} ${styles.chestSymbol}`}
                                                                onClick={() => handleChestClick(item)}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                🎁
                                                            </div>
                                                        </Tooltip>
                                                    );
                                                }
                                                
                                                return (
                                                    <Box 
                                                        key={`loot-${idx}-${item}`}
                                                        sx={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: 1, 
                                                            p: 1, 
                                                            mb: 1,
                                                            background: 'rgba(255, 255, 255, 0.05)',
                                                            borderRadius: 1,
                                                            border: '1px solid rgba(255, 255, 255, 0.1)'
                                                        }}
                                                    >
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography variant="body2" sx={{ fontFamily: 'Press Start 2P', fontSize: '0.6rem' }}>
                                                                📦 {item}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: '#ffd700', fontFamily: 'Press Start 2P', fontSize: '0.5rem' }}>
                                                                {t('battle.sellValue')}: {formatGold(sellValue)}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                onClick={() => handleTakeItem(item, idx)}
                                                                sx={{
                                                                    fontFamily: 'Press Start 2P',
                                                                    fontSize: '0.5rem',
                                                                    minWidth: 'auto',
                                                                    px: 1,
                                                                    py: 0.5,
                                                                    borderColor: '#4ade80',
                                                                    color: '#4ade80',
                                                                    '&:hover': {
                                                                        borderColor: '#22c55e',
                                                                        backgroundColor: 'rgba(74, 222, 128, 0.1)',
                                                                    }
                                                                }}
                                                            >
                                                                {t('battle.take')}
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                onClick={() => handleSellItem(item, idx)}
                                                                sx={{
                                                                    fontFamily: 'Press Start 2P',
                                                                    fontSize: '0.5rem',
                                                                    minWidth: 'auto',
                                                                    px: 1,
                                                                    py: 0.5,
                                                                    borderColor: '#ffd700',
                                                                    color: '#ffd700',
                                                                    '&:hover': {
                                                                        borderColor: '#f59e0b',
                                                                        backgroundColor: 'rgba(255, 215, 0, 0.1)',
                                                                    }
                                                                }}
                                                            >
                                                                {t('battle.sell')}
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
            {battleMode === 'dungeon' && dungeonRun && (
                <>
                    <div className={styles.dungeonContainer}>
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
                        </div>
                        {/* Render the full battle UI below the dungeon header */}
                        <div className={styles.battleContainer}>
                            {/* Fighters Row */}
                            <div className={styles.fighters}>
                                {/* PLAYER */}
                                <div className={styles.fighter}>
                                    <Avatar src={getCharacterIcon(selectedCharacter)} className={styles.avatar} />
                                    <Typography variant="h6">{getCharacterName(selectedCharacter)}</Typography>
                                    {damageDisplay.player && (
                                        <Typography 
                                            variant="h4" 
                                            className={`${styles.damageDisplay} ${
                                                damageDisplay.player === 'MISS' ? styles.missDisplay : 
                                                damageDisplay.playerType === 'crit' ? styles.enemyCritDamage : styles.enemyDamage
                                            }`}
                                        >
                                            {damageDisplay.player}
                                        </Typography>
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
                                        <Typography 
                                            variant="h4" 
                                            className={`${styles.damageDisplay} ${
                                                damageDisplay.enemy === 'MISS' ? styles.missDisplay : 
                                                damageDisplay.enemyType === 'crit' ? styles.playerCritDamage : styles.playerDamage
                                            }`}
                                        >
                                            {damageDisplay.enemy}
                                        </Typography>
                                    )}
                                    {isWaitingForEnemy ? (
                                        <div className={styles.enemySpawnContainer}>
                                            <Typography className={styles.spawnText}>
                                                Spawning Enemy...
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
                                    ) : (
                                        <>
                                            <div className={styles.hpBarContainer}>
                                                <Typography 
                                                    className={`${styles.hpText} ${
                                                        getStatDisplay(currentEnemy?.id, 'hp', currentEnemy?.maxHp) === "" ? styles.hiddenStat : styles.revealedStat
                                                    }`}
                                                >
                                                    HP: {getEnemyHpDisplay(currentEnemy?.id, currentBattle?.enemy?.currentHealth || 0, currentBattle?.enemy?.maxHp || currentEnemy?.maxHp)}
                                                </Typography>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={currentBattle ? (getStatDisplay(currentEnemy?.id, 'hp', currentBattle.enemy.maxHp) === "" ? 100 : (currentBattle.enemy.currentHealth / currentBattle.enemy.maxHp) * 100) : 100}
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
                                            <Tooltip title={t('battle.closeBattleLog')} arrow>
                                                <IconButton
                                                    onClick={() => setBattleLogVisible(false)}
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
                                                    <ExpandLess />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                        <div className={styles.battleLog}>
                                            {battleLog.length === 0 ? (
                                                <Typography variant="body2" sx={{ color: '#ffffff', fontFamily: 'Press Start 2P', fontSize: '0.7rem' }}>{t('battle.noBattleLog')}</Typography>
                                            ) : (
                                                battleLog.map((entry, idx) => (
                                                    <Typography key={idx} variant="body2" className={styles[`${entry.type}Log`] || styles.battleLogEntry}>
                                                        {entry.message}
                                                    </Typography>
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
                                                    onClick={() => handleUsePotion(potion.id)}
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
                                            <Typography className={getStatDisplay(currentEnemy?.id, 'atk', currentBattle.enemy.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                ⚔️ Attack: {getStatDisplay(currentEnemy?.id, 'atk', currentBattle.enemy.ATK)}
                                            </Typography>
                                            <Typography className={getStatDisplay(currentEnemy?.id, 'attack_type', currentBattle.enemy.ATTACK_TYPE) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                🎯 Attack Type: {getStatDisplay(currentEnemy?.id, 'attack_type', currentBattle.enemy.ATTACK_TYPE) === "" ? "" : `${currentBattle.enemy.ATTACK_TYPE || "Melee"}`}
                                            </Typography>
                                            <Typography className={getStatDisplay(currentEnemy?.id, 'def', currentBattle.enemy.DEF) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                🛡️ Def: {getStatDisplay(currentEnemy?.id, 'def', currentBattle.enemy.DEF)}
                                            </Typography>
                                            <Typography className={getStatDisplay(currentEnemy?.id, 'magic_def', currentBattle.enemy.MAGIC_DEF) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                🧙 Magic Def: {getStatDisplay(currentEnemy?.id, 'magic_def', currentBattle.enemy.MAGIC_DEF) === "" ? "" : `${currentBattle.enemy.MAGIC_DEF || 0}`}
                                            </Typography>
                                            <Typography className={getStatDisplay(currentEnemy?.id, 'hp', currentBattle.enemy.maxHp) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                ❤️ HP: {getEnemyHpDisplay(currentEnemy?.id, currentBattle.enemy.currentHealth, currentBattle.enemy.maxHp)}
                                            </Typography>
                                            <Typography className={getStatDisplay(currentEnemy?.id, 'energy_shield', currentBattle.enemy.ENERGY_SHIELD) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                🛡️ Energy Shield: {getStatDisplay(currentEnemy?.id, 'energy_shield', currentBattle.enemy.ENERGY_SHIELD) === "" ? "" : `${currentBattle.enemy.ENERGY_SHIELD || 0}`}
                                            </Typography>
                                            <Typography className={getStatDisplay(currentEnemy?.id, 'base_damage', currentBattle.enemy.BASE_DAMAGE_MIN) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                ⚔️ Base Damage: {getStatDisplay(currentEnemy?.id, 'base_damage', currentBattle.enemy.BASE_DAMAGE_MIN) === "" ? "" : `${currentBattle.enemy.BASE_DAMAGE_MIN || 0}-${currentBattle.enemy.BASE_DAMAGE_MAX || 0}`}
                                            </Typography>
                                            <Typography className={getStatDisplay(currentEnemy?.id, 'attack_speed', currentBattle.enemy.ATTACK_SPEED) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                ⚡ {t('battle.attackSpeed')}: {getStatDisplay(currentEnemy?.id, 'attack_speed', currentBattle.enemy.ATTACK_SPEED) === "" ? "" : currentBattle.enemy.ATTACK_SPEED}
                                            </Typography>
                                            <Typography className={getStatDisplay(currentEnemy?.id, 'crit_chance', currentBattle.enemy.CRIT_CHANCE || 3) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                🎯 {t('battle.criticalChance')}: {getStatDisplay(currentEnemy?.id, 'crit_chance', currentBattle.enemy.CRIT_CHANCE || 3) === "" ? "" : `${currentBattle.enemy.CRIT_CHANCE || 3}%`}
                                            </Typography>
                                            <Typography className={getStatDisplay(currentEnemy?.id, 'crit_damage', currentBattle.enemy.CRIT_DAMAGE || 120) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                💥 {t('battle.criticalDamage')}: {getStatDisplay(currentEnemy?.id, 'crit_damage', currentBattle.enemy.CRIT_DAMAGE || 120) === "" ? "" : `${currentBattle.enemy.CRIT_DAMAGE || 120}%`}
                                            </Typography>
                                            <Divider sx={{ my: 1 }} />
                                            <Typography className={getStatDisplay(currentEnemy?.id, 'hit_chance', 0) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                🎲 {t('battle.hitChance')}: {getStatDisplay(currentEnemy?.id, 'hit_chance', 0) === "" ? "" : `${calculateHitChance(currentEnemy?.ATK || 0, playerStats.DEF)}%`}
                                            </Typography>
                                            {(() => {
                                                const damageRange = calculateDamageRange(currentBattle.enemy.ATK, currentBattle.player.DEF);
                                                const critDamageRange = {
                                                    min: Math.floor(damageRange.min * ((currentBattle.enemy.CRIT_DAMAGE || 120) / 100)),
                                                    max: Math.floor(damageRange.max * ((currentBattle.enemy.CRIT_DAMAGE || 120) / 100))
                                                };
                                                return (
                                                    <>
                                                        <Typography className={getStatDisplay(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                            ⚔️ {t('battle.baseDamage')}: {getStatDisplay(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? "" : `${damageRange.min}-${damageRange.max}`}
                                                        </Typography>
                                                        <Typography className={getStatDisplay(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                            💥 {t('battle.critDamage')}: {getStatDisplay(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? "" : `${critDamageRange.min}-${critDamageRange.max}`}
                                                        </Typography>
                                                    </>
                                                );
                                            })()}
                                        </>
                                    ) : (
                                        <>
                                            <Typography className={getStatDisplay(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                ⚔️ {t('battle.attack')}: {getStatDisplay(currentEnemy?.id, 'atk', currentEnemy?.ATK)}
                                            </Typography>
                                            <Typography className={getStatDisplay(currentEnemy?.id, 'def', currentEnemy?.DEF) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                🛡️ {t('battle.defense')}: {getStatDisplay(currentEnemy?.id, 'def', currentEnemy?.DEF)}
                                            </Typography>
                                            <Typography className={getStatDisplay(currentEnemy?.id, 'hp', currentEnemy?.maxHp) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                ❤️ {t('battle.health')}: {getStatDisplay(currentEnemy?.id, 'hp', currentEnemy?.maxHp) === "" ? "" : `${currentEnemy?.maxHp}/${currentEnemy?.maxHp}`}
                                            </Typography>
                                            <Typography className={getStatDisplay(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                ⚡ {t('battle.attackSpeed')}: {currentEnemy?.ATTACK_SPEED || 1.5}
                                            </Typography>
                                            <Typography className={getStatDisplay(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                🎯 {t('battle.criticalChance')}: 3%
                                            </Typography>
                                            <Typography className={getStatDisplay(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                💥 {t('battle.criticalDamage')}: 120%
                                            </Typography>
                                            <Divider sx={{ my: 1 }} />
                                            <Typography className={getStatDisplay(currentEnemy?.id, 'hit_chance', 0) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                🎲 {t('battle.hitChance')}: {calculateHitChance(currentEnemy?.ATK || 0, playerStats.DEF)}%
                                            </Typography>
                                            <Typography className={getStatDisplay(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
                                                ⚔️ {t('battle.baseDamage')}: {calculateDamage(currentEnemy?.ATK || 0, playerStats.DEF, 0)}
                                            </Typography>
                                            <Typography className={getStatDisplay(currentEnemy?.id, 'atk', currentEnemy?.ATK) === "" ? styles.hiddenStat : styles.revealedStat}>
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
                                <div className={styles.section}>
                                    <Typography variant="h6">{t('battle.lootGained')}</Typography>
                                    <Divider />
                                    {lootBag.length === 0 ? (
                                        <Typography>{t('battle.noLootYet')}</Typography>
                                    ) : (
                                        <div className={styles.lootSymbolsContainer}>
                                            {lootBag.map((item, idx) => {
                                                const isGold = item.includes('💰');
                                                const isEquipment = item.includes('⚔️') || item.includes('🛡️') || item.includes('💍') || item.includes('👑');
                                                const isChest = item.includes('🎁') && item.includes('Chest');
                                                
                                                let symbol = '📦';
                                                let tooltipContent = item;
                                                let clickHandler = null;
                                                
                                                if (isChest) {
                                                    symbol = '🎁';
                                                    const dungeonName = item.replace('🎁 ', '').replace(' Chest', '');
                                                    const dungeon = DUNGEONS.find(d => d.name === dungeonName);
                                                    
                                                    if (dungeon && dungeon.chest) {
                                                        tooltipContent = (
                                                            <Box sx={{ p: 1 }}>
                                                                <Typography variant="h6" sx={{ mb: 1, color: '#ffd700' }}>
                                                                    {dungeonName} Chest
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ mb: 1, color: '#e0e0e0' }}>
                                                                    {t('battle.possibleDrops')}:
                                                                </Typography>
                                                                {dungeon.chest.map((chestItem, chestIdx) => (
                                                                    <Typography key={chestIdx} variant="body2" sx={{ mb: 0.5, color: '#ffffff' }}>
                                                                        {chestItem.name} - {chestItem.chance}%
                                                                    </Typography>
                                                                ))}
                                                                <Typography variant="body2" sx={{ mt: 1, color: '#4ade80', fontStyle: 'italic' }}>
                                                                    Click to open!
                                                                </Typography>
                                                            </Box>
                                                        );
                                                    }
                                                    clickHandler = () => handleChestClick(item);
                                                } else if (isGold) {
                                                    symbol = '💰';
                                                    tooltipContent = `Gold: ${item.replace('💰', '').trim()}`;
                                                } else if (isEquipment) {
                                                    if (item.includes('⚔️')) symbol = '⚔️';
                                                    else if (item.includes('🛡️')) symbol = '🛡️';
                                                    else if (item.includes('💍')) symbol = '💍';
                                                    else if (item.includes('👑')) symbol = '👑';
                                                    else symbol = '⚔️';
                                                    tooltipContent = `Equipment: ${item.replace(/[⚔️🛡️💍👑]/g, '').trim()}`;
                                                }
                                                
                                                return (
                                                    <Tooltip 
                                                        key={`loot-${idx}-${item}`} 
                                                        title={tooltipContent}
                                                        arrow
                                                        placement="top"
                                                    >
                                                        <div 
                                                            className={`${styles.lootSymbol} ${
                                                                isChest ? styles.chestSymbol : 
                                                                isGold ? styles.goldSymbol : 
                                                                styles.equipmentSymbol
                                                            }`}
                                                            onClick={clickHandler}
                                                            style={{ cursor: isChest ? 'pointer' : 'default' }}
                                                        >
                                                            {symbol}
                                                        </div>
                                                    </Tooltip>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
            {/* Death Dialog */}
            <Dialog open={deathDialog.open} disableEscapeKeyDown>
                <DialogTitle className={styles.deathDialogTitle}>
                    ☠️ {t('battle.youDied')}
                </DialogTitle>
                <DialogContent className={styles.deathDialogContent}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {t('battle.deathMessage')}
                    </Typography>
                    
                    {/* Death Penalties */}
                    {(deathDialog.goldLost > 0 || deathDialog.equipmentLost.length > 0) && (
                        <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: 1 }}>
                            <Typography variant="h6" sx={{ mb: 1, color: '#f44336' }}>
                                💀 {t('battle.deathPenalties')}
                            </Typography>
                            
                            {deathDialog.goldLost > 0 && (
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    💰 {t('battle.goldLost', { amount: formatGold(deathDialog.goldLost) })}
                                </Typography>
                            )}
                            
                            {deathDialog.equipmentLost.length > 0 && (
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        ⚔️ {t('battle.equipmentLost')}:
                                    </Typography>
                                    {deathDialog.equipmentLost.map((lost, index) => (
                                        <Typography key={index} variant="body2" sx={{ ml: 2, color: '#f44336' }}>
                                            • {lost.item} ({lost.slot})
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    )}
                    
                    <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                        {t('battle.respawnIn', { seconds: deathDialog.countdown })}
                    </Typography>
                </DialogContent>
            </Dialog>

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
