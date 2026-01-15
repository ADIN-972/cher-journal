type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private prefix: string;

  constructor(prefix: string = '') {
    this.prefix = prefix;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefixStr = this.prefix ? `[${this.prefix}]` : '';
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `${timestamp} [${level.toUpperCase()}]${prefixStr} ${message}${dataStr}`;
  }

  debug(message: string, data?: any) {
    console.debug(this.formatMessage('debug', message, data));
  }

  info(message: string, data?: any) {
    console.info(this.formatMessage('info', message, data));
  }

  warn(message: string, data?: any) {
    console.warn(this.formatMessage('warn', message, data));
  }

  error(message: string, error?: any) {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error;
    console.error(this.formatMessage('error', message, errorData));
  }

  child(prefix: string): Logger {
    const childPrefix = this.prefix ? `${this.prefix}:${prefix}` : prefix;
    return new Logger(childPrefix);
  }
}

export default new Logger();
