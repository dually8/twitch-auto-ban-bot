import * as tmi from 'tmi.js';
import { shouldBanBasedOnUsername } from './banned_users';
import { IChatClient } from "./interfaces";

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
            console.error({ setupError: err });
        }
    }
    public async say(channel: string, msg: string): Promise<void> {
        try {
            await this._chatClient.say(channel, msg);
        } catch (err) {
            console.error({
                sayErr: err
            });
        }
    }
    ban(user: string, channel: string, reason: string = 'Bot account'): void {
        this._chatClient.ban(channel, user, reason)
            .then(() => console.log(`Successfully banned ${user}`))
            .catch((err) => {
                console.error({ banError: err });
                this._chatClient.mods(channel)
                    .then((mods) => {
                        this.say(channel, `I could not automatically ban ${user}. Moderator(s) ${mods.join(', ')}, please do this for me.`);
                    });
            });
    }

    private async connect() {
        try {
            console.log('trying to connect...');
            if (!this.isConnected) {
                await this._chatClient.connect();
                console.log('connected :)');
            } else {
                console.log('Already connected');
            }
        } catch (err) {
            console.error({ chatClientConnectionError: err })
        }
    }
    private async onConnect() {
        this._chatClient.on('connected', (address, port) => {
            console.log(`Connected on ${address}:${port}`);
            this._isConnected = true;
        });
    }
    private async onDisconnect() {
        this._chatClient.on('disconnected', (reason) => {
            this._isConnected = false;
            console.log(`Got disconnected: ${reason}`);
        });
    }
    private onJoin() {
        this._chatClient.on('join', (channel, username, self) => {
            console.log({
                onJoin: {
                    channel, username, self
                }
            });
            if (self) return;
            if (shouldBanBasedOnUsername(username)) {
                console.log(`Banning ${username}. User matched bannable list/regex.`);
                this.ban(username, channel);
            }
        });
    }
    private onBan() {
        this._chatClient.on('ban', (channel, username, reason, userstate) => {
            console.log({
                onBan: {
                    channel, username, reason, userstate
                }
            });
            this.say(channel, `${username} was banned.`);
        });
    }
    private onHost() {
        this._chatClient.on('hosted', (channel, username, viewers, autohost) => {
            console.log({
                onHost: {
                    channel, username, viewers, autohost,
                }
            });
            this.say(channel, `${username} is hosting with ${viewers} viewer(s)!`);
        });
    }
    private onRaid() {
        this._chatClient.on('raided', (channel, username, viewers) => {
            console.log({
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
            console.log(`${user} in ${channel} says '${message}'`);
            if (message.toLowerCase() === '!saysomething') {
                this.say(channel, `You got somethin' to say to me?`);
            }
        });
    }
}