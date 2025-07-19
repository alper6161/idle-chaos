import { Box, Typography, Button, Divider, Tooltip } from "@mui/material";
import { formatGold } from "../utils/gold";
import { useTranslate } from "../hooks/useTranslate";
import { LOOT_BAG_LIMIT } from "../utils/constants";
import { DUNGEONS } from "../utils/enemies";
import styles from "../assets/styles/Battle.module.scss";

const LootBag = ({ 
    lootBag = [], 
    onTakeItem, 
    onSellItem, 
    onTakeAll, 
    onSellAll, 
    onOpenChest,
    calculateItemSellValue 
}) => {
    const { t } = useTranslate();

    const isChestItem = (item) => item.includes('🎁') && item.includes('Chest');

    return (
        <div className={styles.section}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">{t('battle.lootGained')}</Typography>
                <Typography variant="caption" sx={{ color: '#999' }}>
                    {lootBag.length}/{LOOT_BAG_LIMIT} {t('battle.items')}
                </Typography>
            </Box>
            <Divider />
            
            {lootBag.length === 0 ? (
                <Typography>{t('battle.noLootYet')}</Typography>
            ) : (
                <>
                    {/* Bulk Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={onTakeAll}
                            sx={{
                                fontFamily: 'Press Start 2P',
                                fontSize: '0.6rem',
                                px: 2,
                                py: 0.5,
                                background: 'linear-gradient(145deg, #4ade80 0%, #22c55e 100%)',
                                color: '#000000',
                                '&:hover': {
                                    background: 'linear-gradient(145deg, #22c55e 0%, #16a34a 100%)',
                                }
                            }}
                        >
                            {t('battle.takeAll')}
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={onSellAll}
                            sx={{
                                fontFamily: 'Press Start 2P',
                                fontSize: '0.6rem',
                                px: 2,
                                py: 0.5,
                                background: 'linear-gradient(145deg, #ffd700 0%, #f59e0b 100%)',
                                color: '#000000',
                                '&:hover': {
                                    background: 'linear-gradient(145deg, #f59e0b 0%, #d97706 100%)',
                                }
                            }}
                        >
                            {t('battle.sellAll')}
                        </Button>
                    </Box>
                    
                    {/* Individual Items */}
                    <div className={styles.lootListContainer}>
                        {lootBag.map((item, idx) => {
                            const isChest = isChestItem(item);
                            const sellValue = isChest ? 0 : calculateItemSellValue(item);
                            
                            if (isChest) {
                                // Render chest with special UI
                                const dungeonName = item.replace('🎁 ', '').replace(' Chest', '');
                                const dungeon = DUNGEONS.find(d => d.name === dungeonName);
                                
                                let tooltipContent = item;
                                if (dungeon && dungeon.chest) {
                                    tooltipContent = (
                                        <Box sx={{ p: 1 }}>
                                            <Typography variant="h6" sx={{ mb: 1, color: '#ffd700' }}>
                                                {dungeonName} Chest
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 1, color: '#e0e0e0' }}>
                                                {t('battle.possibleDrops')}:
                                            </Typography>
                                            {dungeon.chest.map((chestItem, chestIdx) => (
                                                <Typography key={chestIdx} variant="body2" sx={{ mb: 0.5, color: '#ffffff' }}>
                                                    {chestItem.name} - {chestItem.chance}%
                                                </Typography>
                                            ))}
                                            <Typography variant="body2" sx={{ mt: 1, color: '#4ade80', fontStyle: 'italic' }}>
                                                Click to open!
                                            </Typography>
                                        </Box>
                                    );
                                }
                                
                                return (
                                    <Box 
                                        key={`loot-${idx}-${item}`}
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1, 
                                            p: 1, 
                                            mb: 1,
                                            background: 'rgba(255, 215, 0, 0.1)',
                                            borderRadius: 1,
                                            border: '2px solid #ffd700'
                                        }}
                                    >
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" sx={{ fontFamily: 'Press Start 2P', fontSize: '0.6rem', color: '#ffd700' }}>
                                                🎁 {dungeonName} Chest
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#e0e0e0', fontFamily: 'Press Start 2P', fontSize: '0.5rem' }}>
                                                {t('battle.clickToOpen')}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => onOpenChest && onOpenChest(item, idx)}
                                                sx={{
                                                    fontFamily: 'Press Start 2P',
                                                    fontSize: '0.5rem',
                                                    minWidth: 'auto',
                                                    px: 1,
                                                    py: 0.5,
                                                    borderColor: '#ffd700',
                                                    color: '#ffd700',
                                                    '&:hover': {
                                                        borderColor: '#f59e0b',
                                                        backgroundColor: 'rgba(255, 215, 0, 0.1)',
                                                    }
                                                }}
                                            >
                                                {t('battle.open')}
                                            </Button>
                                        </Box>
                                    </Box>
                                );
                            }
                            
                            // Regular item
                            return (
                                <Box 
                                    key={`loot-${idx}-${item}`}
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 1, 
                                        p: 1, 
                                        mb: 1,
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: 1,
                                        border: '1px solid rgba(255, 255, 255, 0.1)'
                                    }}
                                >
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" sx={{ fontFamily: 'Press Start 2P', fontSize: '0.6rem' }}>
                                            📦 {item}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#ffd700', fontFamily: 'Press Start 2P', fontSize: '0.5rem' }}>
                                            {t('battle.sellValue')}: {formatGold(sellValue)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => onTakeItem && onTakeItem(item, idx)}
                                            sx={{
                                                fontFamily: 'Press Start 2P',
                                                fontSize: '0.5rem',
                                                minWidth: 'auto',
                                                px: 1,
                                                py: 0.5,
                                                borderColor: '#4ade80',
                                                color: '#4ade80',
                                                '&:hover': {
                                                    borderColor: '#22c55e',
                                                    backgroundColor: 'rgba(74, 222, 128, 0.1)',
                                                }
                                            }}
                                        >
                                            {t('battle.take')}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => onSellItem && onSellItem(item, idx)}
                                            sx={{
                                                fontFamily: 'Press Start 2P',
                                                fontSize: '0.5rem',
                                                minWidth: 'auto',
                                                px: 1,
                                                py: 0.5,
                                                borderColor: '#ffd700',
                                                color: '#ffd700',
                                                '&:hover': {
                                                    borderColor: '#f59e0b',
                                                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                                                }
                                            }}
                                        >
                                            {t('battle.sell')}
                                        </Button>
                                    </Box>
                                </Box>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default LootBag; 