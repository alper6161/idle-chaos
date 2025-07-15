// Achievement system for tracking enemy kills and unlocking achievements

import { getCurrentSlot } from './saveManager.js';

const getAchievementStorageKey = () => {
    const currentSlot = getCurrentSlot();
    return `idle-chaos-achievements-slot-${currentSlot}`;
};

const ACHIEVEMENT_THRESHOLDS = {
    goblin: [
        { kills: 10, reward: 'unlock_hp', description: 'Goblin HP revealed' },
        { kills: 25, reward: 'unlock_atk', description: 'Goblin ATK revealed' },
        { kills: 50, reward: 'unlock_def', description: 'Goblin DEF revealed' },
        { kills: 100, reward: 'unlock_all', description: 'All Goblin stats revealed' }
    ],
    rat: [
        { kills: 10, reward: 'unlock_hp', description: 'Rat HP revealed' },
        { kills: 25, reward: 'unlock_atk', description: 'Rat ATK revealed' },
        { kills: 50, reward: 'unlock_def', description: 'Rat DEF revealed' },
        { kills: 100, reward: 'unlock_all', description: 'All Rat stats revealed' }
    ],
    slime: [
        { kills: 10, reward: 'unlock_hp', description: 'Slime HP revealed' },
        { kills: 25, reward: 'unlock_atk', description: 'Slime ATK revealed' },
        { kills: 50, reward: 'unlock_def', description: 'Slime DEF revealed' },
        { kills: 100, reward: 'unlock_all', description: 'All Slime stats revealed' }
    ],
    spider: [
        { kills: 10, reward: 'unlock_hp', description: 'Spider HP revealed' },
        { kills: 25, reward: 'unlock_atk', description: 'Spider ATK revealed' },
        { kills: 50, reward: 'unlock_def', description: 'Spider DEF revealed' },
        { kills: 100, reward: 'unlock_all', description: 'All Spider stats revealed' }
    ],
    bat: [
        { kills: 10, reward: 'unlock_hp', description: 'Bat HP revealed' },
        { kills: 25, reward: 'unlock_atk', description: 'Bat ATK revealed' },
        { kills: 50, reward: 'unlock_def', description: 'Bat DEF revealed' },
        { kills: 100, reward: 'unlock_all', description: 'All Bat stats revealed' }
    ],
    skeleton: [
        { kills: 10, reward: 'unlock_hp', description: 'Skeleton HP revealed' },
        { kills: 25, reward: 'unlock_atk', description: 'Skeleton ATK revealed' },
        { kills: 50, reward: 'unlock_def', description: 'Skeleton DEF revealed' },
        { kills: 100, reward: 'unlock_all', description: 'All Skeleton stats revealed' }
    ],

    orc: [
        { kills: 10, reward: 'unlock_hp', description: 'Orc HP revealed' },
        { kills: 25, reward: 'unlock_atk', description: 'Orc ATK revealed' },
        { kills: 50, reward: 'unlock_def', description: 'Orc DEF revealed' },
        { kills: 100, reward: 'unlock_all', description: 'All Orc stats revealed' }
    ],
    wolf: [
        { kills: 10, reward: 'unlock_hp', description: 'Wolf HP revealed' },
        { kills: 25, reward: 'unlock_atk', description: 'Wolf ATK revealed' },
        { kills: 50, reward: 'unlock_def', description: 'Wolf DEF revealed' },
        { kills: 100, reward: 'unlock_all', description: 'All Wolf stats revealed' }
    ],
    zombie: [
        { kills: 10, reward: 'unlock_hp', description: 'Zombie HP revealed' },
        { kills: 25, reward: 'unlock_atk', description: 'Zombie ATK revealed' },
        { kills: 50, reward: 'unlock_def', description: 'Zombie DEF revealed' },
        { kills: 100, reward: 'unlock_all', description: 'All Zombie stats revealed' }
    ],
    bandit: [
        { kills: 10, reward: 'unlock_hp', description: 'Bandit HP revealed' },
        { kills: 25, reward: 'unlock_atk', description: 'Bandit ATK revealed' },
        { kills: 50, reward: 'unlock_def', description: 'Bandit DEF revealed' },
        { kills: 100, reward: 'unlock_all', description: 'All Bandit stats revealed' }
    ],
    troll: [
        { kills: 10, reward: 'unlock_hp', description: 'Troll HP revealed' },
        { kills: 25, reward: 'unlock_atk', description: 'Troll ATK revealed' },
        { kills: 50, reward: 'unlock_def', description: 'Troll DEF revealed' },
        { kills: 100, reward: 'unlock_all', description: 'All Troll stats revealed' }
    ],
    lizardman: [
        { kills: 10, reward: 'unlock_hp', description: 'Lizardman HP revealed' },
        { kills: 25, reward: 'unlock_atk', description: 'Lizardman ATK revealed' },
        { kills: 50, reward: 'unlock_def', description: 'Lizardman DEF revealed' },
        { kills: 100, reward: 'unlock_all', description: 'All Lizardman stats revealed' }
    ],
    giant_bee: [
        { kills: 10, reward: 'unlock_hp', description: 'Giant Bee HP revealed' },
        { kills: 25, reward: 'unlock_atk', description: 'Giant Bee ATK revealed' },
        { kills: 50, reward: 'unlock_def', description: 'Giant Bee DEF revealed' },
        { kills: 100, reward: 'unlock_all', description: 'All Giant Bee stats revealed' }
    ],
    cultist: [
        { kills: 10, reward: 'unlock_hp', description: 'Cultist HP revealed' },
        { kills: 25, reward: 'unlock_atk', description: 'Cultist ATK revealed' },
        { kills: 50, reward: 'unlock_def', description: 'Cultist DEF revealed' },
        { kills: 100, reward: 'unlock_all', description: 'All Cultist stats revealed' }
    ],
    gargoyle: [
        { kills: 10, reward: 'unlock_hp', description: 'Gargoyle HP revealed' },
        { kills: 25, reward: 'unlock_atk', description: 'Gargoyle ATK revealed' },
        { kills: 50, reward: 'unlock_def', description: 'Gargoyle DEF revealed' },
        { kills: 100, reward: 'unlock_all', description: 'All Gargoyle stats revealed' }
    ],
    harpy: [
        { kills: 10, reward: 'unlock_hp', description: 'Harpy HP revealed' },
        { kills: 25, reward: 'unlock_atk', description: 'Harpy ATK revealed' },
        { kills: 50, reward: 'unlock_def', description: 'Harpy DEF revealed' },
        { kills: 100, reward: 'unlock_all', description: 'All Harpy stats revealed' }
    ],

    minotaur: [
        { kills: 5, reward: 'unlock_hp', description: 'Minotaur HP revealed' },
        { kills: 15, reward: 'unlock_atk', description: 'Minotaur ATK revealed' },
        { kills: 30, reward: 'unlock_def', description: 'Minotaur DEF revealed' },
        { kills: 50, reward: 'unlock_all', description: 'All Minotaur stats revealed' }
    ],
    wraith: [
        { kills: 5, reward: 'unlock_hp', description: 'Wraith HP revealed' },
        { kills: 15, reward: 'unlock_atk', description: 'Wraith ATK revealed' },
        { kills: 30, reward: 'unlock_def', description: 'Wraith DEF revealed' },
        { kills: 50, reward: 'unlock_all', description: 'All Wraith stats revealed' }
    ],
    werewolf: [
        { kills: 5, reward: 'unlock_hp', description: 'Werewolf HP revealed' },
        { kills: 15, reward: 'unlock_atk', description: 'Werewolf ATK revealed' },
        { kills: 30, reward: 'unlock_def', description: 'Werewolf DEF revealed' },
        { kills: 50, reward: 'unlock_all', description: 'All Werewolf stats revealed' }
    ],
    golem: [
        { kills: 5, reward: 'unlock_hp', description: 'Golem HP revealed' },
        { kills: 15, reward: 'unlock_atk', description: 'Golem ATK revealed' },
        { kills: 30, reward: 'unlock_def', description: 'Golem DEF revealed' },
        { kills: 50, reward: 'unlock_all', description: 'All Golem stats revealed' }
    ],
    vampire: [
        { kills: 5, reward: 'unlock_hp', description: 'Vampire HP revealed' },
        { kills: 15, reward: 'unlock_atk', description: 'Vampire ATK revealed' },
        { kills: 30, reward: 'unlock_def', description: 'Vampire DEF revealed' },
        { kills: 50, reward: 'unlock_all', description: 'All Vampire stats revealed' }
    ],
    chimera: [
        { kills: 5, reward: 'unlock_hp', description: 'Chimera HP revealed' },
        { kills: 15, reward: 'unlock_atk', description: 'Chimera ATK revealed' },
        { kills: 30, reward: 'unlock_def', description: 'Chimera DEF revealed' },
        { kills: 50, reward: 'unlock_all', description: 'All Chimera stats revealed' }
    ],

    hydra: [
        { kills: 3, reward: 'unlock_hp', description: 'Hydra HP revealed' },
        { kills: 10, reward: 'unlock_atk', description: 'Hydra ATK revealed' },
        { kills: 20, reward: 'unlock_def', description: 'Hydra DEF revealed' },
        { kills: 30, reward: 'unlock_all', description: 'All Hydra stats revealed' }
    ],
    demon: [
        { kills: 3, reward: 'unlock_hp', description: 'Demon HP revealed' },
        { kills: 10, reward: 'unlock_atk', description: 'Demon ATK revealed' },
        { kills: 20, reward: 'unlock_def', description: 'Demon DEF revealed' },
        { kills: 30, reward: 'unlock_all', description: 'All Demon stats revealed' }
    ],
    lich: [
        { kills: 3, reward: 'unlock_hp', description: 'Lich HP revealed' },
        { kills: 10, reward: 'unlock_atk', description: 'Lich ATK revealed' },
        { kills: 20, reward: 'unlock_def', description: 'Lich DEF revealed' },
        { kills: 30, reward: 'unlock_all', description: 'All Lich stats revealed' }
    ],
    manticore: [
        { kills: 3, reward: 'unlock_hp', description: 'Manticore HP revealed' },
        { kills: 10, reward: 'unlock_atk', description: 'Manticore ATK revealed' },
        { kills: 20, reward: 'unlock_def', description: 'Manticore DEF revealed' },
        { kills: 30, reward: 'unlock_all', description: 'All Manticore stats revealed' }
    ],

    ancient_dragon: [
        { kills: 2, reward: 'unlock_hp', description: 'Ancient Dragon HP revealed' },
        { kills: 5, reward: 'unlock_atk', description: 'Ancient Dragon ATK revealed' },
        { kills: 10, reward: 'unlock_def', description: 'Ancient Dragon DEF revealed' },
        { kills: 20, reward: 'unlock_all', description: 'All Ancient Dragon stats revealed' }
    ],
    archdemon: [
        { kills: 2, reward: 'unlock_hp', description: 'Archdemon HP revealed' },
        { kills: 5, reward: 'unlock_atk', description: 'Archdemon ATK revealed' },
        { kills: 10, reward: 'unlock_def', description: 'Archdemon DEF revealed' },
        { kills: 20, reward: 'unlock_all', description: 'All Archdemon stats revealed' }
    ],
    void_reaper: [
        { kills: 2, reward: 'unlock_hp', description: 'Void Reaper HP revealed' },
        { kills: 5, reward: 'unlock_atk', description: 'Void Reaper ATK revealed' },
        { kills: 10, reward: 'unlock_def', description: 'Void Reaper DEF revealed' },
        { kills: 20, reward: 'unlock_all', description: 'All Void Reaper stats revealed' }
    ],
    celestial_seraph: [
        { kills: 2, reward: 'unlock_hp', description: 'Celestial Seraph HP revealed' },
        { kills: 5, reward: 'unlock_atk', description: 'Celestial Seraph ATK revealed' },
        { kills: 10, reward: 'unlock_def', description: 'Celestial Seraph DEF revealed' },
        { kills: 20, reward: 'unlock_all', description: 'All Celestial Seraph stats revealed' }
    ],

    dragon: [
        { kills: 5, reward: 'unlock_hp', description: 'Dragon HP revealed' },
        { kills: 15, reward: 'unlock_atk', description: 'Dragon ATK revealed' },
        { kills: 30, reward: 'unlock_def', description: 'Dragon DEF revealed' },
        { kills: 50, reward: 'unlock_all', description: 'All Dragon stats revealed' }
    ],
    ghost: [
        { kills: 10, reward: 'unlock_hp', description: 'Ghost HP revealed' },
        { kills: 25, reward: 'unlock_atk', description: 'Ghost ATK revealed' },
        { kills: 50, reward: 'unlock_def', description: 'Ghost DEF revealed' },
        { kills: 100, reward: 'unlock_all', description: 'All Ghost stats revealed' }
    ]
};

