import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../assets/styles/Home.module.scss";
import { useTranslate } from "../hooks/useTranslate";

function Home() {
    const navigate = useNavigate();
    const [hasSave, setHasSave] = useState(false);
    const { t } = useTranslate();

    useEffect(() => {
        const save = localStorage.getItem("gameData");
        if (save) setHasSave(true);
    }, []);

    const handleNewGame = () => {
        localStorage.removeItem("gameData");
        navigate("/battle");
    };

    const handleContinue = () => navigate("/battle");

    const handleImport = () => {
        const input = prompt(t('common.pasteSaveData'));
        try {
            const parsed = JSON.parse(input);
            localStorage.setItem("gameData", JSON.stringify(parsed));
            alert(t('common.saveImported'));
            setHasSave(true);
        } catch (e) {
            alert(t('common.invalidSaveData'));
        }
    };

    return (
        <div className={styles.homeContainer}>
            <img
                src="/images/logo.png"
                                        alt={t('common.gameLogo')}
                className={styles.logo}
            />

            <button className={styles.button} onClick={handleNewGame}>
                {t('common.newGame')}
            </button>

            {hasSave && (
                <button
                    className={`${styles.button} ${styles.secondary}`}
                    onClick={handleContinue}
                >
                    {t('common.continueGame')}
                </button>
            )}

            <button
                className={`${styles.button} ${styles.secondary}`}
                onClick={handleImport}
            >
                {t('common.importSave')}
            </button>
        </div>
    );
}

export default Home;
