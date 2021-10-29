# schulserver-abizeitung-bot

a simple Discord bot to send formatted embedded messages via application commands

> you may want to change the embed in [index.js](./index.js#65)

## requirements

- nodejs
- cloudflare workers (wrangler)

## setup

- `PUT` the [commands](./commands.json) to `https://discord.com/api/v9/applications/{your-application-id}/commands`
- run `npm i && npm run build`, then `wrangler publish`
- register your cloudflare worker as the http endpoint [in the bot developer portal](https://discord.dev/applications)
- add the bot to your server and you're good to go
