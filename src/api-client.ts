import { StaticAuthProvider } from '@twurple/auth';
import { ApiClient } from '@twurple/api';
import { Logger } from './logger';

export class AutoBanBotApiClient {
    private readonly _apiClient: ApiClient;
    private _modId = '';

    constructor(
        private _authProvider: StaticAuthProvider,
    ) {
        this._apiClient = new ApiClient({ authProvider: _authProvider });
        this.setModId();
    }
    private async setModId() {
        try {
            const tokenInfo = await this._apiClient.getTokenInfo();
            this._modId = tokenInfo?.userId || '';
        } catch (err) {
            Logger.logError({ setModIdError: err });
        }
    }

    public async getUserInfo(username: string) {
        try {
            const result = await this._apiClient.users.getUserByName(username);
            return {
                id: result.id,
                name: result.name,
                displayName: result.displayName,
                creationDate: result.creationDate,
            }
        } catch (err) {
            Logger.logError({ getUserInfoError: err });
        }
    }

    public async getFollowersByChannelName(channelName: string) {
        try {
            const userInfo = await this.getUserInfo(channelName);
            return await this.getFollowersByChannelId(userInfo.id);
        } catch (err) {
            Logger.logError({ getFollowersByChannelName: err });
            throw err;
        }
    }

    public async getFollowersByChannelId(id: string) {
        try {
            const result = await this._apiClient.channels.getChannelFollowers(id, this._modId);
            return result.data.map(x => x.userName);
        } catch (err) {
            Logger.logError({ getFollowersByChannelIdError: err });
            throw err;
        }
    }

    public async getModsByChannel(channel: string): Promise<string[]> {
        try {
            const user = await this._apiClient.users.getUserByName(channel);
            const mods = await this._apiClient.moderation.getModerators(user.id);
            return mods.data.map(m => m.userName);
        } catch (err) {
            Logger.logError({ getModsByChannelError: err });
            throw err;
        }
    }

    public async banUser(userToBan: string, reason = 'Bot account'): Promise<void> {
        try {
            const userToBanId = await this._apiClient.users.getUserByName(userToBan);
            await this._apiClient.moderation.banUser(userToBanId, this._modId, {
                reason,
                user: userToBanId,
            })
        } catch (err) {
            Logger.logError({ banUserError: err });
        }
    }
}