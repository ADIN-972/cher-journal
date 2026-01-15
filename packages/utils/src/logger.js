"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Logger {
    prefix;
    constructor(prefix = '') {
        this.prefix = prefix;
    }
    formatMessage(level, message, data) {
        const timestamp = new Date().toISOString();
        const prefixStr = this.prefix ? `[${this.prefix}]` : '';
        const dataStr = data ? ` ${JSON.stringify(data)}` : '';
        return `${timestamp} [${level.toUpperCase()}]${prefixStr} ${message}${dataStr}`;
    }
    debug(message, data) {
        console.debug(this.formatMessage('debug', message, data));
    }
    info(message, data) {
        console.info(this.formatMessage('info', message, data));
    }
    warn(message, data) {
        console.warn(this.formatMessage('warn', message, data));
    }
    error(message, error) {
        const errorData = error instanceof Error
            ? { message: error.message, stack: error.stack }
            : error;
        console.error(this.formatMessage('error', message, errorData));
    }
    child(prefix) {
        const childPrefix = this.prefix ? `${this.prefix}:${prefix}` : prefix;
        return new Logger(childPrefix);
    }
}
exports.default = new Logger();
//# sourceMappingURL=logger.js.map