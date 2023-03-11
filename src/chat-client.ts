import { StaticAuthProvider } from '@twurple/auth';
import { ChatClient, ChatRaidInfo, UserNotice } from '@twurple/chat';
import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage';
import { AutoBanBotApiClient } from './api-client';
import { shouldBanBasedOnUsername } from './banned_users';
import { IChatClient } from './interfaces';
import { Logger } from './logger';

export class AutoBanBotChatClient implements IChatClient {
    private readonly _chatClient: ChatClient;
    private _isConnected = false;

    get isConnected(): boolean {
        return this._isConnected;
    }

    constructor(
        private _authProvider: StaticAuthProvider,
        private _channels: string[],
        private apiClient: AutoBanBotApiClient,
    ) {
        this._chatClient = new ChatClient({
            authProvider: _authProvider,
            channels: _channels,
        });
    }

    public async setup() {
        try {
            this.onJoin();
            this.onBan();
            this.onRaid();
            this.onMessage();
            await this.connect();
        } catch (err) {
            Logger.logError({ setupError: err });
        }
    }

    public async say(channel: string, msg: string) {
        await this._chatClient.say(channel, msg);
    }

    public async ban(user: string, channel: string, reason = `Bot account`) {
        try {
            // TODO: Auto ban here
            this._chatClient.say(channel, `Please ban ${user} for the reason: ${reason}`);
            Logger.logInfo(`Successfully banned ${user}`);
        } catch (err) {
            Logger.logError({ banError: err });
            this.callOnMods(channel, user);
        }
    }

    private async callOnMods(channel: string, user: string) {
        try {
            const mods = await this.apiClient.getModsByChannel(channel);
            this.say(channel, `I could not automatically ban ${user}. Moderator(s) ${mods.join(', ')}, please do this for me.`);
        } catch (err) {
            Logger.logError({ callOnModsErr: err });
        }
    }

    private async connect() {
        try {
            Logger.logInfo('trying to connect...');
            if (!this.isConnected) {
                await this._chatClient.connect();
                this._isConnected = true;
                Logger.logInfo('connected :)');
            } else {
                Logger.logInfo('Already connected');
            }
        } catch (err) {
            Logger.logError({ chatClientConnectionError: err })
        }
    }

    private onJoin() {
        this._chatClient.onJoin((channel: string, user: string) => {
            Logger.logInfo(`${user} has joined ${channel}`);
            if (shouldBanBasedOnUsername(user)) {
                Logger.logInfo(`Banning ${user}. Probably a bot.`);
                this.ban(user, channel);
            }
        });
    }

    private onBan() {
        this._chatClient.onBan((channel: string, user: string) => {
            const _msg = `${user} has been banned from ${channel}`;
            Logger.logInfo(_msg);
            this.say(channel, _msg);
        });
    }

    private onRaid() {
        this._chatClient.onRaid((channel: string, user: string, raidInfo: ChatRaidInfo, msg: UserNotice) => {
            const _msg = `${user} is raiding ${channel} with ${raidInfo?.viewerCount} viewer(s)!`;
            Logger.logInfo(_msg);
            this.say(channel, _msg);
        });
    }

    private onMessage() {
        this._chatClient.onMessage((channel: string, user: string, message: string, pvtMsg: TwitchPrivateMessage) => {
            Logger.logInfo(`${user} in ${channel} says '${message}'`);
            if (message.toLowerCase() === '!saysomething') {
                this.say(channel, `You got somethin' to say to me?`);
            }
        });
    }
}