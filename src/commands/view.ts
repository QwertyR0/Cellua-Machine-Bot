import { SlashCommandBuilder } from "discord.js";
import { BotCommand } from "../utils/commands.js";
import { exec } from "child_process";

const command: BotCommand = {
    name: "view",
    description: "View a k3 level!",
    ownerOnly: true,
    costumCommand: () => {
        const command = new SlashCommandBuilder()
            .addStringOption(option =>
		    	option
		    		.setName('k3')
		    		.setDescription('The level to view')
		    		.setRequired(true));
        return command as SlashCommandBuilder;
    },

    run: async(_, interaction): Promise<void> => {
        const k3level = interaction.options.getString("k3") as string;
    }
}

export default command;