export const loadAchievements = () => {
    try {
        const storageKey = getAchievementStorageKey();
        const stored = localStorage.getItem(storageKey);
        return stored ? JSON.parse(stored) : {
            kills: {},
            unlocked: {},
            totalKills: 0
        };
    } catch (error) {
        console.error('Error loading achievements:', error);
        return {
            kills: {},
            unlocked: {},
            totalKills: 0
        };
    }
};

export const saveAchievements = (achievements) => {
    try {
        const storageKey = getAchievementStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(achievements));
    } catch (error) {
        console.error('Error saving achievements:', error);
    }
};

export const recordKill = (enemyId) => {
    const achievements = loadAchievements();
    
    achievements.kills[enemyId] = (achievements.kills[enemyId] || 0) + 1;
    achievements.totalKills = (achievements.totalKills || 0) + 1;
    
    const thresholds = ACHIEVEMENT_THRESHOLDS[enemyId];
    if (thresholds) {
        const currentKills = achievements.kills[enemyId];
        const newAchievements = [];
        
        thresholds.forEach(threshold => {
            if (currentKills >= threshold.kills && !achievements.unlocked[`${enemyId}_${threshold.kills}`]) {
                achievements.unlocked[`${enemyId}_${threshold.kills}`] = {
                    reward: threshold.reward,
                    description: threshold.description,
                    unlockedAt: Date.now()
                };
                newAchievements.push({
                    enemyId,
                    kills: threshold.kills,
                    reward: threshold.reward,
                    description: threshold.description
                });
            }
        });
        
        saveAchievements(achievements);
        return { achievements, newAchievements };
    }
    
    saveAchievements(achievements);
    return { achievements, newAchievements: [] };
};

