"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTheme = useTheme;
const react_1 = require("react");
function useTheme() {
    const [theme, setTheme] = (0, react_1.useState)('light');
    (0, react_1.useEffect)(() => {
        // Check for system preference or stored preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        }
        else if (prefersDark) {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        }
    }, []);
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark');
    };
    return { theme, toggleTheme };
}
