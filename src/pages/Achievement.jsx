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
    StarBorder
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

    const EnemyWidget = ({ enemyId, enemy, data }) => {
        const progress = getAchievementProgress(enemyId);
        const nextAchievement = data.nextAchievement;
        const unlockedCount = data.unlockedAchievements.length;
        const totalAchievements = data.thresholds.length;

        return (
            <Card className={styles.enemyWidget} onClick={() => handleEnemyClick(enemyId)}>
                <CardContent className={styles.enemyWidgetContent}>
                    <div className={styles.enemyHeader}>
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
                        
                        <div className={styles.enemyInfo}>
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

                    <div className={styles.enemyStats}>
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

    return (
        <div className={styles.achievementContainer}>
            <div className={styles.header}>
                <Typography variant="h4" className={styles.title}>
                    🏆 {t('achievements.title')}
                </Typography>
                <Typography variant="h6" className={styles.subtitle}>
                    {t('achievements.subtitle')}
                </Typography>
                
                <Box className={styles.totalStats}>
                    <Paper className={styles.totalKillsCard}>
                                            <Typography variant="h5" className={styles.totalKillsTitle}>
                        {t('achievements.totalKills')}
                    </Typography>
                        <Typography variant="h3" className={styles.totalKillsValue}>
                            {totalKills}
                        </Typography>
                    </Paper>
                </Box>
            </div>

            <div className={styles.enemyGrid}>
                {Object.keys(enemies).map(enemyKey => {
                    const enemyId = enemyKey.toLowerCase();
                    const enemy = enemies[enemyKey];
                    const data = achievementsData[enemyId];
                    
                    if (!data) return null;
                    
                    return (
                        <div key={enemyId} className={styles.enemyGridItem}>
                            <EnemyWidget 
                                enemyId={enemyId}
                                enemy={enemy}
                                data={data}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Achievement Details Dialog */}
            <Dialog 
                open={achievementDialog.open} 
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle className={styles.dialogTitle}>
                    <div className={styles.dialogHeader}>
                        <Avatar 
                            src={getEnemyIcon(achievementDialog.enemy?.id)} 
                            className={styles.dialogAvatar}
                        />
                        <Typography variant="h6">
                            {achievementDialog.enemy?.name} {t('achievements.achievements')}
                        </Typography>
                    </div>
                </DialogTitle>
                
                <DialogContent className={styles.dialogContent}>
                    {achievementDialog.achievements.length > 0 ? (
                        <div className={styles.achievementsList}>
                            {achievementDialog.achievements.map((achievement, index) => (
                                <Paper key={index} className={styles.achievementItem}>
                                    <div className={styles.achievementHeader}>
                                        <span className={styles.achievementIcon}>
                                            {getAchievementIcon(achievement.reward)}
                                        </span>
                                        <Typography variant="h6" className={styles.achievementTitle}>
                                            {achievement.description}
                                        </Typography>
                                        <Chip 
                                            label={`${achievement.killThreshold} kills`}
                                            size="small"
                                            color="primary"
                                        />
                                    </div>
                                    <Typography variant="body2" className={styles.achievementDescription}>
                                        Unlocked at {new Date(achievement.unlockedAt).toLocaleDateString()}
                                    </Typography>
                                </Paper>
                            ))}
                        </div>
                    ) : (
                        <Typography variant="body1" className={styles.noAchievements}>
                            {t('achievements.noAchievements')}
                        </Typography>
                    )}
                </DialogContent>
                
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        {t('common.close')}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Achievement; 