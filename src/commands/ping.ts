import { BotCommand } from "../utils/commands.js";

const command: BotCommand = {
    name: "ping",
    description: "pingpong",
    ownerOnly: true,

    run: async(_, interaction): Promise<void> => {
        interaction.reply({content: "pong", ephemeral: true});
    }
}

export default command;