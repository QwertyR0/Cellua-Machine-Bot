import { BotCommand } from "../utils/commands.js";

const command: BotCommand = {
    name: "devmode",
    description: "nononononoo",
    ownerOnly: true,

    run: async(client, interaction): Promise<void> => {
        const togVal:boolean = await client.db?.getData("/inDev/");
        await client.db?.push("/inDev", !togVal, true);

        interaction.reply(`Development Mode is now \`${!togVal}\`.`);
    }
}

export default command;