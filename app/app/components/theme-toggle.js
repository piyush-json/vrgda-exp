"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeToggle = ThemeToggle;
const react_1 = __importDefault(require("react"));
const button_1 = require("~/components/ui/button");
const lucide_react_1 = require("lucide-react");
const use_theme_1 = require("~/hooks/use-theme");
function ThemeToggle() {
    const { theme, toggleTheme } = (0, use_theme_1.useTheme)();
    return (<button_1.Button variant='ghost' size='icon' onClick={toggleTheme} className='rounded-full' aria-label='Toggle theme' id='dan7ak'>
      {theme === 'light' ? (<lucide_react_1.MoonIcon className='h-5 w-5' id='lrdi62'/>) : (<lucide_react_1.SunIcon className='h-5 w-5' id='8l3mm6'/>)}
    </button_1.Button>);
}
