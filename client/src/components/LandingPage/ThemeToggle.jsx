import React, {useEffect, useState} from "react";
import '../../styles/LandingPage/ThemeToggle.css'
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(false); //state variable that stores if its currently dark or light mode

    useEffect(() => {
        document.documentElement.setAttribute(
            "data-theme",
            isDark ? "dark" : "light" //if isDark = true, then set the data-theme to dark, otherwise, set it to light
        )
    })

    return (
        <button className="toggle-button"
        onClick={() => {
            setIsDark(!isDark); //every time the button is clicked, switch it to the opposite theme
        }}
        >{isDark ? <DarkModeIcon /> : <LightModeIcon />}
        </button>
    )
}

export default ThemeToggle;