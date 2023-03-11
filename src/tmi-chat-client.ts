import * as tmi from 'tmi.js';
import { shouldBanBasedOnUsername } from './banned_users';
import { shouldBanBasedOnTerm } from './blocked-terms';
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
            Logger.logError({ setupError: err });
        }
    }
    public async say(channel: string, msg: string): Promise<void> {
        try {
            await this._chatClient.say(channel, msg);
        } catch (err) {
            Logger.logError({
                sayErr: err
            });
        }
    }
    public async ban(user: string, channel: string, reason: string = 'Bot account'): Promise<void> {
        try {
            await this._chatClient.ban(channel, user, reason);
            Logger.logInfo(`Successfully banned ${user}`);
        } catch (err) {
            Logger.logError({ banError: err });
            this.callOnMods(channel, user);
        }
    }

    private async callOnMods(channel: string, user: string) {
        try {
            const mods = await this._chatClient.mods(channel);
            this.say(channel, `I could not automatically ban @${user}. Moderator(s) @${mods.join(', @')}, please do this for me.`);
        } catch (err) {
            Logger.logError({ callOnModsError: err });
        }
    }

    private async connect() {
        try {
            Logger.logInfo('trying to connect...');
            if (!this.isConnected) {
                await this._chatClient.connect();
                Logger.logInfo('connected :)');
            } else {
                Logger.logInfo('Already connected');
            }
        } catch (err) {
            Logger.logError({ chatClientConnectionError: err })
        }
    }
    private async onConnect() {
        this._chatClient.on('connected', (address, port) => {
            Logger.logInfo(`Connected on ${address}:${port}`);
            this._isConnected = true;
        });
    }
    private async onDisconnect() {
        this._chatClient.on('disconnected', (reason) => {
            this._isConnected = false;
            Logger.logInfo(`Got disconnected: ${reason}`);
        });
    }
    private onJoin() {
        this._chatClient.on('join', (channel, username, self) => {
            Logger.logInfo({
                onJoin: {
                    channel, username, self
                }
            });
            if (self) return;
            if (shouldBanBasedOnUsername(username)) {
                Logger.logInfo(`Banning ${username}. User matched bannable list/regex.`);
                this.ban(username, channel);
            }
        });
    }
    private onBan() {
        this._chatClient.on('ban', (channel, username, reason) => {
            Logger.logInfo({
                onBan: {
                    channel, username, reason
                }
            });
            this.say(channel, `${username} was banned.`);
        });
    }
    private onHost() {
        this._chatClient.on('hosted', (channel, username, viewers, autohost) => {
            Logger.logInfo({
                onHost: {
                    channel, username, viewers, autohost,
                }
            });
            this.say(channel, `${username} is hosting with ${viewers} viewer(s)!`);
        });
    }
    private onRaid() {
        this._chatClient.on('raided', (channel, username, viewers) => {
            Logger.logInfo({
                onRaid: {
                    channel, username, viewers
                }
            });
            this.say(channel, `${username} is raiding with ${viewers} viewer(s)! omg!`);
        });
    }
    private onMessage() {
        this._chatClient.on('message', async (channel, userstate, message, self) => {
            if (self) return;
            const user = userstate.username;
            Logger.logInfo(`${user} in ${channel} says '${message}'`);
            if (message.toLowerCase() === '!saysomething') {
                this.say(channel, `You got somethin' to say to me, @${user}?`);
            } else if (shouldBanBasedOnTerm(message)) {
                const vips = await this._chatClient.vips(channel);
                const mods = await this._chatClient.mods(channel);
                const broadcaster = channel.replace('#', '');
                if (![...vips, ...mods, broadcaster].includes(user)) {
                    this.ban(userstate.username, channel, 'Using banned term');
                } else {
                    Logger.logInfo(`${user} in ${channel} is either a mod, vip, or the broadcaster, so we won't ban them for saying a bad word.`)
                    this.say(channel, `Watch your mouth @${user}. That's a banned term. Do it again and I'll smack you.`);
                }
            }
        });
    }
}