export const getKillCount = (enemyId) => {
    const achievements = loadAchievements();
    return achievements.kills[enemyId] || 0;
};

export const getTotalKills = () => {
    const achievements = loadAchievements();
    return achievements.totalKills || 0;
};

export const isAchievementUnlocked = (enemyId, killThreshold) => {
    const achievements = loadAchievements();
    return !!achievements.unlocked[`${enemyId}_${killThreshold}`];
};

export const getUnlockedAchievements = (enemyId) => {
    const achievements = loadAchievements();
    const unlocked = [];
    
    Object.keys(achievements.unlocked).forEach(key => {
        if (key.startsWith(`${enemyId}_`)) {
            const killThreshold = key.split('_')[1];
            unlocked.push({
                killThreshold: parseInt(killThreshold),
                ...achievements.unlocked[key]
            });
        }
    });
    
    return unlocked.sort((a, b) => a.killThreshold - b.killThreshold);
};

export const getNextAchievement = (enemyId) => {
    const thresholds = ACHIEVEMENT_THRESHOLDS[enemyId];
    if (!thresholds) return null;
    
    const currentKills = getKillCount(enemyId);
    
    for (const threshold of thresholds) {
        if (currentKills < threshold.kills) {
            return {
                ...threshold,
                progress: currentKills,
                remaining: threshold.kills - currentKills
            };
        }
    }
    
    return null;
};

export const getAllAchievementsData = () => {
    const achievements = loadAchievements();
    const data = {};
    
    Object.keys(ACHIEVEMENT_THRESHOLDS).forEach(enemyId => {
        const thresholds = ACHIEVEMENT_THRESHOLDS[enemyId];
        const currentKills = achievements.kills[enemyId] || 0;
        const unlockedAchievements = getUnlockedAchievements(enemyId);
        
        data[enemyId] = {
            currentKills,
            thresholds,
            unlockedAchievements,
            nextAchievement: getNextAchievement(enemyId)
        };
    });
    
    return data;
};

export const getAchievementProgress = (enemyId) => {
    const currentKills = getKillCount(enemyId);
    const thresholds = ACHIEVEMENT_THRESHOLDS[enemyId];
    
    if (!thresholds || thresholds.length === 0) return 0;
    
    const maxKills = thresholds[thresholds.length - 1].kills;
    return Math.min((currentKills / maxKills) * 100, 100);
}; 