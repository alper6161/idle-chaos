// BattleTestUtils.js

// Example usage: see Battle.jsx for how to pass context/state

export function handleTestDropPotion({ getRandomTestPotion, addPotions, notifyItemDrop, refreshPotions }) {
    const potionDrop = getRandomTestPotion();
    addPotions(potionDrop.id, 1);
    notifyItemDrop(`${potionDrop.name} (+${potionDrop.healAmount} HP)`, '🧪');
    setTimeout(() => {
        refreshPotions();
    }, 100);
}

export function handleTestHurtSelf({ currentBattle, setCurrentBattle, setPlayerHealth, playerHealth, setDamageDisplay, setBattleLog }) {
    const damage = 20;
    if (currentBattle) {
        const newHealth = Math.max(0, currentBattle.player.currentHealth - damage);
        setCurrentBattle(prev => ({
            ...prev,
            player: { ...prev.player, currentHealth: newHealth }
        }));
        setPlayerHealth(newHealth);
    } else {
        const newHealth = Math.max(0, playerHealth - damage);
        setPlayerHealth(newHealth);
    }
    setDamageDisplay(prev => ({
        ...prev,
        player: { amount: `-${damage}`, type: 'damage' }
    }));
    setTimeout(() => {
        setDamageDisplay(prev => ({
            ...prev,
            player: null
        }));
    }, 2000);
    setBattleLog(prev => [...prev, {
        type: 'damage',
        message: `💔 Self damage: -${damage} HP`
    }]);
}

export function handleKillEnemy({
    currentBattle, currentEnemy, setCurrentBattle, setIsBattleActive, setPlayerHealth, recordKill, dungeonRun, getLootDrop, updatePlayerGold, notifyGoldGain, addToLootBag, notifyItemDrop, getRandomPotionDrop, addPotions, refreshPotions, checkPetDrop, getCurrentSlot, getSlotKey, setBattleLog, notifyAchievement, t, spawnNewEnemy
}) {
    if (currentBattle && currentEnemy) {
        const updatedBattle = {
            ...currentBattle,
            enemy: { ...currentBattle.enemy, currentHealth: 0 }
        };
        setCurrentBattle(updatedBattle);
        const battleResult = {
            winner: 'player',
            playerFinalHealth: currentBattle.player.currentHealth,
            enemyFinalHealth: 0
        };
        if (!dungeonRun || dungeonRun.completed) {
            setIsBattleActive(false);
        }
        setPlayerHealth(battleResult.playerFinalHealth);
        const achievementResult = currentEnemy ? recordKill(currentEnemy.id) : { achievements: {}, newAchievements: [] };
        let newLoot = [];
        if (!dungeonRun || dungeonRun.completed) {
            const lootResult = currentEnemy ? getLootDrop(currentEnemy.drops) : { items: [], gold: 0, goldItems: [] };
            newLoot = [...lootResult.items];
            if (lootResult.goldItems && lootResult.goldItems.length > 0) {
                updatePlayerGold(lootResult.gold);
                if (lootResult.gold > 0) {
                    notifyGoldGain(lootResult.gold, `${currentEnemy?.name || 'Enemy'} drops`);
                }
            }
            const itemsToAdd = addToLootBag(newLoot);
            itemsToAdd.forEach(itemName => {
                notifyItemDrop(itemName, '📦');
            });
            if (currentEnemy) {
                const potionDrop = getRandomPotionDrop(currentEnemy.id);
                if (potionDrop) {
                    addPotions(potionDrop.id, 1);
                    notifyItemDrop(`${potionDrop.name} (+${potionDrop.healAmount} HP)`, '🧪');
                    setTimeout(() => {
                        refreshPotions();
                    }, 100);
                }
            }
        }
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
        const battleLogMessages = [
            {
                type: 'victory',
                message: dungeonRun && !dungeonRun.completed 
                    ? `🎉 ${currentEnemy?.name || 'Enemy'} defeated! Stage ${dungeonRun.currentStage + 1}/7 complete.`
                    : `🎉 ${t('battle.playerWins')}! Enemy defeated!`
            }
        ];
        if (achievementResult.newAchievements.length > 0) {
            achievementResult.newAchievements.forEach(achievement => {
                battleLogMessages.push({
                    type: 'achievement',
                    message: `🏆 Achievement Unlocked: ${achievement.description}!`
                });
                notifyAchievement(achievement.description);
            });
        }
        if (!dungeonRun || dungeonRun.completed) {
            battleLogMessages.push(...newLoot.map(item => ({
                type: 'loot',
                message: `📦 Loot: ${item}`
            })));
            if (petDropMessage) {
                battleLogMessages.push({
                    type: 'pet',
                    message: petDropMessage
                });
            }
        }
        setBattleLog(prev => [...prev, ...battleLogMessages]);
        spawnNewEnemy();
    }
}

export function handleTestDie({ setIsBattleActive, showDeathDialog }) {
    setIsBattleActive(false);
    showDeathDialog();
}

export function completeDungeonRun({ dungeonRun, setDungeonRun, setIsBattleActive, setCurrentBattle, setCurrentEnemy, lootBag, setLootBag, setDungeonCompleteDialog }) {
    if (!dungeonRun || dungeonRun.completed) return;
    setDungeonRun(prev => ({ ...prev, currentStage: 6, completed: true }));
    setIsBattleActive(false);
    setCurrentBattle(null);
    setCurrentEnemy(null);
    const chestName = `🎁 ${dungeonRun.dungeon.name} Chest`;
    if (!lootBag.includes(chestName)) {
        setLootBag([...lootBag, chestName]);
    }
    setDungeonCompleteDialog({ open: true, countdown: 5 });
}

export function handleCompleteDungeon(ctx) {
    completeDungeonRun(ctx);
} 