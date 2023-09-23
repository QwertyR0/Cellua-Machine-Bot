// This code is licensed under the GNU General Public License v3.0.
// See "LICENSE" for more details.
// All of the credits for Cellua Machine goes to KyYay and its contributors. 

import 'dotenv/config'
import { Client, Collection, SlashCommandBuilder } from "discord.js";
import { configureEvents } from "./utils/events.js";
import Discord from "discord.js";
import { BotCommand, registerCommands } from './utils/commands.js';
import { JsonDB, Config } from 'node-json-db';

export interface ModifiedClient extends Client {
    scommands?: Collection<string, SlashCommandBuilder>,
    commands?: Collection<string, BotCommand>,
    db?: JsonDB,
    dbConfig?: Config,
}

const client: ModifiedClient = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.MessageContent, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.GuildMessageReactions, Discord.GatewayIntentBits.DirectMessages, Discord.GatewayIntentBits.DirectMessageTyping], partials: [Discord.Partials.Reaction, Discord.Partials.User, Discord.Partials.Message, Discord.Partials.Channel]});
client.dbConfig = new Config("db", true, false, '/', true);
client.db = new JsonDB(client.dbConfig);

await configureEvents(client);

if(process.env.DEVMODE === "t"){
    client.login(process.env.DEVTOKEN);
} else {
    client.login(process.env.TOKEN);
}

await registerCommands(client);