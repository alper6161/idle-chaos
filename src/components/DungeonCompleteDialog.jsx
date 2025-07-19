import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Button, Box } from '@mui/material';
import { useTranslate } from '../hooks/useTranslate';
import styles from '../assets/styles/Battle.module.scss';

const DungeonCompleteDialog = ({
    dungeonCompleteDialog,
    onClose,
    onLeave,
    onRestart,
    dungeonRun,
    enemies
}) => {
    const { t } = useTranslate();

    if (!dungeonCompleteDialog.open) return null;

    return (
        <Dialog 
            open={dungeonCompleteDialog.open} 
            onClose={onClose} 
            className={styles.dungeonCompleteDialog} 
            sx={{ top: 0, position: 'absolute' }}
        >
            <DialogTitle>{t('battle.dungeonComplete')}</DialogTitle>
            <DialogContent>
                <Typography>{t('battle.dungeonCompleteDescription')}</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
                    <Button 
                        variant="outlined" 
                        color="secondary" 
                        onClick={onLeave}
                    >
                        {t('battle.leave')}
                    </Button>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={onRestart}
                    >
                        {t('battle.restart')} ({dungeonCompleteDialog.countdown})
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default DungeonCompleteDialog; 