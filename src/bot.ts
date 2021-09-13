require('dotenv').config();

import { ClientCredentialsAuthProvider, StaticAuthProvider } from '@twurple/auth';
import { ApiClient } from '@twurple/api';
import { NgrokAdapter } from '@twurple/eventsub-ngrok';

import { AutoBanBotApiClient } from './api-client';
import { AutoBanBotChatClient } from './chat-client';
import { AutoBanBotEventSubListener } from './event-sub-listener';
import { TmiChatClient } from './tmi-chat-client';

const main = () => {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const secret = process.env.SECRET_SECRET;

    // get chat client id and access token from here
    // https://chatterino.com/client_login/
    const chatClientId = process.env.CHAT_CLIENT_ID;
    const chatAccessToken = process.env.CHAT_ACCESS_TOKEN;
    const chatUsename = process.env.TWITCH_USERNAME;
    const chatPassword = process.env.OAUTH_PASSWORD;
    const chatChannels = [
        'dually8',
        // list your channel(s) here
    ]

    const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);

    const chatAuthProvider = new StaticAuthProvider(chatClientId, chatAccessToken);
    const adapter = new NgrokAdapter();
    const autoBanBotApiClient = new AutoBanBotApiClient(authProvider);
    // const autoBanBotChatClient = new AutoBanBotChatClient(chatAuthProvider, chatChannels);
    const autoBanBotChatClient = new TmiChatClient({
        channels: chatChannels.map(channel => `#${channel}`),
        connection: {
            reconnect: true,
            secure: true,
        },
        identity: {
            username: chatUsename,
            password: chatPassword,
        },
        // options: {
        //     debug: true,
        // },
    });

    autoBanBotChatClient.setup()
        .then(async () => {
            chatChannels.forEach(c => autoBanBotChatClient.say(c, `Auto Ban Bot has connected!`));
            const eventSubListenerConfig = {
                config: {
                    apiClient: new ApiClient({ authProvider }),
                    adapter,
                    secret
                },
                apiClient: autoBanBotApiClient,
                chatClient: autoBanBotChatClient,
            }
            const autoBanBotEventSubListener = new AutoBanBotEventSubListener(
                eventSubListenerConfig.config,
                eventSubListenerConfig.apiClient,
                eventSubListenerConfig.chatClient,
                clientId,
                clientSecret,
            );

            await autoBanBotEventSubListener.clearAllSubscriptions();
            autoBanBotEventSubListener.watchFollowEventsByUser('dually8');
        })
        .catch((chatSetupError) => console.error({ chatSetupError }));
}

main();