"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("@react-router/dev/vite");
const vite_2 = __importDefault(require("@tailwindcss/vite"));
const vite_3 = require("vite");
const vite_tsconfig_paths_1 = __importDefault(require("vite-tsconfig-paths"));
exports.default = (0, vite_3.defineConfig)({
    plugins: [(0, vite_2.default)(), (0, vite_1.reactRouter)(), (0, vite_tsconfig_paths_1.default)()],
});
