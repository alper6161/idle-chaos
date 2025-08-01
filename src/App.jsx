import './App.css'
import { useRef, useState, useEffect } from "react";
import {Navigate, Route, Routes} from "react-router-dom";
import Home from "./pages/Home.jsx";
import Skills from "./pages/Skills.jsx";
import Battle from "./pages/Battle.jsx";
import BattleSelection from "./pages/BattleSelection.jsx";
import Equipment from "./pages/Equipment.jsx";
import Store from "./pages/Store.jsx";
import Achievement from "./pages/Achievement.jsx";
import MainLayout from "./pages/MainLayout.jsx";
import Pets from "./pages/Pets.jsx";
import StartScreen from "./pages/StartScreen.jsx";

function App() {
    const audioRef = useRef(null);
    const [musicVolume, setMusicVolume] = useState(() => {
        const saved = localStorage.getItem('musicVolume');
        return saved !== null ? parseFloat(saved) : 0.5;
    });
    const [musicMuted, setMusicMuted] = useState(() => {
        const saved = localStorage.getItem('musicMuted');
        return saved === 'true';
    });
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = musicMuted ? 0 : musicVolume;
            audioRef.current.muted = musicMuted;
            audioRef.current.loop = true;
            audioRef.current.play().catch(() => {});
        }
    }, [musicVolume, musicMuted]);
    useEffect(() => {
        const handler = () => {
            const vol = localStorage.getItem('musicVolume');
            setMusicVolume(vol !== null ? parseFloat(vol) : 0.5);
            const muted = localStorage.getItem('musicMuted');
            setMusicMuted(muted === 'true');
        };
        window.addEventListener('music-settings-changed', handler);
        return () => window.removeEventListener('music-settings-changed', handler);
    }, []);
    return (
        <>
            <audio ref={audioRef} src="/sounds/sound.mp3" autoPlay loop />
            <Routes>
                <Route path="/" element={<StartScreen/>}/>
                <Route path="/home" element={<Home/>}/>
                <Route element={<MainLayout />}>
                    <Route path="/skills" element={<Skills/>}/>
                    <Route path="/battle-selection" element={<BattleSelection/>}/>
                    <Route path="/battle" element={<Battle/>}/>
                    <Route path="/equipment" element={<Equipment/>}/>
                    <Route path="/store" element={<Store/>}/>
                    <Route path="/achievement" element={<Achievement/>}/>
                    <Route path="/pets" element={<Pets />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    )
}

export default App
