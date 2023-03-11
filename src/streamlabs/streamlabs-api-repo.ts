import * as sqlite from 'sqlite3';
import { Logger } from '../logger';
const path = require('path');

type AuthRow = {
    id: number;
    access_token: string;
    refresh_token: string;
};

export class StreamlabsApiRepo {
    private static instance: StreamlabsApiRepo;
    private _db: sqlite.Database;
    constructor() {
        const pathToDb = path.resolve("token.db");
        this._db = new sqlite.Database(pathToDb);
        this._db.serialize(() => {
            this._db.run("CREATE TABLE IF NOT EXISTS `streamlabs_auth` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `access_token` CHAR(50), `refresh_token` CHAR(50))");
            Logger.logInfo(`creating db...`);
        });
    }

    public static getInstance(): StreamlabsApiRepo {
        if (!StreamlabsApiRepo.instance) {
            StreamlabsApiRepo.instance = new StreamlabsApiRepo();
        }
        return StreamlabsApiRepo.instance;
    }

    public static getAccessToken(): Promise<string> {
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

    public static getRefreshToken(): Promise<string> {
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

    public static setTokens(access_token: string, refresh_token: string): Promise<void> {
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
}