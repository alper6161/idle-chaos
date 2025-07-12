import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider
} from "@mui/material";
import { Close, Warning, Refresh, Language } from "@mui/icons-material";
import { useTranslate } from "../hooks/useTranslate";

function Settings({ open, onClose }) {
    const navigate = useNavigate();
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const { t, changeLanguage, getCurrentLanguage, getAvailableLanguages } = useTranslate();

    const handleHardReset = () => {
        // Clear all localStorage data
        localStorage.clear();
        
        // Close the settings dialog
        onClose();
        
        // Navigate to home page
        navigate("/");
    };

    const handleResetClick = () => {
        setShowResetConfirm(true);
    };

    const handleResetCancel = () => {
        setShowResetConfirm(false);
    };

    const handleResetConfirm = () => {
        setShowResetConfirm(false);
        handleHardReset();
    };

    return (
        <>
            {/* Main Settings Dialog */}
            <Dialog 
                open={open} 
                onClose={onClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: '#2a2a4a',
                        border: '2px solid #4a4a6a',
                        borderRadius: 0,
                        boxShadow: '0 0 0 1px #000, 0 4px 0 0 #2a2a4a'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    color: '#e0e0e0',
                    fontFamily: 'Press Start 2P, monospace',
                    fontSize: '1rem',
                    textShadow: '2px 2px 0px #000',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    {t('common.settings')}
                    <IconButton 
                        onClick={onClose}
                        sx={{ 
                            color: '#e0e0e0',
                            '&:hover': { color: '#ff6b6b' }
                        }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                
                <DialogContent sx={{ 
                    color: '#e0e0e0',
                    fontFamily: 'Press Start 2P, monospace',
                    fontSize: '0.8rem',
                    textShadow: '1px 1px 0px #000'
                }}>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ 
                            color: '#96ceb4',
                            fontSize: '0.9rem',
                            textShadow: '1px 1px 0px #000'
                        }}>
                            {t('common.language')}
                        </Typography>
                        
                        <List sx={{ mt: 2, p: 0 }}>
                            {getAvailableLanguages().map((lang) => (
                                <ListItem 
                                    key={lang.code}
                                    button
                                    onClick={() => changeLanguage(lang.code)}
                                    sx={{
                                        backgroundColor: getCurrentLanguage() === lang.code ? 'rgba(150, 206, 180, 0.2)' : 'transparent',
                                        border: getCurrentLanguage() === lang.code ? '2px solid #96ceb4' : '2px solid transparent',
                                        borderRadius: 1,
                                        mb: 1,
                                        '&:hover': {
                                            backgroundColor: 'rgba(150, 206, 180, 0.1)',
                                            borderColor: '#96ceb4'
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <img 
                                            src={lang.flag} 
                                            alt={lang.name}
                                            style={{ 
                                                width: '24px', 
                                                height: '16px',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={lang.name}
                                        sx={{
                                            '& .MuiListItemText-primary': {
                                                fontFamily: 'Press Start 2P, monospace',
                                                fontSize: '0.7rem',
                                                color: '#e0e0e0',
                                                textShadow: '1px 1px 0px #000'
                                            }
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                        
                        <Divider sx={{ my: 3, borderColor: '#4a4a6a' }} />
                        
                        <Typography variant="h6" gutterBottom sx={{ 
                            color: '#ff6b6b',
                            fontSize: '0.9rem',
                            textShadow: '1px 1px 0px #000'
                        }}>
                            GAME OPTIONS
                        </Typography>
                        
                        <Box sx={{ mt: 3 }}>
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<Refresh />}
                                onClick={handleResetClick}
                                sx={{
                                    backgroundColor: '#ff6b6b',
                                    border: '2px solid #ff4444',
                                    borderRadius: 0,
                                    fontFamily: 'Press Start 2P, monospace',
                                    fontSize: '0.7rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    textShadow: '1px 1px 0px #000',
                                    boxShadow: '0 0 0 1px #000, 0 2px 0 0 #ff4444',
                                    '&:hover': {
                                        backgroundColor: '#ff4444',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 0 0 1px #000, 0 4px 0 0 #ff4444'
                                    }
                                }}
                            >
                                {t('common.clearData')}
                            </Button>
                            
                            <Typography variant="body2" sx={{ 
                                mt: 1,
                                color: '#888',
                                fontSize: '0.6rem'
                            }}>
                                This will clear all saved data and return to the main menu.
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                
                <DialogActions sx={{ 
                    padding: '1rem',
                    borderTop: '2px solid #4a4a6a'
                }}>
                    <Button 
                        onClick={onClose}
                        sx={{
                            color: '#e0e0e0',
                            fontFamily: 'Press Start 2P, monospace',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            textShadow: '1px 1px 0px #000',
                            '&:hover': {
                                color: '#96ceb4'
                            }
                        }}
                    >
                        {t('common.cancel')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reset Confirmation Dialog */}
            <Dialog 
                open={showResetConfirm} 
                onClose={handleResetCancel}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: '#2a2a4a',
                        border: '2px solid #ff6b6b',
                        borderRadius: 0,
                        boxShadow: '0 0 0 1px #000, 0 4px 0 0 #ff6b6b'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    color: '#ff6b6b',
                    fontFamily: 'Press Start 2P, monospace',
                    fontSize: '1rem',
                    textShadow: '2px 2px 0px #000',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <Warning sx={{ color: '#ff6b6b' }} />
                    {t('common.clearData')}
                </DialogTitle>
                
                <DialogContent sx={{ 
                    color: '#e0e0e0',
                    fontFamily: 'Press Start 2P, monospace',
                    fontSize: '0.8rem',
                    textShadow: '1px 1px 0px #000'
                }}>
                    <Alert severity="warning" sx={{ 
                        mt: 2,
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        border: '1px solid #ff6b6b',
                        '& .MuiAlert-message': {
                            fontFamily: 'Press Start 2P, monospace',
                            fontSize: '0.7rem',
                            textShadow: '1px 1px 0px #000'
                        }
                    }}>
                        {t('common.clearDataConfirm')}
                    </Alert>
                </DialogContent>
                
                <DialogActions sx={{ 
                    padding: '1rem',
                    borderTop: '2px solid #ff6b6b'
                }}>
                    <Button 
                        onClick={handleResetCancel}
                        sx={{
                            color: '#e0e0e0',
                            fontFamily: 'Press Start 2P, monospace',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            textShadow: '1px 1px 0px #000',
                            '&:hover': {
                                color: '#96ceb4'
                            }
                        }}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button 
                        onClick={handleResetConfirm}
                        variant="contained"
                        color="error"
                        sx={{
                            backgroundColor: '#ff6b6b',
                            border: '2px solid #ff4444',
                            borderRadius: 0,
                            fontFamily: 'Press Start 2P, monospace',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            textShadow: '1px 1px 0px #000',
                            boxShadow: '0 0 0 1px #000, 0 2px 0 0 #ff4444',
                            '&:hover': {
                                backgroundColor: '#ff4444',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 0 0 1px #000, 0 4px 0 0 #ff4444'
                            }
                        }}
                    >
                        {t('common.confirm')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Settings; 