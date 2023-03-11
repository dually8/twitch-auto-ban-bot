import * as SimpleNodeLogger from 'simple-node-logger';

export class Logger {
    private static instance: Logger;
    private _log: SimpleNodeLogger.Logger;

    private constructor() {
        this._log = SimpleNodeLogger.createRollingFileLogger({
            fileNamePattern: '<DATE>.log',
            dateFormat: 'YYYY-MM-DD',
            // README: Must create this directory before running
            logDirectory: __dirname + '/twitch-bot-logs',
            prettyPrint: true,

        });
        this._log.addAppender(new SimpleNodeLogger.appenders.ConsoleAppender({
            prettyPrint: true,
            timestampFormat: 'YYYY-MM-DD HH:mm:ss',
        }));
    }

    get log(): SimpleNodeLogger.Logger {
        return Logger.getInstance()._log;
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    public static logInfo(...args) {
        Logger.getInstance().log.info(args);
    }

    public static logWarning(...args) {
        Logger.getInstance().log.warn(args);
    }

    public static logError(...args) {
        Logger.getInstance().log.error(args);
    }
}