import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Typography, 
    Button, 
    Card, 
    CardContent, 
    Grid, 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Tooltip
} from "@mui/material";
import { Delete, Edit, PlayArrow, VolumeUp, VolumeOff, ExitToApp } from "@mui/icons-material";
import styles from "../assets/styles/Home.module.scss";
import { useTranslate } from "../hooks/useTranslate";
import StoryModal from "../components/StoryModal.jsx";
import { 
    getSaveSlots, 
    loadFromSlot, 
    deleteSlot, 
    renameSlot, 
    hasSlotData,
    getSlotInfo,
    getCurrentSlot
} from "../utils/saveManager.js";
import { INITIAL_SKILLS } from "../utils/constants";
import { SYSTEM_COLORS } from "../utils/common";

const GAME_STATE_KEYS = [
    'playerHealth', 'playerGold', 'playerLevel', 'playerXP',
    'inventory', 'equippedItems', 'lootBag', 'potions',
    'autoPotionSettings', 'skillLevels', 'skillXP',
    'achievements', 'unlockedEnemies', 'gameData'
];

// Helper function to sum all skill levels
const getTotalSkillLevel = (skillLevels) => {
    if (!skillLevels) return 0;
    let total = 0;
    console.log(skillLevels);
    Object.values(skillLevels).forEach(category => {
        if (typeof category === 'object' && category !== null) {
            Object.values(category).forEach(skill => {
                if (typeof skill === 'object' && skill !== null && typeof skill.level === 'number') {
                    total += skill.level;
                } else if (typeof skill === 'number') {
                    total += skill;
                }
            });
        }
    });
    console.log(total);
    return total;
};

function handleExitGame() {
    if (window && window.process && window.process.type) {
        window.close();
    } else {
        alert("Exit function only works in app mode.");
    }
}

