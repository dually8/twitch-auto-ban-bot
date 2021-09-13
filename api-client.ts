import { ClientCredentialsAuthProvider } from '@twurple/auth';
import { ApiClient } from '@twurple/api';

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
            console.error({ getUserInfoError: err });
        }
    }
}