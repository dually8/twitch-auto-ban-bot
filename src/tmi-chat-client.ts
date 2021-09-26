import * as tmi from 'tmi.js';
import { shouldBanBasedOnUsername } from './banned_users';
import { IChatClient } from "./interfaces";
import { Logger } from './logger';

export class TmiChatClient implements IChatClient {
    private readonly _chatClient: tmi.Client;
    private _isConnected = false;
    get isConnected(): boolean {
        return this._isConnected;
    }
    constructor(
        private options: tmi.Options,
    ) {
        this._chatClient = new tmi.client(options);
    }
    public async setup(): Promise<void> {
        try {
            this.onConnect();
            this.onDisconnect();
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
    public async say(channel: string, msg: string): Promise<void> {
        try {
            await this._chatClient.say(channel, msg);
        } catch (err) {
            Logger.getInstance().log.error({
                sayErr: err
            });
        }
    }
    ban(user: string, channel: string, reason: string = 'Bot account'): void {
        this._chatClient.ban(channel, user, reason)
            .then(() => Logger.getInstance().log.info(`Successfully banned ${user}`))
            .catch((err) => {
                Logger.getInstance().log.error({ banError: err });
                this._chatClient.mods(channel)
                    .then((mods) => {
                        this.say(channel, `I could not automatically ban ${user}. Moderator(s) ${mods.join(', ')}, please do this for me.`);
                    });
            });
    }

    private async connect() {
        try {
            Logger.getInstance().log.info('trying to connect...');
            if (!this.isConnected) {
                await this._chatClient.connect();
                Logger.getInstance().log.info('connected :)');
            } else {
                Logger.getInstance().log.info('Already connected');
            }
        } catch (err) {
            Logger.getInstance().log.error({ chatClientConnectionError: err })
        }
    }
    private async onConnect() {
        this._chatClient.on('connected', (address, port) => {
            Logger.getInstance().log.info(`Connected on ${address}:${port}`);
            this._isConnected = true;
        });
    }
    private async onDisconnect() {
        this._chatClient.on('disconnected', (reason) => {
            this._isConnected = false;
            Logger.getInstance().log.info(`Got disconnected: ${reason}`);
        });
    }
    private onJoin() {
        this._chatClient.on('join', (channel, username, self) => {
            Logger.getInstance().log.info({
                onJoin: {
                    channel, username, self
                }
            });
            if (self) return;
            if (shouldBanBasedOnUsername(username)) {
                Logger.getInstance().log.info(`Banning ${username}. User matched bannable list/regex.`);
                this.ban(username, channel);
            }
        });
    }
    private onBan() {
        this._chatClient.on('ban', (channel, username, reason) => {
            Logger.getInstance().log.info({
                onBan: {
                    channel, username, reason
                }
            });
            this.say(channel, `${username} was banned.`);
        });
    }
    private onHost() {
        this._chatClient.on('hosted', (channel, username, viewers, autohost) => {
            Logger.getInstance().log.info({
                onHost: {
                    channel, username, viewers, autohost,
                }
            });
            this.say(channel, `${username} is hosting with ${viewers} viewer(s)!`);
        });
    }
    private onRaid() {
        this._chatClient.on('raided', (channel, username, viewers) => {
            Logger.getInstance().log.info({
                onRaid: {
                    channel, username, viewers
                }
            });
            this.say(channel, `${username} is raiding with ${viewers} viewer(s)! omg!`);
        });
    }
    private onMessage() {
        this._chatClient.on('message', (channel, userstate, message, self) => {
            if (self) return;
            const user = userstate.username;
            Logger.getInstance().log.info(`${user} in ${channel} says '${message}'`);
            if (message.toLowerCase() === '!saysomething') {
                this.say(channel, `You got somethin' to say to me?`);
            }
        });
    }
}