function Home() {
    const navigate = useNavigate();
    const [saveSlots, setSaveSlots] = useState({});
    const [showStoryModal, setShowStoryModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [renameDialog, setRenameDialog] = useState({ open: false, slot: null, name: '' });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, slot: null });
    const { t } = useTranslate();
    const [musicMuted, setMusicMuted] = useState(() => {
        const saved = localStorage.getItem('musicMuted');
        return saved === 'true';
    });

    useEffect(() => {
        loadSaveSlots();
    }, []);

    useEffect(() => {
        const handler = () => {
            const saved = localStorage.getItem('musicMuted');
            setMusicMuted(saved === 'true');
        };
        window.addEventListener('music-settings-changed', handler);
        return () => window.removeEventListener('music-settings-changed', handler);
    }, []);

    const handleMuteToggle = () => {
        const newMuted = !musicMuted;
        setMusicMuted(newMuted);
        localStorage.setItem('musicMuted', newMuted);
        window.dispatchEvent(new Event('music-settings-changed'));
    };

    const loadSaveSlots = () => {
        const slots = getSaveSlots();
        setSaveSlots(slots);
    };

    const handleNewGame = (slotNumber) => {
        // Delete the relevant slot
        deleteSlot(slotNumber);
        
        // Clear all global game state keys
        GAME_STATE_KEYS.forEach(key => localStorage.removeItem(key));
        
        // Clear all slot-specific keys for this slot
        const slotSpecificKeys = [
            `idle-chaos-potions_slot_${slotNumber}`,
            `idle-chaos-auto-potion_slot_${slotNumber}`,
            `activeBuffs_slot_${slotNumber}`,
            `lootBag_slot_${slotNumber}`,
            `idle-chaos-equipped-items_slot_${slotNumber}`,
            `idle-chaos-inventory_slot_${slotNumber}`,
            `idle-chaos-pets_slot_${slotNumber}`,
            `gameData_slot_${slotNumber}`,
            `skillData_slot_${slotNumber}`,
            `playerHealth_slot_${slotNumber}`,
            `playerGold_slot_${slotNumber}`,
            `selectedCharacter_slot_${slotNumber}`,
            `idle-chaos-achievements-slot-${slotNumber}`
        ];
        
        slotSpecificKeys.forEach(key => localStorage.removeItem(key));
        
        // Initialize skill data for this slot
        const skillDataKey = `skillData_slot_${slotNumber}`;
        localStorage.setItem(skillDataKey, JSON.stringify(INITIAL_SKILLS));
        
        // Set current slot
        localStorage.setItem('idle-chaos-current-slot', slotNumber.toString());
        setSelectedSlot(slotNumber);
        setShowStoryModal(true);
    };

    const handleStoryClose = () => {
        setShowStoryModal(false);
        navigate("/battle");
    };

    const handleContinue = (slotNumber) => {
        const success = loadFromSlot(slotNumber);
        if (success) {
            navigate("/battle");
        } else {
            alert(t('common.loadError'));
        }
    };

    const handleRename = (slotNumber) => {
        const slot = getSlotInfo(slotNumber);
        setRenameDialog({ open: true, slot: slotNumber, name: slot.name });
    };

    const handleRenameConfirm = () => {
        const { slot, name } = renameDialog;
        if (name.trim()) {
            renameSlot(slot, name.trim());
            loadSaveSlots();
        }
        setRenameDialog({ open: false, slot: null, name: '' });
    };

    const handleDelete = (slotNumber) => {
        setDeleteDialog({ open: true, slot: slotNumber });
    };

    const handleDeleteConfirm = () => {
        const { slot } = deleteDialog;
        deleteSlot(slot);
        loadSaveSlots();
        setDeleteDialog({ open: false, slot: null });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderSaveSlot = (slotNumber) => {
        const slot = saveSlots[slotNumber] || {};
        const hasData = hasSlotData(slotNumber);
        const isCurrentSlot = getCurrentSlot() === slotNumber;
        const skillData = slot?.data?.[`skillData_slot_${slotNumber}`];
        const totalSkillLevel = skillData ? getTotalSkillLevel(skillData) : null;

        return (
            <Card 
                key={slotNumber}
                className={`${styles.saveSlot} ${isCurrentSlot ? styles.currentSlot : ''}`}
                sx={{
                    backgroundColor: hasData ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    border: isCurrentSlot ? '2px solid #4caf50' : '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        backgroundColor: hasData ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateY(-2px)'
                    }
                }}
            >
                <CardContent>
                    <div className={styles.slotHeader}>
                        <Typography variant="h6" className={styles.slotName} sx={!slot?.name ? { color: '#fff' } : {}}>
                            {slot?.name || `Save ${slotNumber}`}
                            {isCurrentSlot && <span className={styles.currentIndicator}> (Active)</span>}
                        </Typography>
                        <div className={styles.slotActions}>
                            {hasData && (
                                <>
                                    <Tooltip title="Continue Game">
                                        <IconButton 
                                            onClick={() => handleContinue(slotNumber)}
                                            size="small"
                                            sx={{ color: '#4caf50' }}
                                        >
                                            <PlayArrow />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Rename Slot">
                                        <IconButton 
                                            onClick={() => handleRename(slotNumber)}
                                            size="small"
                                            sx={{ color: '#ff9800' }}
                                        >
                                            <Edit />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Slot">
                                        <IconButton 
                                            onClick={() => handleDelete(slotNumber)}
                                            size="small"
                                            sx={{ color: '#f44336' }}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )}
                        </div>
                    </div>

                    {hasData ? (
                        <div className={styles.slotInfo}>
                            <Typography variant="body2" color="textSecondary">
                                Last Played: {formatDate(slot?.lastPlayed)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Created At: {formatDate(slot?.createdAt)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1, fontWeight: 'bold', color: '#ffd700' }}>
                                Total Skill Level: {totalSkillLevel !== null ? totalSkillLevel : "—"}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5, fontWeight: 'bold', color: '#ffd700', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <span>💰</span>
                                <span>{slot?.data?.[`playerGold_slot_${slotNumber}`] ? new Intl.NumberFormat().format(slot.data[`playerGold_slot_${slotNumber}`]) : "0"}</span>
                            </Typography>
                        </div>
                    ) : (
                        <Typography variant="body2" sx={{ color: SYSTEM_COLORS.TEXT.PRIMARY }}>
                            {t('common.empty')}
                        </Typography>
                    )}

                    <div className={styles.slotButtons}>
                        {hasData ? (
                            <Button
                                variant="contained"
                                onClick={() => handleContinue(slotNumber)}
                                sx={{
                                    backgroundColor: '#4caf50',
                                    '&:hover': { backgroundColor: '#45a049' }
                                }}
                            >
                                Continue
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={() => handleNewGame(slotNumber)}
                                sx={{
                                    backgroundColor: '#2196f3',
                                    '&:hover': { backgroundColor: '#1976d2' }
                                }}
                            >
                                New Game
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className={styles.homeContainer}>
            {/* Top right mute and exit buttons */}
            <IconButton
                onClick={handleMuteToggle}
                sx={{
                    position: 'fixed',
                    top: 16,
                    right: 75,
                    zIndex: 3000,
                    background: '#222',
                    color: '#ffd700',
                    border: '2px solid #fff',
                    borderRadius: 0,
                    fontSize: '1.5rem',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    boxShadow: '0 0 0 1px #000, 0 2px 0 0 #ffd700',
                    textShadow: '1px 1px 0px #000',
                    transition: 'all 0.2s',
                    '&:hover': { background: '#ffd700', color: '#222' },
                }}
            >
                {musicMuted ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
            <IconButton
                onClick={handleExitGame}
                sx={{
                    position: 'fixed',
                    top: 16,
                    right: 16,
                    zIndex: 3000,
                    background: '#ff6b6b',
                    color: '#fff',
                    border: '2px solid #fff',
                    borderRadius: 0,
                    fontFamily: 'Press Start 2P, monospace',
                    fontSize: '1.2rem',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    boxShadow: '0 0 0 1px #000, 0 2px 0 0 #ff6b6b',
                    textShadow: '1px 1px 0px #000',
                    letterSpacing: '1px',
                    transition: 'all 0.2s',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': { background: '#fff', color: '#ff6b6b' },
                }}
            >
                <ExitToApp sx={{ fontSize: 28 }} />
            </IconButton>
            <div className={styles.logoRow}>
                <img src="/IdleChaosLogo.png" alt="Idle Chaos Logo" className={styles.logoImage} />
            </div>

            <Typography variant="h4" className={styles.title}>
                Slot Selection
            </Typography>

            <Typography variant="body1" className={styles.subtitle}>
                Select a slot or start a new game
            </Typography>

            <div className={styles.saveSlotsContainer}>
                {[1, 2, 3].map(slotNumber => (
                    <div key={slotNumber} className={styles.saveSlotCard}>
                        {renderSaveSlot(slotNumber)}
                    </div>
                ))}
            </div>

            {/* Rename Dialog */}
            <Dialog open={renameDialog.open} onClose={() => setRenameDialog({ open: false, slot: null, name: '' })}>
                <DialogTitle>Rename Slot</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Slot Name"
                        fullWidth
                        value={renameDialog.name}
                        onChange={(e) => setRenameDialog(prev => ({ ...prev, name: e.target.value }))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRenameDialog({ open: false, slot: null, name: '' })}>
                        Cancel
                    </Button>
                    <Button onClick={handleRenameConfirm} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, slot: null })}>
                <DialogTitle>Delete Slot</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this slot? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, slot: null })}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Story Modal */}
            <StoryModal
                open={showStoryModal}
                onClose={handleStoryClose}
                characterImage="/images/characters/warrior.png"
            />
        </div>
    );
}

export default Home;
