# Cellua Machine Bot
A levelling bot for the Cellua Machine Discord server.  
  
All of the assets in the `src/assets/` folder are credited to their respective owners. All of the images in the `src/assets/` folder were created by **KyYay (kyyay)**.

## Dependencies:
- Typescript
- Discord.js
- Node-Canvas
- Dotenv
- node-json-db

## Important:
While contributing please use the `dev` branch. The `main` branch is for the live version of the bot.  
  
There is a setting for Developement that I put while testing the bot in the `.env` file.  
  
You can use this setting by adding `DEVMODE="t"` to the `.env` file. Setting this to `"t"` will make the bot use `DEVID` and `DEVTOKEN` instead of `ID` and `TOKEN`.  
  
The env file should contain these:
```
TOKEN=""
ID=""
```  
Fill in the `""` with your bot's token and ID.  
  
If you found any issues with the bot, please report them in the issues tab or ping me on discord. You may also contribute to the bot by making a pull request.  
  
Bot has a backup system for the database. It will backup the database every 0.8 hours. You can configure this in `src/utils/save.ts`.
Please Create a `backup` folder if it doesn't work.  
  
Bot stores its data in `db.json` file.  
  
I did not configure the bot to generate some of the options in the `db.json` file. You will have to do that yourself (You can also make a PR for this).  
  
By Default the file should contain these:
```json
{"levelData": [], "inDev": false, "moyai": [], "counting": []}
```

### Note:
This bot is not intended for use outside of the Cellua Machine Discord server. While contributing you may use the bot on another server for testing purposes, but please do not use it for your own server.

### LICENSE: GNU GPL v3