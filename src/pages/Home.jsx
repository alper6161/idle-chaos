import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../assets/styles/Home.module.scss";

function Home() {
    const navigate = useNavigate();
    const [hasSave, setHasSave] = useState(false);

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
        const input = prompt("Paste your save data:");
        try {
            const parsed = JSON.parse(input);
            localStorage.setItem("gameData", JSON.stringify(parsed));
            alert("Save imported!");
            setHasSave(true);
        } catch (e) {
            alert("Invalid save data!");
        }
    };

    return (
        <div className={styles.homeContainer}>
            <img
                src="/images/logo.png"
                alt="Game Logo"
                className={styles.logo}
            />

            <button className={styles.button} onClick={handleNewGame}>
                New Game
            </button>

            {hasSave && (
                <button
                    className={`${styles.button} ${styles.secondary}`}
                    onClick={handleContinue}
                >
                    Continue Game
                </button>
            )}

            <button
                className={`${styles.button} ${styles.secondary}`}
                onClick={handleImport}
            >
                Import Save
            </button>
        </div>
    );
}

export default Home;
