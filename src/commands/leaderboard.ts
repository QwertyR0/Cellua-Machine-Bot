import { BotCommand } from "../utils/commands.js";
import { LevelDraw } from "../utils/levelling.js";

const command: BotCommand = {
    name: "leaderboard",
    description: "Top 10 cool people!",
    ownerOnly: false,

    run: async(client, interaction): Promise<void> => {
        await interaction.deferReply();
        const image = await LevelDraw.createLeaderboard(client);
        await interaction.editReply({
            files: [ image ]
        });
    }
}

export default command;