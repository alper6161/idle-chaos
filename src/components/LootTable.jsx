import React from 'react';
import { Typography, Divider } from '@mui/material';
import { useTranslate } from '../hooks/useTranslate';
import styles from '../assets/styles/Battle.module.scss';

const LootTable = ({ currentEnemy }) => {
    const { t } = useTranslate();

    return (
        <div className={styles.section}>
            <Typography variant="h6">{t('battle.possibleLoot')}</Typography>
            <Divider />
            {currentEnemy?.drops?.map((drop) => (
                <Typography key={drop.name} className={drop.type === 'gold' ? styles.goldLoot : styles.equipmentLoot}>
                    {drop.name} - {(drop.chance * 100).toFixed(0)}%
                    {drop.type === 'gold' && (
                        <span className={styles.goldValue}> (💰 {drop.value} Gold)</span>
                    )}
                </Typography>
            )) || (
                <Typography>{t('battle.noDropsAvailable')}</Typography>
            )}
        </div>
    );
};

export default LootTable; 