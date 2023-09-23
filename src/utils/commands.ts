import { type Awaitable, SlashCommandBuilder, Collection, REST, Routes, ChatInputCommandInteraction, Interaction, SlashCommandUserOption } from "discord.js";
import fs from "fs";
import path from "path";
import { ModifiedClient } from "../main.js";

export interface BotCommand {
    name: string,
    description?: string,
    ownerOnly?: boolean,
    costumCommand?: (client: ModifiedClient) => Awaitable<SlashCommandBuilder>,
    options?: any[],
    run: (client: ModifiedClient, integration: ChatInputCommandInteraction) => Awaitable<void>
}

const owners: string[] = [
    "307553207067082752",
    "534806202698432514",
    "423870663942602764",
    "583841478695059488",
    "877279253987754024",
    "547381459631996938"
];

export async function registerCommands(client: ModifiedClient){
    client.scommands = new Collection();
    client.commands = new Collection();

    const commandsDir = path.resolve("./dist/commands");
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
    	const filePath = path.join(commandsDir, file);
    	const command: BotCommand = await import("file://" + filePath).then((module) => {
            return module.default;
        });

        try{
            let sCommand = new SlashCommandBuilder()

            if (command.costumCommand){
                sCommand = await command.costumCommand(client)
            }
            
            sCommand
                .setName(command.name)
                .setDescription(typeof command.description === "string" ? command.description : "");
    		client.scommands.set(command.name, sCommand);
    		client.commands.set(command.name, command);
        } catch(err) {
            console.log(err);
        }
    }

    
    try {
        const rest = new REST({ version: "10" }).setToken(process.env.DEVMODE === "t" ? process.env.DEVTOKEN as string : process.env.TOKEN as string);
        (await client.guilds.fetch()).forEach(async(server) => {
            await rest.put(
                Routes.applicationGuildCommands(process.env.DEVMODE === "t" ? process.env.DEVID as string : process.env.ID as string, server.id),
                { body: client.scommands },
            );
        });
    } catch (error) {
    	console.error(error);
    }
}

export async function commandRequest(client: ModifiedClient, interaction: ChatInputCommandInteraction | Interaction){
    if (interaction.isChatInputCommand()) {
        const command = client.commands?.find((command) => command.name === interaction.commandName) as BotCommand;
        try {
            if (command.ownerOnly && !owners.includes(interaction.user.id)) return await accessDenied(interaction); else {
                await command.run(client, interaction);
            };
        } catch(err) {
            console.error(err);
        }
    }
}

async function accessDenied(interaction: ChatInputCommandInteraction){
    await interaction.reply(`Only Admins Can Use */${interaction.commandName}*`);
}