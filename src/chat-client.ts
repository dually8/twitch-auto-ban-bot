import { StaticAuthProvider } from '@twurple/auth';
import { ChatClient, ChatRaidInfo, UserNotice } from '@twurple/chat';
import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage';
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
    ) {
        this._chatClient = new ChatClient({
            authProvider: _authProvider,
            channels: _channels,
        });
    }

    public async setup() {
        try {
            this.onConnect();
            this.onJoin();
            this.onBan();
            this.onHost();
            this.onRaid();
            this.onMessage();
            await this.connect();
        } catch (err) {
            Logger.getInstance().log.error({ setupError: err });
        }
    }

    public async say(channel: string, msg: string) {
        await this._chatClient.say(channel, msg);
    }

    public ban(user: string, channel: string, reason = `Bot account`) {
        this._chatClient.ban(channel, user, reason)
            .then(() => Logger.getInstance().log.info(`Successfully banned ${user}`))
            .catch((err) => {
                Logger.getInstance().log.error({ banError: err });
                this._chatClient.getMods(channel)
                    .then((mods) => {
                        this.say(channel, `I could not automatically ban ${user}. Moderator(s) ${mods.join(', ')}, please do this for me.`);
                    })
            });
    }

    private async connect() {
        try {
            Logger.getInstance().log.info('trying to connect...');
            if (!this.isConnected) {
                await this._chatClient.connect();
                this._isConnected = true;
                Logger.getInstance().log.info('connected :)');
            } else {
                Logger.getInstance().log.info('Already connected');
            }
        } catch (err) {
            Logger.getInstance().log.error({ chatClientConnectionError: err })
        }
    }

    private onConnect() {
        this._chatClient.onConnect(() => {
            Logger.getInstance().log.info('We are connected!');
        });
    }

    private onJoin() {
        this._chatClient.onJoin((channel: string, user: string) => {
            Logger.getInstance().log.info(`${user} has joined ${channel}`);
            if (shouldBanBasedOnUsername(user)) {
                Logger.getInstance().log.info(`Banning ${user}. Probably a bot.`);
                this.ban(user, channel);
            }
        });
    }

    private onBan() {
        this._chatClient.onBan((channel: string, user: string) => {
            const _msg = `${user} has been banned from ${channel}`;
            Logger.getInstance().log.info(_msg);
            this.say(channel, _msg);
        });
    }

    private onHost() {
        this._chatClient.onHost((host: string, channelBeingHosted: string, viewers: number) => {
            const _msg = `${host} is hosting ${channelBeingHosted} with ${viewers} viewer(s).`;
            Logger.getInstance().log.info(_msg);
            this.say(channelBeingHosted, _msg);
        });
    }

    private onRaid() {
        this._chatClient.onRaid((channel: string, user: string, raidInfo: ChatRaidInfo, msg: UserNotice) => {
            const _msg = `${user} is raiding ${channel} with ${raidInfo?.viewerCount} viewer(s)!`;
            Logger.getInstance().log.info(_msg);
            this.say(channel, _msg);
        });
    }

    private onMessage() {
        this._chatClient.onMessage((channel: string, user: string, message: string, pvtMsg: TwitchPrivateMessage) => {
            Logger.getInstance().log.info(`${user} in ${channel} says '${message}'`);
            if (message.toLowerCase() === '!saysomething') {
                this.say(channel, `You got somethin' to say to me?`);
            }
        });
    }
}