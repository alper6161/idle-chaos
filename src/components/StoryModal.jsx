import React from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Button,
    Avatar
} from '@mui/material';
import { useTranslate } from '../hooks/useTranslate';

const StoryModal = ({ open, onClose, characterImage }) => {
    const { t } = useTranslate();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    background: 'linear-gradient(145deg, #3a3a5a 0%, #2a2a4a 100%)',
                    border: '3px solid #4a4a6a',
                    borderRadius: 0,
                    boxShadow: '0 0 0 2px #000, 0 4px 0 0 #3a3a5a, 0 8px 0 0 #2a2a4a',
                    fontFamily: '"Press Start 2P", monospace'
                }
            }}
        >
            <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                    {/* Character Image */}
                    <Box sx={{ flexShrink: 0 }}>
                        <Avatar
                            src={characterImage}
                            sx={{
                                width: 120,
                                height: 120,
                                border: '3px solid #4a4a6a',
                                borderRadius: 0,
                                boxShadow: '0 0 0 2px #000, 0 4px 0 0 #3a3a5a',
                                imageRendering: 'pixelated',
                                imageRendering: '-moz-crisp-edges',
                                imageRendering: 'crisp-edges'
                            }}
                        />
                    </Box>

                    {/* Story Text */}
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="body1"
                            sx={{
                                color: '#e0e0e0',
                                textShadow: '2px 2px 0px #000',
                                fontSize: '0.8rem',
                                lineHeight: 1.6,
                                fontFamily: '"Press Start 2P", monospace',
                                whiteSpace: 'pre-line'
                            }}
                        >
                            {t('story.welcome')}

                            {t('story.intro')}

                            {t('story.instructions')}

                            {t('story.ready')}
                        </Typography>
                    </Box>
                </Box>

                {/* Close Button */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Button
                        onClick={onClose}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(145deg, #4a4a6a 0%, #3a3a5a 100%)',
                            border: '3px solid #6a6a8a',
                            borderRadius: 0,
                            color: '#e0e0e0',
                            fontFamily: '"Press Start 2P", monospace',
                            fontSize: '0.7rem',
                            textShadow: '1px 1px 0px #000',
                            padding: '0.8rem 2rem',
                            boxShadow: '0 0 0 2px #000, 0 4px 0 0 #4a4a6a',
                            '&:hover': {
                                background: 'linear-gradient(145deg, #5a5a7a 0%, #4a4a6a 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 0 0 2px #000, 0 6px 0 0 #4a4a6a'
                            }
                        }}
                    >
                        {t('story.understood')}
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default StoryModal; 