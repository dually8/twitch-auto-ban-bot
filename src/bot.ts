// Make it to where we can use process.env.WHATEVER
require('dotenv').config();

import { ClientCredentialsAuthProvider } from '@twurple/auth';
import { ApiClient } from '@twurple/api';
import { NgrokAdapter } from '@twurple/eventsub-ngrok';

import { AutoBanBotApiClient } from './api-client';
import { AutoBanBotEventSubListener } from './event-sub-listener';
import { TmiChatClient } from './tmi-chat-client';
import { shouldBanBasedOnUsername } from './banned_users';

const main = () => {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const secret = process.env.SECRET_SECRET;

    // get chat oauth token from here
    // https://chatterino.com/client_login/
    // or here https://twitchapps.com/tmi/
    const chatUsername = process.env.TWITCH_USERNAME;
    const chatPassword = process.env.OAUTH_PASSWORD;
    const chatChannels = [
        'dually8',
        // list your channel(s) here
    ]

    const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
    const adapter = new NgrokAdapter();
    const autoBanBotApiClient = new AutoBanBotApiClient(authProvider);
    const autoBanBotChatClient = new TmiChatClient({
        channels: chatChannels.map(channel => `#${channel}`),
        connection: {
            reconnect: true,
            secure: true,
        },
        identity: {
            username: chatUsername,
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
            chatChannels.forEach(async (chan) => {
                // Get the latest followers
                const followers = await autoBanBotApiClient.getFollowersByChannelName(chan);
                // Filter them by the ones you want to ban
                const followersToBan = followers.filter(x => shouldBanBasedOnUsername(x));
                // Bring down the ban hammer
                followersToBan.map(x => autoBanBotChatClient.ban(x, chan));
                // Setup listener to watch for bot follows
                autoBanBotEventSubListener.watchFollowEventsByUser(chan);
            });
        })
        .catch((chatSetupError) => console.error({ chatSetupError }));
}

main();