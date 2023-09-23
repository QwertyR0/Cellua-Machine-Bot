import { SlashCommandBuilder } from "discord.js";
import { BotCommand } from "../utils/commands.js";
import { badges, scoreBoard, viewBadges } from "../utils/levelling.js";

const command: BotCommand = {
    name: "badge",
    description: "Check your badges!",
    ownerOnly: false,
    costumCommand: () => {
        const command = new SlashCommandBuilder()
        .addSubcommand(subcommand =>
            subcommand
                .setName('display')
                .setDescription('Select a badge of yours to display!')
                .addIntegerOption(option =>
                    option
                        .setName('selected')
                        .setDescription('The badge\'s row number')
                        .setRequired(true))
                )
                .addSubcommand(subCommand => subCommand.setName("list").setDescription("View Your Badges!"));
        return command as SlashCommandBuilder;
    },

    run: async(client, interaction): Promise<void> => {
        const sub = interaction.options.getSubcommand();
        
        if (sub === "list"){
            await viewBadges(client, interaction);
        } else if (sub === "display"){
            await interaction.deferReply();
            const bindex = interaction.options.getInteger("selected");

            if (typeof bindex !== "number") {
                await interaction.editReply({
                   content: "Please pass a row number for the badge to feature" 
                });

                return;
            }

            const levelData: scoreBoard[] = await client.db?.getData("/levelData/");
            const userBoard: scoreBoard | undefined = levelData.find(elem => elem.id === interaction.user.id);

            if(userBoard && userBoard.badges && userBoard.badges.length >= 1){
                if ((bindex > userBoard.badges.length || bindex < 1)){
                    if (bindex === 0){
                        await interaction.editReply("No badge is now being featured.");
                    } else {
                        await interaction.editReply("Please stay in range of your badge's rows");
                        return;
                    }
                }

                let newBoard: scoreBoard = {
                    id: userBoard.id,
                    score: userBoard.score,
                    cooldown: userBoard.cooldown,
                    level: userBoard.level,
                    badges: userBoard.badges,
                    selBadge: bindex
                }

                let newData = levelData;
                const index = newData.indexOf(userBoard);
                if (index > -1){
                    newData.splice(index, 1);
                }
                
                newData.push(newBoard);
                await client.db?.push("/levelData", newData, true);

                if(bindex !== 0) await interaction.editReply(`You're now displaying ${badges[newBoard.badges[newBoard.selBadge - 1]].emoji} on your profile\n as a featured badge!`);
                return;
            } else {
                await interaction.editReply("You have no badges to dipslay!");
                return;
            }
        }
    }
}

export default command;