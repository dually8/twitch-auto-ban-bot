import * as sqlite from 'sqlite3';
import { Logger } from '../logger';
const path = require('path');

type AuthRow = {
    id: number;
    access_token: string;
    refresh_token: string;
};
type TwurpleRow = {
    id: number;
    user_id: string;
    token_data: string;
};

export class StreamlabsApiRepo {
    private static instance: StreamlabsApiRepo;
    private _db: sqlite.Database;
    constructor() {
        const pathToDb = path.resolve("token.db");
        this._db = new sqlite.Database(pathToDb);
        this._db.serialize(() => {
            this._db.run("CREATE TABLE IF NOT EXISTS `streamlabs_auth` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `access_token` CHAR(50), `refresh_token` CHAR(50))");
            this._db.run("CREATE TABLE IF NOT EXISTS `twurple_auth` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `user_id` CHAR(50), `token_data` CHAR(1000))");
            Logger.logInfo(`creating streamlabs db...`);
        });
    }

    public static getInstance(): StreamlabsApiRepo {
        if (!StreamlabsApiRepo.instance) {
            StreamlabsApiRepo.instance = new StreamlabsApiRepo();
        }
        return StreamlabsApiRepo.instance;
    }

    public static getStreamlabsAccessToken(): Promise<string> {
        return new Promise((resolve, reject) => {
            StreamlabsApiRepo.getInstance()._db.serialize(() => {
                StreamlabsApiRepo.getInstance()._db.get("SELECT * FROM `streamlabs_auth`", (err, row: AuthRow) => {
                    if (row && row.access_token) {
                        resolve(row.access_token);
                    } else if (err) {
                        reject(err)
                    } else {
                        resolve(''); // return empty string
                    }
                });
            });
        });
    }

    public static getStreamlabsRefreshToken(): Promise<string> {
        return new Promise((resolve, reject) => {
            StreamlabsApiRepo.getInstance()._db.serialize(() => {
                StreamlabsApiRepo.getInstance()._db.get("SELECT * FROM `streamlabs_auth`", (err, row: AuthRow) => {
                    if (row && row.refresh_token) {
                        resolve(row.refresh_token);
                    } else if (err) {
                        reject(err)
                    } else {
                        resolve(''); // return empty string
                    }
                });
            });
        });
    }

    public static setStreamlabsTokens(access_token: string, refresh_token: string): Promise<void> {
        return new Promise((resolve, reject) => {
            StreamlabsApiRepo.getInstance()._db.serialize(() => {
                StreamlabsApiRepo
                    .getInstance()
                    ._db
                    .run("INSERT INTO `streamlabs_auth` (access_token, refresh_token) VALUES (?,?)", [access_token, refresh_token], (result, err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
            });
        })
    }

    public static getTwurpleTokenData(): Promise<string> {
        return new Promise((resolve, reject) => {
            StreamlabsApiRepo.getInstance()._db.serialize(() => {
                StreamlabsApiRepo.getInstance()._db.get("SELECT * FROM `twurple_auth`", (err, row: TwurpleRow) => {
                    if (row && row.token_data) {
                        resolve(row.token_data);
                    } else if (err) {
                        reject(err)
                    } else {
                        resolve('{}'); // return empty stringify'd object
                    }
                });
            });
        });
    }

    /**
     *
     * @param user_id
     * @param token_data JSON.stringify'd tokenData
     * @returns
     */
    public static setTwurpleTokens(user_id: string, token_data: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE twurple_auth SET token_data='${token_data}' WHERE user_id = '${user_id}'`;
            StreamlabsApiRepo.getInstance()._db.serialize(() => {
                StreamlabsApiRepo
                    .getInstance()
                    ._db
                    .run(
                        sql,
                        [],
                        (result: SqliteResult, error) => {
                            console.log('-- Set Tokens --');
                            console.log(JSON.stringify(result));
                            if (error || result?.errno > 0)
                                reject(error || result?.message);
                            else
                                resolve();
                        }
                    )
            });
        })
    }
}

interface SqliteResult {
    code: string;
    errno: number;
    message: string;
    stack: string;
}