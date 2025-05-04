
/*
Logging levels, any set level also outputs the logs from any level above itself.
 */
export enum LoggingLevel {
    DEBUG = 0,
    INFO = 1,
    WARNING = 2,
    CRITICAL = 3,
    ERROR = 4,
}


/*
Basic logger, meant to very roughly correspond to the Python logging module.
 */
export class Logger {
    private readonly loggerLevel: LoggingLevel;
    private readonly timestampEnabled: Boolean;
    constructor(level: LoggingLevel = LoggingLevel.INFO, timestampEnabled: Boolean = false) {
        this.loggerLevel = level
        this.timestampEnabled = timestampEnabled
    }

    debug(...message: any[]) {
        if (this.loggerLevel <= LoggingLevel.DEBUG) {
            const output = this.#constructMsg(LoggingLevel.DEBUG)
            console.log(output, ...message, ']')
        }
    }

    info(...message: any[]) {
        if (this.loggerLevel <= LoggingLevel.INFO) {
            const output = this.#constructMsg(LoggingLevel.INFO)
            console.log(output, ...message, ']')
        }
    }

    warning(...message: any[]) {
        if (this.loggerLevel <= LoggingLevel.WARNING) {
            const output = this.#constructMsg(LoggingLevel.WARNING)
            console.warn(output, message, ']')
        }
    }

    critical(...message: any[]) {
        if (this.loggerLevel <= LoggingLevel.CRITICAL) {
            const output = this.#constructMsg(LoggingLevel.CRITICAL)
            console.warn(output, message, ']')
        }
    }

    error(...message: any[]) {
        if (this.loggerLevel <= LoggingLevel.ERROR) {
            const output = this.#constructMsg(LoggingLevel.CRITICAL)
            console.error(output, message, ']')
        }
    }

    #constructMsg(level: LoggingLevel) {
        const now = new Date()
        let msg = ``
        if (this.timestampEnabled) {
            msg += `[${now.toISOString().slice(0, 19)}]_`
        }
        msg += `[${LoggingLevel[level]}]_[`
        return msg
    }
}

export const defaultLogger = new Logger(LoggingLevel.DEBUG, true)

