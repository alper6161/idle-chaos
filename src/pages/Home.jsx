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

const GAME_STATE_KEYS = [
    'playerHealth', 'playerGold', 'playerLevel', 'playerXP',
    'inventory', 'equippedItems', 'lootBag', 'potions',
    'autoPotionSettings', 'skillLevels', 'skillXP',
    'achievements', 'unlockedEnemies', 'gameData'
];

// Skill seviyelerini toplayan yardımcı fonksiyon
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
        alert("Çıkış fonksiyonu sadece uygulama modunda çalışır.");
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
        // Sadece ilgili slotu ve oyun state anahtarlarını sil
        deleteSlot(slotNumber);
        GAME_STATE_KEYS.forEach(key => localStorage.removeItem(key));
        // Skill seviyelerini baştan kaydet
        localStorage.setItem('gameData', JSON.stringify(INITIAL_SKILLS));
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
        const totalSkillLevel = slot?.data?.gameData ? getTotalSkillLevel(slot.data.gameData) : null;

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
                            {isCurrentSlot && <span className={styles.currentIndicator}> (Aktif)</span>}
                        </Typography>
                        <div className={styles.slotActions}>
                            {hasData && (
                                <>
                                    <Tooltip title="Oyunu Devam Et">
                                        <IconButton 
                                            onClick={() => handleContinue(slotNumber)}
                                            size="small"
                                            sx={{ color: '#4caf50' }}
                                        >
                                            <PlayArrow />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Yeniden Adlandır">
                                        <IconButton 
                                            onClick={() => handleRename(slotNumber)}
                                            size="small"
                                            sx={{ color: '#ff9800' }}
                                        >
                                            <Edit />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Kaydı Sil">
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
                                Son Oynanma: {formatDate(slot?.lastPlayed)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Oluşturulma: {formatDate(slot?.createdAt)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1, fontWeight: 'bold', color: '#ffd700' }}>
                                Toplam Skill Level: {totalSkillLevel !== null ? totalSkillLevel : "—"}
                            </Typography>
                        </div>
                    ) : (
                        <Typography variant="body2" color="textSecondary">
                            Boş Kayıt
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
                                Devam Et
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
                                Yeni Oyun
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className={styles.homeContainer}>
            {/* Sağ üstte mute ve çıkış butonları */}
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
                Kayıt Seçimi
            </Typography>

            <Typography variant="body1" className={styles.subtitle}>
                Bir kayıt seçin veya yeni bir oyun başlatın
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
                <DialogTitle>Kayıt Adını Değiştir</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Kayıt Adı"
                        fullWidth
                        value={renameDialog.name}
                        onChange={(e) => setRenameDialog(prev => ({ ...prev, name: e.target.value }))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRenameDialog({ open: false, slot: null, name: '' })}>
                        İptal
                    </Button>
                    <Button onClick={handleRenameConfirm} variant="contained">
                        Kaydet
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, slot: null })}>
                <DialogTitle>Kaydı Sil</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bu kaydı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, slot: null })}>
                        İptal
                    </Button>
                    <Button onClick={handleDeleteConfirm} variant="contained" color="error">
                        Sil
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
