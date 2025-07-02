import './App.css'
import {Navigate, Route, Routes} from "react-router-dom";
import Home from "./pages/Home.jsx";
import Profile from "./pages/Profile.jsx";
import Battle from "./pages/Battle.jsx";

function App() {

    return (
        <>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/profile" element={<Profile/>}/>
                <Route path="/battle" element={<Battle/>}/>

                <Route path="*" element={<Navigate to="/profile" replace />} />
            </Routes>
        </>
    )
}

export default App
