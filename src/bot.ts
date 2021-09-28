// Make it to where we can use process.env.WHATEVER
require('dotenv').config();

import { ClientCredentialsAuthProvider } from '@twurple/auth';
import { ApiClient } from '@twurple/api';
import { NgrokAdapter } from '@twurple/eventsub-ngrok';
import fastify from 'fastify';
// import fetch from 'node-fetch';
import axios from 'axios';
import open = require('open');

import { AutoBanBotApiClient } from './api-client';
import { AutoBanBotEventSubListener } from './event-sub-listener';
import { TmiChatClient } from './tmi-chat-client';
import { shouldBanBasedOnCreationDate, shouldBanBasedOnUsername } from './banned_users';
import { Logger } from './logger';
import { StreamlabsApiServer } from './streamlabs/streamlabs-api-server';
import { StreamlabsApiClient } from './streamlabs/streamlabs-api-client';

const main = async () => {
    // Twitch app
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const secret = process.env.SECRET_SECRET;

    // Streamlabs app
    const streamlabsClientId = process.env.STREAMLABS_CLIENT_ID;
    const streamlabsClientSecret = process.env.STREAMLABS_CLIENT_SECRET;
    const redirectUri = process.env.REDIRECT_URI;

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
    const streamlabsServer = new StreamlabsApiServer({
        clientId: streamlabsClientId,
        clientSecret: streamlabsClientSecret,
        redirectUri: redirectUri,
    });
    const streamlabsClient = new StreamlabsApiClient(streamlabsServer);

    try {
        await streamlabsServer.setup();
        open('http://localhost:8080');
    } catch (err) {
        Logger.getInstance().log.error(`Couldn't setup server`, { err });
    }

    try {
        await autoBanBotChatClient.setup();

        chatChannels.forEach(c => autoBanBotChatClient.say(c, `Auto Ban Bot has connected!`));
        const eventSubListenerConfig = {
            config: {
                apiClient: new ApiClient({ authProvider }),
                adapter,
                secret
            },
            apiClient: autoBanBotApiClient,
            chatClient: autoBanBotChatClient,
            streamlabsClient: streamlabsClient,
            clientId: clientId,
            clientSecret: clientSecret,
        }
        const autoBanBotEventSubListener = new AutoBanBotEventSubListener(eventSubListenerConfig);

        await autoBanBotEventSubListener.clearAllSubscriptions();
        chatChannels.forEach(async (chan) => {
            // Get the latest followers
            const followers = await autoBanBotApiClient.getFollowersByChannelName(chan);
            // Filter them by the ones you want to ban
            const followersToBan = followers.filter(x => shouldBanBasedOnUsername(x));
            if (followersToBan.length > 0) {
                Logger.getInstance().log.info(`Need to ban ${followersToBan.join(', ')} on channel ${chan}`);
            } else {
                Logger.getInstance().log.info(`No one to ban on channel ${chan} :D`);
            }
            // Bring down the ban hammer
            followersToBan.map(x => autoBanBotChatClient.ban(x, chan));
            // Setup listener to watch for bot follows
            autoBanBotEventSubListener.watchFollowEventsByUser(chan);
        });
        Logger.getInstance().log.debug('Ready to go!');
    } catch (chatSetupError) {
        Logger.getInstance().log.error({ chatSetupError })
    }
}

main();