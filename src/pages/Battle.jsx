import { useEffect, useState } from "react";
import styles from "../assets/styles/Battle.module.scss";
import {
    Typography,
    LinearProgress,
    Avatar,
    Divider
} from "@mui/material";
import { getCombatStats, getLootDrop, saveLoot } from "../utils/combat.js";
import enemies from "../utils/enemies.js";
import {getEnemyIcon, getSkillIcon} from "../utils/common.js";

const PLAYER_MAX_HP = 40;
const PLAYER_ATTACK_SPEED = 2.0;

function Battle({ player }) {
    const enemy = enemies.GOBLIN;

    const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
    const [playerProgress, setPlayerProgress] = useState(0);
    const [enemyProgress, setEnemyProgress] = useState(0);
    const [enemyHp, setEnemyHp] = useState(enemy.maxHp);
    const [lootBag, setLootBag] = useState([]);
    const [isDead, setIsDead] = useState(false);

    useEffect(() => {
        if (isDead) return;

        const playerInterval = setInterval(() => {
            setPlayerProgress((prev) => {
                const next = prev + 100 / (PLAYER_ATTACK_SPEED * 10);
                if (next >= 100) {
                    handlePlayerAttack();
                    return 0;
                }
                return next;
            });
        }, 100);

        const enemyInterval = setInterval(() => {
            setEnemyProgress((prev) => {
                const next = prev + 100 / (enemy.attackSpeed * 10);
                if (next >= 100) {
                    handleEnemyAttack();
                    return 0;
                }
                return next;
            });
        }, 100);

        return () => {
            clearInterval(playerInterval);
            clearInterval(enemyInterval);
        };
    }, [isDead]);

    const handlePlayerAttack = () => {
        const stats = getCombatStats(player, enemy);
        const hitRoll = Math.random() * 100;
        if (hitRoll <= stats.playerHitChance) {
            setEnemyHp((prev) => {
                const newHp = Math.max(prev - stats.playerHit, 0);
                if (newHp === 0) handleEnemyDefeated();
                return newHp;
            });
        }
    };

    const handleEnemyAttack = () => {
        const stats = getCombatStats(player, enemy);
        const hitRoll = Math.random() * 100;
        if (hitRoll <= stats.enemyHitChance) {
            setPlayerHp((prev) => {
                const newHp = Math.max(prev - stats.enemyHit, 0);
                if (newHp === 0) setIsDead(true);
                return newHp;
            });
        }
    };

    const handleEnemyDefeated = () => {
        const looted = getLootDrop(enemy.drops);
        setLootBag((prev) => [...prev, ...looted]);
        saveLoot(looted);
        setEnemyHp(enemy.maxHp);
    };

    return (
        <div className={styles.battleContainer}>
            <div className={styles.fighters}>
                {/* PLAYER */}
                <div className={styles.fighter}>
                    <Avatar src={getSkillIcon('slash')} className={styles.avatar} />
                    <Typography variant="h6">SLASH</Typography>
                    <Typography className={styles.hpText}>
                        HP: {playerHp}/{PLAYER_MAX_HP}
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={(playerHp / PLAYER_MAX_HP) * 100}
                        className={styles.progress}
                    />
                    <LinearProgress
                        variant="determinate"
                        value={playerProgress}
                        className={styles.progress}
                    />
                </div>

                {/* ENEMY */}
                <div className={styles.fighter}>
                    <Avatar src={getEnemyIcon('goblin')} className={styles.avatar} />
                    <Typography variant="h6">{enemy.name}</Typography>
                    <Typography className={styles.hpText}>
                        HP: {enemyHp}/{enemy.maxHp}
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={(enemyHp / enemy.maxHp) * 100}
                        className={styles.progress}
                    />
                    <LinearProgress
                        variant="determinate"
                        value={enemyProgress}
                        color="error"
                        className={styles.progress}
                    />
                </div>
            </div>

            {/* COMBAT STATS */}
            <div className={styles.section}>
                <Typography variant="h6">Combat Stats</Typography>
                <Divider />
                {Object.entries(getCombatStats(player, enemy)).map(([stat, value]) => (
                    <Typography key={stat}>
                        {stat}: {value}
                    </Typography>
                ))}
            </div>

            {/* LOOT TABLE */}
            <div className={styles.section}>
                <Typography variant="h6">Possible Loot</Typography>
                <Divider />
                {enemy.drops.map((drop) => (
                    <Typography key={drop.name}>
                        {drop.name} - {(drop.chance * 100).toFixed(0)}%
                    </Typography>
                ))}
            </div>

            {/* LOOT GAINED */}
            <div className={styles.section}>
                <Typography variant="h6">Loot Gained</Typography>
                <Divider />
                {lootBag.length === 0 ? (
                    <Typography>No loot yet...</Typography>
                ) : (
                    lootBag.map((item, idx) => (
                        <Typography key={idx} className={styles.lootBag}>
                            {item}
                        </Typography>
                    ))
                )}
            </div>
        </div>
    );
}

export default Battle;
