import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Typography,
    Button,
    IconButton,
    Tooltip,
    Tabs,
    Tab,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import styles from "../assets/styles/Battle.module.scss";
import { LOCATIONS, DUNGEONS } from "../utils/enemies.js";
import enemies from "../utils/enemies.js";
import { getEnemyIcon } from "../utils/common.js";
import { 
    getDifficultyColor, 
    getDifficultyText, 
    getThresholdForStat, 
    getStatDisplay, 
    getEnemyHpDisplay 
} from "../utils/battleUtils.jsx";
import { isAchievementUnlocked } from "../utils/achievements.js";
import { useTranslate } from "../hooks/useTranslate";
import { useBattleContext } from "../contexts/BattleContext";

function BattleSelection() {
    const { t } = useTranslate();
    const navigate = useNavigate();
    const [battleTab, setBattleTab] = useState('locations');
    const [openLocations, setOpenLocations] = useState(() => LOCATIONS.map((_, i) => i === 0));
    const [openDungeons, setOpenDungeons] = useState(() => DUNGEONS.map((_, i) => i === 0));

    const {
        startBattle,
        setCurrentEnemy,
        setDungeonRun,
        setEnemiesData
    } = useBattleContext();

    // Helper function to call getStatDisplay with isAchievementUnlocked
    const getStatDisplayWithAchievement = (enemyId, statType, value) => {
        return getStatDisplay(enemyId, statType, value, isAchievementUnlocked);
    };

    // Helper function to call getEnemyHpDisplay with isAchievementUnlocked
    const getEnemyHpDisplayWithAchievement = (enemyId, current, max) => {
        return getEnemyHpDisplay(enemyId, current, max, isAchievementUnlocked);
    };

    // Set enemies data on mount
    useEffect(() => {
        setEnemiesData(enemies);
    }, [setEnemiesData]);

    const handleToggleLocation = (idx) => {
        setOpenLocations(prev => prev.map((open, i) => i === idx ? !open : open));
    };

    const handleToggleDungeon = (idx) => {
        setOpenDungeons(prev => prev.map((open, i) => i === idx ? !open : open));
    };

    const handleEnemySelect = (enemy) => {
        setCurrentEnemy(enemy);
        startBattle(enemy);
        navigate('/battle');
    };

    const startDungeonRun = (dungeon) => {
        // Generate dungeon stages like in original Battle.jsx
        const enemyPool = dungeon.enemies;
        const stages = [];
        for (let i = 0; i < 6; i++) {
            const rand = enemyPool[Math.floor(Math.random() * enemyPool.length)];
            stages.push(rand);
        }
        stages.push(dungeon.boss);
        
        setDungeonRun({ 
            dungeon, 
            stages, 
            currentStage: 0, 
            completed: false, 
            chestAwarded: false 
        });
        
        // Find and set first enemy
        const firstEnemy = Object.values(enemies).find(e => e.id === stages[0]);
        if (firstEnemy) {
            setCurrentEnemy(firstEnemy);
            startBattle(firstEnemy);
        }
        
        navigate('/battle');
    };

    return (
        <div className={styles.container}>
            <Typography variant="h4" className={styles.title}>
                {t('battle.selectBattle')}
            </Typography>
            
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
                        fontFamily: 'Press Start 2P',
                        fontWeight: 600,
                        fontSize: '0.8rem',
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
                                <Typography variant="h6" style={{ color: '#ffd700', marginBottom: 8, fontFamily: 'Press Start 2P', fontSize: '0.9rem' }}>{loc.name}</Typography>
                                <IconButton size="small" aria-label={openLocations[idx] ? t('common.collapse') : t('common.expand')} sx={{ color: '#ffd700' }}>
                                    {openLocations[idx] ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                            </div>
                            {openLocations[idx] && <>
                                <Typography variant="body2" style={{ color: '#bada55', marginBottom: 8, fontFamily: 'Press Start 2P', fontSize: '0.6rem' }}>{loc.description}</Typography>
                                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                    {Array.isArray(loc.enemies) && loc.enemies.map((enemyId) => {
                                        const enemy = Object.values(enemies).find(e => e.id === enemyId);
                                        if (!enemy) return null;
                                        return (
                                            <div key={enemy.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80, marginBottom: 8, background: 'rgba(0,0,0,0.12)', borderRadius: 6, padding: 8 }}>
                                                <img src={getEnemyIcon(enemy.id)} alt={enemy.name} style={{ width: 80, height: 80, marginBottom: 4 }} />
                                                <Typography variant="body2" style={{ color: '#fff', fontWeight: 500, fontFamily: 'Press Start 2P', fontSize: '0.6rem' }}>{enemy.name}</Typography>
                                                <Button size="small" variant="contained" color="primary" style={{ marginTop: 4, fontFamily: 'Press Start 2P', fontSize: '0.5rem' }} onClick={() => handleEnemySelect(enemy)}>
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

            {battleTab === 'dungeons' && (
                <div>
                    {Array.isArray(DUNGEONS) && DUNGEONS.map((dungeon, idx) => (
                        <div key={dungeon.id} style={{ marginBottom: 24, border: '2px solid #b45af2', borderRadius: 10, padding: 16, background: 'rgba(30,0,60,0.13)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => handleToggleDungeon(idx)}>
                                <Typography variant="h6" style={{ color: '#ffd700', marginBottom: 8, fontFamily: 'Press Start 2P', fontSize: '0.9rem' }}>{dungeon.name}</Typography>
                                <IconButton size="small" aria-label={openDungeons[idx] ? t('common.collapse') : t('common.expand')} sx={{ color: '#ffd700' }}>
                                    {openDungeons[idx] ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                            </div>
                            {openDungeons[idx] && <>
                                <Typography variant="body2" style={{ color: '#fff', marginBottom: 6, fontFamily: 'Press Start 2P', fontSize: '0.6rem' }}>{dungeon.description}</Typography>
                                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
                                    {dungeon.enemies.map((enemyId) => {
                                        const enemy = Object.values(enemies).find(e => e.id === enemyId);
                                        if (!enemy) return null;
                                        return (
                                            <div key={enemy.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80, background: 'rgba(0,0,0,0.12)', borderRadius: 6, padding: 8 }}>
                                                <img src={getEnemyIcon(enemy.id)} alt={enemy.name} style={{ width: 80, height: 80, marginBottom: 2 }} />
                                                <Typography variant="body2" style={{ color: '#fff', fontWeight: 500, fontFamily: 'Press Start 2P', fontSize: '0.6rem' }}>{enemy.name}</Typography>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                    <Typography variant="subtitle2" style={{ color: '#ffd700', fontFamily: 'Press Start 2P', fontSize: '0.7rem' }}>{t('battle.boss')}</Typography>
                                    {(() => {
                                        const boss = Object.values(enemies).find(e => e.id === dungeon.boss);
                                        if (!boss) return null;
                                        return (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                                                <img src={getEnemyIcon(boss.id)} alt={boss.name} style={{ width: 48, height: 48 }} />
                                                <Typography variant="body1" style={{ color: '#ff5252', fontWeight: 600, fontFamily: 'Press Start 2P', fontSize: '0.7rem' }}>{boss.name}</Typography>
                                            </div>
                                        );
                                    })()}
                                </div>
                                <div style={{ marginTop: 8, background: 'rgba(0,0,0,0.18)', borderRadius: 6, padding: 8 }}>
                                    <Typography variant="subtitle2" style={{ color: '#ffd700', marginBottom: 4, fontFamily: 'Press Start 2P', fontSize: '0.7rem' }}>
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
                                <Button size="medium" variant="contained" color="secondary" style={{ marginTop: 12, fontFamily: 'Press Start 2P', fontSize: '0.6rem' }} onClick={() => startDungeonRun(dungeon)}>
                                    {t('battle.enterDungeon')}
                                </Button>
                            </>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default BattleSelection; 