import { GuildMember, SlashCommandBuilder } from "discord.js";
import { BotCommand } from "../utils/commands.js";
import { LevelDraw } from "../utils/levelling.js";

const command: BotCommand = {
    name: "level",
    description: "Check your score!",
    ownerOnly: false,
    costumCommand: () => {
        const command = new SlashCommandBuilder()
            .addUserOption(option =>
		    	option
		    		.setName('member')
		    		.setDescription('The member to check their score')
		    		.setRequired(false));
        return command as SlashCommandBuilder;
    },

    run: async(client, interaction): Promise<void> => {
        const opUser = interaction.options.getMember("member") as GuildMember;

        if(opUser && opUser.user.bot) {
            await interaction.reply({
                content: "Really?",
                ephemeral: true
            });

            return;
        }

        await interaction.deferReply()
        const image = await LevelDraw.createCoolImage(client, opUser as GuildMember ?? interaction.member as GuildMember)
        await interaction.editReply({
            files: [ image ]
        });
    }
}

export default command;