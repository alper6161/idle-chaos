import { useState, useEffect } from "react";
import styles from "../assets/styles/Achievement.module.scss";
import {
    Typography,
    Box,
    Paper,
    Card,
    CardContent,
    Avatar,
    LinearProgress,
    Chip,
    Grid,
    Tooltip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
} from "@mui/material";
import { 
    EmojiEvents, 
    Visibility, 
    VisibilityOff,
    Star,
    StarBorder,
    TrendingUp,
    Person
} from "@mui/icons-material";
import { useTranslate } from "../hooks/useTranslate";
import { 
    getAllAchievementsData, 
    getTotalKills, 
    getAchievementProgress,
    isAchievementUnlocked 
} from "../utils/achievements";
import { getEnemyIcon, getEnemyInitial } from "../utils/common";
import enemies from "../utils/enemies";

const ACHIEVEMENT_ICONS = {
    unlock_hp: "❤️",
    unlock_atk: "⚔️", 
    unlock_def: "🛡️",
    unlock_all: "⭐"
};

const ACHIEVEMENT_COLORS = {
    unlock_hp: "#ff6b6b",
    unlock_atk: "#4ecdc4",
    unlock_def: "#45b7d1", 
    unlock_all: "#ffd93d"
};

function Achievement() {
    const { t } = useTranslate();
    const [achievementsData, setAchievementsData] = useState({});
    const [totalKills, setTotalKills] = useState(0);
    const [selectedEnemy, setSelectedEnemy] = useState(null);
    const [achievementDialog, setAchievementDialog] = useState({
        open: false,
        enemy: null,
        achievements: []
    });

    useEffect(() => {
        loadAchievementsData();
        
        // Refresh data every 5 seconds to catch new kills
        const interval = setInterval(loadAchievementsData, 5000);
        return () => clearInterval(interval);
    }, []);

    const loadAchievementsData = () => {
        const data = getAllAchievementsData();
        setAchievementsData(data);
        setTotalKills(getTotalKills());
    };

    const handleEnemyClick = (enemyId) => {
        const enemy = enemies[enemyId.toUpperCase()];
        const data = achievementsData[enemyId];
        
        if (enemy && data) {
            setAchievementDialog({
                open: true,
                enemy: enemy,
                achievements: data.unlockedAchievements
            });
        }
    };

    const handleCloseDialog = () => {
        setAchievementDialog({ open: false, enemy: null, achievements: [] });
    };

    const getStatDisplay = (enemyId, statType, value) => {
        const isUnlocked = isAchievementUnlocked(enemyId, getThresholdForStat(statType));
        
        if (isUnlocked) {
            return value.toString();
        } else {
            return "???";
        }
    };

    const getThresholdForStat = (statType) => {
        switch (statType) {
            case 'hp': return 10;
            case 'atk': return 25;
            case 'def': return 50;
            default: return 100;
        }
    };

    const getAchievementIcon = (reward) => {
        return ACHIEVEMENT_ICONS[reward] || "🏆";
    };

    const getAchievementColor = (reward) => {
        return ACHIEVEMENT_COLORS[reward] || "#6b7280";
    };

    const calculateTotalProgress = () => {
        const allEnemies = Object.keys(enemies);
        let totalProgress = 0;
        let totalAchievements = 0;

        allEnemies.forEach(enemyKey => {
            const enemyId = enemyKey.toLowerCase();
            const data = achievementsData[enemyId];
            if (data) {
                totalProgress += data.unlockedAchievements.length;
                totalAchievements += data.thresholds.length;
            }
        });

        return totalAchievements > 0 ? (totalProgress / totalAchievements) * 100 : 0;
    };

    const getTotalUnlockedAchievements = () => {
        const allEnemies = Object.keys(enemies);
        let totalUnlocked = 0;
        let totalAchievements = 0;

        allEnemies.forEach(enemyKey => {
            const enemyId = enemyKey.toLowerCase();
            const data = achievementsData[enemyId];
            if (data) {
                totalUnlocked += data.unlockedAchievements.length;
                totalAchievements += data.thresholds.length;
            }
        });

        return { unlocked: totalUnlocked, total: totalAchievements };
    };

    const EnemyWidget = ({ enemyId, enemy, data }) => {
        const progress = getAchievementProgress(enemyId);
        const nextAchievement = data.nextAchievement;
        const unlockedCount = data.unlockedAchievements.length;
        const totalAchievements = data.thresholds.length;

        return (
            <Card className={styles.achievementCard} onClick={() => handleEnemyClick(enemyId)}>
                <CardContent className={styles.achievementCardContent}>
                    <div className={styles.achievementHeader}>
                        <Avatar 
                            src={getEnemyIcon(enemyId)} 
                            className={styles.enemyAvatar}
                            onError={(e) => {
                                if (e.target && e.target.nextSibling) {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }
                            }}
                        />
                        <div 
                            className={styles.enemyAvatarFallback}
                            style={{ display: 'none' }}
                        >
                            {getEnemyInitial(enemy.name)}
                        </div>
                        
                        <div className={styles.achievementInfo}>
                            <Typography variant="h6" className={styles.enemyName}>
                                {enemy.name}
                            </Typography>
                            <Typography variant="body2" className={styles.killCount}>
                                {t('achievements.kills')}: {data.currentKills}
                            </Typography>
                        </div>
                        
                        <div className={styles.achievementBadge}>
                            <Chip 
                                icon={<EmojiEvents />}
                                label={`${unlockedCount}/${totalAchievements}`}
                                color={unlockedCount === totalAchievements ? "success" : "default"}
                                size="small"
                            />
                        </div>
                    </div>

                    <div className={styles.achievementStats}>
                        <div className={styles.statRow}>
                            <span className={styles.statLabel}>❤️ HP:</span>
                            <span className={styles.statValue}>
                                {getStatDisplay(enemyId, 'hp', enemy.maxHp)}
                            </span>
                        </div>
                        <div className={styles.statRow}>
                            <span className={styles.statLabel}>⚔️ ATK:</span>
                            <span className={styles.statValue}>
                                {getStatDisplay(enemyId, 'atk', enemy.ATK)}
                            </span>
                        </div>
                        <div className={styles.statRow}>
                            <span className={styles.statLabel}>🛡️ DEF:</span>
                            <span className={styles.statValue}>
                                {getStatDisplay(enemyId, 'def', enemy.DEF)}
                            </span>
                        </div>
                    </div>

                    {nextAchievement && (
                        <div className={styles.nextAchievement}>
                            <Typography variant="caption" className={styles.nextAchievementText}>
                                {t('achievements.next')}: {nextAchievement.kills} {t('achievements.kills')}
                            </Typography>
                            <LinearProgress 
                                variant="determinate" 
                                value={(data.currentKills / nextAchievement.kills) * 100}
                                className={styles.progressBar}
                            />
                        </div>
                    )}

                    <div className={styles.achievementProgress}>
                        <LinearProgress 
                            variant="determinate" 
                            value={progress}
                            className={styles.overallProgress}
                        />
                        <Typography variant="caption" className={styles.progressText}>
                            {Math.round(progress)}% {t('achievements.complete')}
                        </Typography>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const { unlocked, total } = getTotalUnlockedAchievements();
    const totalProgress = calculateTotalProgress();

    return (
        <div className={styles.achievementContainer}>
            {/* Animated Background */}
            <div className={styles.backgroundAnimation}>
                <div className={styles.floatingParticles}>
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className={styles.particle}
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${3 + Math.random() * 2}s`
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Header Section */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.titleSection}>
                        <Typography variant="h4" className={styles.pixelTitle}>
                            🏆 {t('achievements.title')}
                        </Typography>
                        <Typography variant="h6" className={styles.subtitle}>
                            {t('achievements.subtitle')}
                        </Typography>
                    </div>
                    
                    <div className={styles.powerSection}>
                        <div className={styles.powerBadge}>
                            <TrendingUp className={styles.powerIcon} />
                            <div className={styles.powerInfo}>
                                <Typography variant="h3" className={styles.powerLevel}>
                                    {totalKills}
                                </Typography>
                                <Typography variant="body2" className={styles.powerLabel}>
                                    {t('achievements.totalKills')}
                                </Typography>
                            </div>
                        </div>
                        
                        <div className={styles.powerBadge}>
                            <EmojiEvents className={styles.powerIcon} />
                            <div className={styles.powerInfo}>
                                <Typography variant="h3" className={styles.powerLevel}>
                                    {unlocked}/{total}
                                </Typography>
                                <Typography variant="body2" className={styles.powerLabel}>
                                    {t('achievements.achievements')}
                                </Typography>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className={styles.mainContent}>
                {/* Character/Achievement Overview Section */}
                <div className={styles.characterSection}>
                    <div className={styles.characterCard}>
                        <div className={styles.characterHeader}>
                            <Person className={styles.characterIcon} />
                            <Typography variant="h5" className={styles.characterTitle}>
                                {t('achievements.progress')}
                            </Typography>
                        </div>
                        
                        <div className={styles.overallProgressSection}>
                            <div className={styles.progressInfo}>
                                <Typography variant="h6" className={styles.progressTitle}>
                                    {t('achievements.overallProgress')}
                                </Typography>
                                <Typography variant="h4" className={styles.progressValue}>
                                    {Math.round(totalProgress)}%
                                </Typography>
                            </div>
                            
                            <LinearProgress 
                                variant="determinate" 
                                value={totalProgress}
                                className={styles.overallProgressBar}
                            />
                            
                            <div className={styles.progressStats}>
                                <div className={styles.statItem}>
                                    <Typography variant="body2" className={styles.statLabel}>
                                        {t('achievements.unlocked')}
                                    </Typography>
                                    <Typography variant="h6" className={styles.statValue}>
                                        {unlocked}
                                    </Typography>
                                </div>
                                <div className={styles.statItem}>
                                    <Typography variant="body2" className={styles.statLabel}>
                                        {t('achievements.total')}
                                    </Typography>
                                    <Typography variant="h6" className={styles.statValue}>
                                        {total}
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Achievements List Section */}
                <div className={styles.achievementsSection}>
                    <div className={styles.achievementsHeader}>
                        <Typography variant="h5" className={styles.achievementsTitle}>
                            {t('achievements.enemyAchievements')}
                        </Typography>
                    </div>
                    
                    <div className={styles.achievementsGrid}>
                        {Object.keys(enemies).map(enemyKey => {
                            const enemyId = enemyKey.toLowerCase();
                            const enemy = enemies[enemyKey];
                            const data = achievementsData[enemyId];
                            
                            if (!data) return null;
                            
                            return (
                                <div key={enemyId} className={styles.achievementGridItem}>
                                    <EnemyWidget 
                                        enemyId={enemyId}
                                        enemy={enemy}
                                        data={data}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Achievement Detail Dialog */}
            <Dialog 
                open={achievementDialog.open} 
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                className={styles.achievementDialog}
            >
                <DialogTitle className={styles.dialogTitle}>
                    {achievementDialog.enemy?.name} - {t('achievements.achievements')}
                </DialogTitle>
                <DialogContent className={styles.dialogContent}>
                    <div className={styles.achievementsList}>
                        {achievementDialog.achievements.map((achievement, index) => (
                            <div key={index} className={styles.achievementItem}>
                                <div className={styles.achievementIcon}>
                                    {getAchievementIcon(achievement.reward)}
                                </div>
                                <div className={styles.achievementDetails}>
                                    <Typography variant="h6" className={styles.achievementName}>
                                        {achievement.name}
                                    </Typography>
                                    <Typography variant="body2" className={styles.achievementDescription}>
                                        {achievement.description}
                                    </Typography>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
                <DialogActions className={styles.dialogActions}>
                    <Button onClick={handleCloseDialog} className={styles.closeButton}>
                        {t('common.close')}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Achievement; 