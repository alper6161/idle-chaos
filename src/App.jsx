import './App.css'
import {Navigate, Route, Routes} from "react-router-dom";
import Home from "./pages/Home.jsx";
import Skills from "./pages/Skills.jsx";
import Battle from "./pages/Battle.jsx";
import Equipment from "./pages/Equipment.jsx";
import Store from "./pages/Store.jsx";
import Achievement from "./pages/Achievement.jsx";
import MainLayout from "./pages/MainLayout.jsx";
import Pets from "./pages/Pets.jsx";

function App() {

    return (
        <>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route element={<MainLayout />}>
                    <Route path="/skills" element={<Skills/>}/>
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
