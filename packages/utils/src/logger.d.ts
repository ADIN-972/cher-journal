declare class Logger {
    private prefix;
    constructor(prefix?: string);
    private formatMessage;
    debug(message: string, data?: any): void;
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, error?: any): void;
    child(prefix: string): Logger;
}
declare const _default: Logger;
export default _default;
//# sourceMappingURL=logger.d.ts.map