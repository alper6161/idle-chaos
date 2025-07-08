import './App.css'
import {Navigate, Route, Routes} from "react-router-dom";
import Home from "./pages/Home.jsx";
import Profile from "./pages/Profile.jsx";
import Battle from "./pages/Battle.jsx";
import Equipment from "./pages/Equipment.jsx";
import MainLayout from "./pages/MainLayout.jsx";

function App() {

    return (
        <>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/" element={<MainLayout />}>
                    <Route path="/profile" element={<Profile/>}/>
                    <Route path="/battle" element={<Battle/>}/>
                    <Route path="/equipment" element={<Equipment/>}/>

                    <Route path="*" element={<Navigate to="/profile" replace />} />
                </Route>
            </Routes>
        </>
    )
}

export default App
