import { EventSubListener, EventSubListenerConfig } from '@twurple/eventsub';
import fetch from 'node-fetch';
import axios from 'axios';
import { AutoBanBotApiClient } from './api-client';
import { shouldBanBasedOnCreationDate, shouldBanBasedOnUsername } from './banned_users';
import { IChatClient } from './interfaces';
import { Logger } from './logger';
import { StreamlabsApiClient } from './streamlabs/streamlabs-api-client';
import { StreamlabsApiRepo } from './streamlabs/streamlabs-api-repo';

export type EventSubListenerParams = {
    config: EventSubListenerConfig;
    apiClient: AutoBanBotApiClient;
    streamlabsClient: StreamlabsApiClient;
    chatClient: IChatClient;
    clientId: string;
    clientSecret: string;
}
export class AutoBanBotEventSubListener {
    private readonly _listener: EventSubListener;
    private _bearerToken = '';

    private get apiClient() {
        return this.params.apiClient;
    }
    private get chatClient() {
        return this.params.chatClient;
    }
    private get streamlabsClient() {
        return this.params.streamlabsClient;
    }

    constructor(private params: EventSubListenerParams) {
        this._listener = new EventSubListener(this.params.config);
        this.listen();
    }

    public async watchFollowEventsByUser(user: string) {
        try {
            const userId = await this.getId(user);
            if (userId) {
                this._listener.subscribeToChannelFollowEvents(userId, async (event) => {
                    const userInfo = await this.apiClient.getUserInfo(event.userName);
                    const shouldBanDate = shouldBanBasedOnCreationDate(userInfo?.creationDate);
                    const shouldBanUser = shouldBanBasedOnUsername(event.userName);
                    Logger.getInstance().log.info({
                        followEvent: event,
                        shouldBanUser,
                        shouldBanDate,
                    });
                    const channel = event.broadcasterName;
                    const follower = event.userName;
                    if (!shouldBanUser && !shouldBanDate) {
                        this.chatClient.say(channel, `Thank you for following ${follower}!`);
                    } else {
                        Logger.getInstance().log.info(`Banning new follower ${follower}. Probably a bot.`);
                        this.chatClient.ban(follower, channel);
                        const accessToken = await StreamlabsApiRepo.getAccessToken();
                        if (accessToken) {
                            this.streamlabsClient.skipAlert();
                        }
                    }
                }).catch((followEventError) => Logger.getInstance().log.error({ followEventError }));
            } else {
                throw new Error(`Could not retrieve userId from ${user}`);
            }
        } catch (err) {
            Logger.getInstance().log.error({
                watchFollowEventsByUserError: err
            });
        }
    }

    public async watchChannelUpdate(user: string) {
        try {
            const userId = await this.getId(user);
            if (userId) {
                this._listener.subscribeToChannelUpdateEvents(userId, (event) => {
                    Logger.getInstance().log.info({
                        channelUpdateEvent: event,
                    });
                }).catch((channelUpdateError) => Logger.getInstance().log.error({ channelUpdateError }));
            } else {
                throw new Error(`Could not retrieve userId from ${user}`);
            }
        } catch (err) {
            Logger.getInstance().log.error({
                watchChannelUpdateError: err
            });
        }
    }

    public async clearAllSubscriptions() {
        try {
            await this.setBearerToken();
            const events = await this.getEvents();
            if (events && events.data && events.data.length > 0) {
                Logger.getInstance().log.info(`Clearing ${events.data.length} event(s)`);
                await Promise.all(events.data.map(e => this.deleteEventSubscription(e.id)));
                Logger.getInstance().log.info(`Done clearing events`);
            } else {
                Logger.getInstance().log.info(`No events to clear`);
            }
        } catch (err) {
            Logger.getInstance().log.error({
                clearAllSubsError: err,
            });
        }
    }

    private async listen() {
        try {
            await this._listener.listen();
            Logger.getInstance().log.info('listening...');
        } catch (err) {
            Logger.getInstance().log.error({ listenError: err });
        }
    }

    private async getId(username: string) {
        const userInfo = await this.apiClient.getUserInfo(username);
        return userInfo && userInfo.id || '';
    }

    private async deleteEventSubscription(id: string) {
        await axios.delete(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${id}`, {
            headers: {
                Authorization: `Bearer ${this._bearerToken}`,
                'Client-ID': this.params.clientId,
            }
        });
    }

    private async getEvents() {
        return await axios.get(
            `https://api.twitch.tv/helix/eventsub/subscriptions`,
            {
                headers: {
                    Authorization: `Bearer ${this._bearerToken}`,
                    'Client-ID': this.params.clientId,
                },
            },
        ).then((response) => response && response.data) as { data: EventDataResponse[] };
    }

    private async setBearerToken() {
        const url = `https://id.twitch.tv/oauth2/token?client_id=${this.params.clientId}&client_secret=${this.params.clientSecret}&grant_type=client_credentials`;
        const result = await axios.post(url).then(res => res && res.data) as { access_token: string, expires_in: number, token_type: string };
        this._bearerToken = result.access_token;
    }
}

type EventDataResponse = {
    id: string;
    status: string;
    type: string;
    version: string;
    cost: number;
    created_at: string;
}