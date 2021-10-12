# Auto Ban Bot

## Requirements

- NodeJS
    - https://nodejs.org/en/
    - I recommend using an LTS release using nvm or something like it
- Ngrok
    - https://ngrok.com/
    - Dashboard: https://dashboard.ngrok.com/endpoints/status

## Getting Started

1. Run `npm install`
2. Configure a `.env` file (put this in the root directory). Example in `env_example`.
    - For `OAUTH_PASSWORD`, use https://twitchapps.com/tmi/
    - For `CLIENT_ID` and `CLIENT_SECRET`, register an application at https://dev.twitch.tv/console/apps
    - For `SECRET_SECRET`, just write up a really long string. I used a GUID generator for mine.
    - For `TWITCH_USERNAME`, use your username or your bots username. This will be the same account you used to get the `OAUTH_PASSWORD`.
    - For `STREAMLABS_CLIENT_ID`, you must get that from registering an app on streamlabs
      - https://streamlabs.com/dashboard#/settings/api-settings
    - For `STREAMLABS_CLIENT_SECRET`, it will be the same as above
    - For `FASTIFY_PORT`, you can leave this as `3000` if you like. Just be sure to mark the correct port on `REDIRECT_URI` as well
    - For `REDIRECT_URI`, you can leave that as `http://localhost:3000/auth` unless you want to change the port you run the fastify server on (see `src/streamlabs/streamlabs-api-server.ts`);
3. Create an empty file `token.db` in the root of the project. This will be the sqlite db we save our streamlabs tokens too.
4. Run `npm start`.
5. To use the file logger, create a directory `twitch-bot-logs` in the `/dist` folder.

## TODO

- [ ] Figure out better way to debug with vscode
- [ ] Figure out better way to use fastify or express with typescript

## Further Reading

- https://github.com/tmijs/docs/blob/gh-pages/_posts/v1.4.2/2019-03-03-Events.md
- https://dev.twitch.tv/docs/irc/
- https://twurple.js.org/docs/getting-data/eventsub/listener-setup.html
- https://dashboard.ngrok.com/get-started/setup
- https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types#channelfollow
