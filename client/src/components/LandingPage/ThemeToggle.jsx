import React, {useEffect, useState} from "react";
import '../../styles/LandingPage/ThemeToggle.css'
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import useLocalStorage from "use-local-storage";

const ThemeToggle = () => {
    const [isDark, setIsDark] = useLocalStorage("isDark", false); //use local storage that uses isDark state as key and false as the default value
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