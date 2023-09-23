import { BotCommand } from "../utils/commands.js";

const command: BotCommand = {
    name: "set",
    description: "Edit Settings of the bot",
    ownerOnly: true,
    // costumCommand(client) {
    //     let slashCommand = new SlashCommandBuilder()

    //     return slashCommand;
    // },

    run: async(_, interaction): Promise<void> => {
        interaction.reply({content: "pong", ephemeral: true});
    }
}

export default command;