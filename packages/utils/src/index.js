"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.sleep = sleep;
exports.generateRandomString = generateRandomString;
exports.isValidEmail = isValidEmail;
exports.truncate = truncate;
exports.formatBytes = formatBytes;
exports.parseIntSafe = parseIntSafe;
exports.createSlug = createSlug;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function truncate(str, maxLength) {
    if (str.length <= maxLength)
        return str;
    return str.slice(0, maxLength - 3) + '...';
}
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
function parseIntSafe(value, defaultValue) {
    if (!value)
        return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}
function createSlug(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
var logger_1 = require("./logger");
Object.defineProperty(exports, "logger", { enumerable: true, get: function () { return __importDefault(logger_1).default; } });
//# sourceMappingURL=index.js.map