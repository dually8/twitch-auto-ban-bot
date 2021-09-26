import { ClientCredentialsAuthProvider } from '@twurple/auth';
import { ApiClient } from '@twurple/api';
import { Logger } from './logger';

export class AutoBanBotApiClient {
    private readonly _apiClient: ApiClient;

    constructor(
        private _authProvider: ClientCredentialsAuthProvider,
    ) {
        this._apiClient = new ApiClient({ authProvider: _authProvider });
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
            Logger.getInstance().log.error({ getUserInfoError: err });
        }
    }

    public async getFollowersByChannelName(channelName: string) {
        try {
            const userInfo = await this.getUserInfo(channelName);
            return await this.getFollowersByChannelId(userInfo.id);
        } catch (err) {
            Logger.getInstance().log.error({ getFollowersByChannelName: err });
            throw err;
        }
    }

    public async getFollowersByChannelId(id: string) {
        try {
            const result = await this._apiClient.users.getFollows({
                followedUser: id,
            });
            return result.data.map(x => x.userName);
        } catch (err) {
            Logger.getInstance().log.error({ getFollowersByChannelIdError: err });
            throw err;
        }

    }
}