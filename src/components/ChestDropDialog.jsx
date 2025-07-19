import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Box } from '@mui/material';
import styles from '../assets/styles/Battle.module.scss';

const ChestDropDialog = ({
    chestDropDialog,
    onClose
}) => {
    if (!chestDropDialog.open) return null;

    return (
        <Dialog 
            open={chestDropDialog.open} 
            onClose={onClose}
            maxWidth="sm"
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
                🎁 Chest Opened! 🎁
            </DialogTitle>
            <DialogContent sx={{ textAlign: 'center', py: 3 }}>
                {chestDropDialog.item && (
                    <Box sx={{ 
                        p: 3, 
                        border: `2px solid ${chestDropDialog.item.rarity === 'legendary' ? '#ffd700' : 
                            chestDropDialog.item.rarity === 'epic' ? '#a855f7' :
                            chestDropDialog.item.rarity === 'rare' ? '#3b82f6' : '#6b7280'}`,
                        background: `rgba(${chestDropDialog.item.rarity === 'legendary' ? '255, 215, 0' : 
                            chestDropDialog.item.rarity === 'epic' ? '168, 85, 247' :
                            chestDropDialog.item.rarity === 'rare' ? '59, 130, 246' : '107, 114, 128'}, 0.1)`,
                        borderRadius: 0
                    }}>
                        <Typography variant="h5" sx={{ 
                            mb: 2, 
                            color: chestDropDialog.item.rarity === 'legendary' ? '#ffd700' : 
                                chestDropDialog.item.rarity === 'epic' ? '#a855f7' :
                                chestDropDialog.item.rarity === 'rare' ? '#3b82f6' : '#ffffff',
                            fontFamily: 'Press Start 2P',
                            fontSize: '1.2rem'
                        }}>
                            {chestDropDialog.item.name}
                        </Typography>
                        <Typography variant="body1" sx={{ 
                            mb: 2, 
                            color: '#e0e0e0',
                            fontFamily: 'Press Start 2P',
                            fontSize: '0.8rem'
                        }}>
                            Level {chestDropDialog.item.level} • {chestDropDialog.item.rarity.charAt(0).toUpperCase() + chestDropDialog.item.rarity.slice(1)}
                        </Typography>
                        {chestDropDialog.item.stats && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" sx={{ mb: 1, color: '#4ade80', fontFamily: 'Press Start 2P', fontSize: '0.7rem' }}>
                                    Stats:
                                </Typography>
                                {Object.entries(chestDropDialog.item.stats).map(([stat, value]) => (
                                    <Typography key={stat} variant="body2" sx={{ color: '#ffffff', fontFamily: 'Press Start 2P', fontSize: '0.6rem' }}>
                                        {stat}: +{value}
                                    </Typography>
                                ))}
                            </Box>
                        )}
                        <Typography variant="body2" sx={{ 
                            mt: 2, 
                            color: '#4ade80',
                            fontFamily: 'Press Start 2P',
                            fontSize: '0.7rem',
                            fontStyle: 'italic'
                        }}>
                            Added to inventory!
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button 
                    onClick={onClose}
                    sx={{
                        fontFamily: 'Press Start 2P',
                        fontSize: '0.7rem',
                        px: 3,
                        py: 1,
                        background: 'linear-gradient(145deg, #4ade80 0%, #22c55e 100%)',
                        color: '#000000',
                        border: '2px solid #000000',
                        borderRadius: 0,
                        '&:hover': {
                            background: 'linear-gradient(145deg, #22c55e 0%, #16a34a 100%)',
                        }
                    }}
                >
                    Awesome!
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ChestDropDialog; 