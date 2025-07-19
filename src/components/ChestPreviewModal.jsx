import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Grid, Card, CardContent, Tooltip, Box } from '@mui/material';
import { useTranslate } from '../hooks/useTranslate';
import styles from '../assets/styles/Battle.module.scss';

const ChestPreviewModal = ({
    chestPreviewModal,
    onClose,
    onOpenChest
}) => {
    const { t } = useTranslate();

    if (!chestPreviewModal.open) return null;

    return (
        <Dialog 
            open={chestPreviewModal.open} 
            onClose={onClose}
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
                    onClick={onClose}
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
                    onClick={onOpenChest}
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
    );
};

export default ChestPreviewModal; 