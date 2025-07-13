// Achievement system for tracking enemy kills and unlocking achievements

const ACHIEVEMENT_STORAGE_KEY = 'idle-chaos-achievements';

// Achievement thresholds for each enemy type
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
    troll: [
        { kills: 10, reward: 'unlock_hp', description: 'Troll HP revealed' },
        { kills: 25, reward: 'unlock_atk', description: 'Troll ATK revealed' },
        { kills: 50, reward: 'unlock_def', description: 'Troll DEF revealed' },
        { kills: 100, reward: 'unlock_all', description: 'All Troll stats revealed' }
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
    ],
    spider: [
        { kills: 10, reward: 'unlock_hp', description: 'Spider HP revealed' },
        { kills: 25, reward: 'unlock_atk', description: 'Spider ATK revealed' },
        { kills: 50, reward: 'unlock_def', description: 'Spider DEF revealed' },
        { kills: 100, reward: 'unlock_all', description: 'All Spider stats revealed' }
    ]
};

// Load achievements from localStorage
export const loadAchievements = () => {
    try {
        const stored = localStorage.getItem(ACHIEVEMENT_STORAGE_KEY);
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

// Save achievements to localStorage
export const saveAchievements = (achievements) => {
    try {
        localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(achievements));
    } catch (error) {
        console.error('Error saving achievements:', error);
    }
};

// Record a kill for a specific enemy
export const recordKill = (enemyId) => {
    const achievements = loadAchievements();
    
    // Increment kill count for this enemy
    achievements.kills[enemyId] = (achievements.kills[enemyId] || 0) + 1;
    achievements.totalKills = (achievements.totalKills || 0) + 1;
    
    // Check for new achievements
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

// Get kill count for a specific enemy
export const getKillCount = (enemyId) => {
    const achievements = loadAchievements();
    return achievements.kills[enemyId] || 0;
};

// Get total kill count
export const getTotalKills = () => {
    const achievements = loadAchievements();
    return achievements.totalKills || 0;
};

// Check if a specific achievement is unlocked
export const isAchievementUnlocked = (enemyId, killThreshold) => {
    const achievements = loadAchievements();
    return !!achievements.unlocked[`${enemyId}_${killThreshold}`];
};

// Get all unlocked achievements for an enemy
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

// Get next achievement for an enemy
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
    
    return null; // All achievements unlocked
};

// Get all achievements data for display
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

// Get achievement progress percentage
export const getAchievementProgress = (enemyId) => {
    const currentKills = getKillCount(enemyId);
    const thresholds = ACHIEVEMENT_THRESHOLDS[enemyId];
    
    if (!thresholds || thresholds.length === 0) return 0;
    
    const maxKills = thresholds[thresholds.length - 1].kills;
    return Math.min((currentKills / maxKills) * 100, 100);
}; 