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
3. Run `npm start`.

## TODO

- [] Better documentation
- [] Maybe use other chat client. This one works only some of the time.

## Further Reading

- https://github.com/tmijs/docs/blob/gh-pages/_posts/v1.4.2/2019-03-03-Events.md
- https://dev.twitch.tv/docs/irc/
- https://twurple.js.org/docs/getting-data/eventsub/listener-setup.html
- https://dashboard.ngrok.com/get-started/setup
- https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types#channelfollow
