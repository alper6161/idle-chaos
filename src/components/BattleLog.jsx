import React from 'react';
import { Typography, Box, IconButton, Tooltip } from '@mui/material';
import { useTranslate } from '../hooks/useTranslate';
import styles from '../assets/styles/Battle.module.scss';

const BattleLog = ({
    battleLogVisible,
    battleLog,
    onClearBattleLog
}) => {
    const { t } = useTranslate();

    if (!battleLogVisible) return null;

    return (
        <div className={styles.fighter}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">{t('battle.battleLog')}</Typography>
                <Tooltip title={t('battle.clearBattleLog')} arrow>
                    <IconButton
                        onClick={onClearBattleLog}
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
                        <div style={{ fontSize: '1rem' }}>🗑️</div>
                    </IconButton>
                </Tooltip>
            </Box>
            <div className={styles.battleLog}>
                {battleLog.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#ffffff', fontFamily: 'Press Start 2P', fontSize: '0.7rem' }}>{t('battle.noBattleLog')}</Typography>
                ) : (
                    battleLog.map((entry, idx) => (
                        <div key={idx} className={styles[`${entry.type}Log`] || styles.battleLogEntry}>
                            {entry.message}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BattleLog; 