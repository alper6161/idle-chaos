import React, { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress, IconButton, Collapse, Button } from '@mui/material';
import { Close, ExpandMore, ExpandLess } from '@mui/icons-material';
import { useBattleContext } from '../contexts/BattleContext';
import { useTranslate } from '../hooks/useTranslate';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../assets/styles/MiniBattleWindow.module.scss';

const MiniBattleWindow = () => {
    const { t } = useTranslate();
    const location = useLocation();
    const navigate = useNavigate();
    const { 
        isBattleActive, 
        currentBattle, 
        currentEnemy, 
        playerHealth,
        isWaitingForEnemy,
        enemySpawnProgress,
        stopBattle,
        setIsBattleActive 
    } = useBattleContext();
    
    const [isExpanded, setIsExpanded] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    
    // Settings'den mini battle window ayarlarını al
    const getMiniBattleSettings = () => {
        try {
            const settings = localStorage.getItem('idle-chaos-settings');
            if (settings) {
                const parsed = JSON.parse(settings);
                return {
                    enabled: parsed.miniBattleWindow?.enabled ?? true,
                    position: parsed.miniBattleWindow?.position ?? 'bottom-right',
                    autoHide: parsed.miniBattleWindow?.autoHide ?? false,
                    autoHideDelay: parsed.miniBattleWindow?.autoHideDelay ?? 5000
                };
            }
        } catch (error) {
            console.error('Error loading mini battle window settings:', error);
        }
        return {
            enabled: true,
            position: 'bottom-right',
            autoHide: false,
            autoHideDelay: 5000
        };
    };
    
    const settings = getMiniBattleSettings();
    
    // Auto hide ayarı için timer (artık sadece expanded state için kullanılıyor)
    useEffect(() => {
        if (settings.autoHide && isExpanded) {
            const timer = setTimeout(() => {
                setIsExpanded(false);
            }, settings.autoHideDelay);
            
            return () => clearTimeout(timer);
        }
    }, [isExpanded, settings.autoHide, settings.autoHideDelay]);
    
    // Mouse hover olduğunda auto hide'ı iptal et
    const handleMouseEnter = () => {
        // Auto hide timer'ı iptal et (useEffect'te zaten yapılıyor)
    };
    
    const handleMouseLeave = () => {
        // Auto hide timer'ı başlat (useEffect'te zaten yapılıyor)
    };
    
    const handleClose = () => {
        setIsExpanded(false);
    };
    
    const handleStopBattle = () => {
        stopBattle();
        setIsExpanded(false);
    };
    
    const handleGoToBattle = () => {
        navigate('/battle');
    };
    
    // Battle sayfasında mini window'u gösterme
    if (location.pathname === '/battle') {
        return null;
    }
    
    if ((!isBattleActive && !isWaitingForEnemy) || (!currentBattle && !currentEnemy)) {
        return null;
    }
    
    // Health percent hesaplamalarını güvenli hale getir
    const playerHealthPercent = currentBattle ? (currentBattle.player.currentHealth / currentBattle.player.maxHealth) * 100 : 0;
    const enemyHealthPercent = currentBattle ? (currentBattle.enemy.currentHealth / currentBattle.enemy.maxHealth) * 100 : 0;
    
    return (
        <Box 
            className={`${styles.miniBattleWindow} ${styles[settings.position]}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Header */}
            <Box className={styles.header}>
                <Typography variant="subtitle2" className={styles.title}>
                    {isWaitingForEnemy ? (
                        <>
                            🔍 Searching...
                            <span className={styles.spawnProgress}>
                                {Math.round(enemySpawnProgress)}%
                            </span>
                        </>
                    ) : (
                        <>⚔️ {currentEnemy.name}</>
                    )}
                </Typography>
                <Box className={styles.headerActions}>
                    <IconButton 
                        size="small" 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={styles.expandButton}
                    >
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                    <IconButton 
                        size="small" 
                        onClick={handleClose}
                        className={styles.closeButton}
                    >
                        <Close />
                    </IconButton>
                </Box>
            </Box>
            
            {/* Collapsed Content */}
            <Collapse in={!isExpanded}>
                <Box className={styles.collapsedContent}>
                    {/* Health Bars - Sadece battle aktifken göster */}
                    {isBattleActive && currentBattle && (
                        <Box className={styles.healthBars}>
                            <Box className={styles.healthBar}>
                                <Typography variant="caption" className={styles.healthLabel}>
                                    ❤️ {Math.round(currentBattle.player.currentHealth)}/{currentBattle.player.maxHealth}
                                </Typography>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={playerHealthPercent}
                                    className={`${styles.progress} ${styles.playerHealth}`}
                                />
                            </Box>
                            <Box className={styles.healthBar}>
                                <Typography variant="caption" className={styles.healthLabel}>
                                    💀 {Math.round(currentBattle.enemy.currentHealth)}/{currentBattle.enemy.maxHealth}
                                </Typography>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={enemyHealthPercent}
                                    className={`${styles.progress} ${styles.enemyHealth}`}
                                />
                            </Box>
                        </Box>
                    )}
                    
                    {/* Enemy Respawn Timer */}
                    {isWaitingForEnemy && (
                        <Box className={styles.respawnTimer}>
                            <Typography variant="caption" className={styles.respawnLabel}>
                                🔍 Searching for enemy...
                            </Typography>
                            <LinearProgress 
                                variant="determinate" 
                                value={enemySpawnProgress}
                                className={`${styles.progress} ${styles.respawnProgress}`}
                            />
                            <Typography variant="caption" className={styles.respawnPercent}>
                                {Math.round(enemySpawnProgress)}%
                            </Typography>
                        </Box>
                    )}
                    
                    {/* Go to Battle Button */}
                    <Box className={styles.actions}>
                        <Button 
                            variant="contained" 
                            size="small" 
                            onClick={handleGoToBattle}
                            className={styles.goToBattleButton}
                            fullWidth
                        >
                            ⚔️ Go to Battle
                        </Button>
                    </Box>
                </Box>
            </Collapse>
            
            {/* Expanded Content */}
            <Collapse in={isExpanded}>
                <Box className={styles.expandedContent}>
                    {/* Detailed Stats - Sadece battle aktifken göster */}
                    {isBattleActive && currentBattle && (
                        <Box className={styles.stats}>
                            <Typography variant="caption">
                                ⚔️ ATK: {currentBattle.player.ATK.toFixed(1)} vs {currentBattle.enemy.ATK.toFixed(1)}
                            </Typography>
                            <Typography variant="caption">
                                🛡️ DEF: {currentBattle.player.DEF.toFixed(1)} vs {currentBattle.enemy.DEF.toFixed(1)}
                            </Typography>
                        </Box>
                    )}
                    
                    {/* Battle Progress - Sadece battle aktifken göster */}
                    {isBattleActive && currentBattle && (
                        <Box className={styles.progressBars}>
                            <Box className={styles.progressBar}>
                                <Typography variant="caption">Player</Typography>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={(currentBattle.playerProgress / 100) * 100}
                                    className={styles.progress}
                                />
                            </Box>
                            <Box className={styles.progressBar}>
                                <Typography variant="caption">Enemy</Typography>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={(currentBattle.enemyProgress / 100) * 100}
                                    className={styles.progress}
                                />
                            </Box>
                        </Box>
                    )}
                    
                    {/* Enemy Respawn Timer (Expanded) */}
                    {isWaitingForEnemy && (
                        <Box className={styles.respawnTimerExpanded}>
                            <Typography variant="caption" className={styles.respawnLabel}>
                                🔍 Searching for enemy...
                            </Typography>
                            <Box className={styles.respawnProgressContainer}>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={enemySpawnProgress}
                                    className={`${styles.progress} ${styles.respawnProgress}`}
                                    sx={{ flex: 1 }}
                                />
                                <Typography variant="caption" className={styles.respawnPercent}>
                                    {Math.round(enemySpawnProgress)}%
                                </Typography>
                            </Box>
                            <Typography variant="caption" className={styles.respawnTime}>
                                {Math.ceil((100 - enemySpawnProgress) / 20)}s remaining
                            </Typography>
                        </Box>
                    )}
                    
                    {/* Actions */}
                    <Box className={styles.actions}>
                        <Button 
                            variant="contained" 
                            size="small" 
                            onClick={handleGoToBattle}
                            className={styles.goToBattleButton}
                            fullWidth
                            sx={{ mb: 1 }}
                        >
                            ⚔️ Go to Battle
                        </Button>
                        <button 
                            onClick={handleStopBattle}
                            className={styles.stopButton}
                        >
                            ⏹️ Stop Battle
                        </button>
                    </Box>
                </Box>
            </Collapse>
        </Box>
    );
};

export default MiniBattleWindow; 