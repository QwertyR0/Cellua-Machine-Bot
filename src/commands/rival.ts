import { EmbedBuilder, GuildMember, SlashCommandBuilder } from "discord.js";
import { BotCommand } from "../utils/commands.js";
import { calcTotalExp, levels, roundToSmallestKey, scoreBoard } from "../utils/levelling.js";

const command: BotCommand = {
    name: "rival",
    description: "Find You Biggest Enemy!",
    ownerOnly: false,
    costumCommand: () => {
        const command = new SlashCommandBuilder()
            .addUserOption(option =>
		    	option
		    		.setName("member")
		    		.setDescription("The member to check their rival")
		    		.setRequired(false));
        return command as SlashCommandBuilder;
    },

    run: async(client, interaction): Promise<void> => {
        try{
            await interaction.deferReply();
            const memberOption = interaction.options.getMember("member") as GuildMember;
            
            if(memberOption && memberOption.user.bot) {
                await interaction.editReply({
                    content: "Really?",
                });
    
                return;
            }

            //FIXME: VERY IMPORTANT:
            //FIXME: whenever you edit getdata it edits it in the db you can do newData = levelData and it wont get changed but why
            //FIXME:
            const levelData: scoreBoard[] = await client.db?.getData("/levelData/"); // whenever you edit getdata it edits it in the db
            const userBoard: scoreBoard | undefined = levelData.find(elem => elem.id === (memberOption ? memberOption.id : interaction.user.id));
            let borekData = levelData; // READ ABOVE
            if (!userBoard) {
                await interaction.editReply(memberOption ? `no entry of ${memberOption.nickname ?? memberOption.displayName} found in the database` : "bro you literally have no entry on the database");
                return;
            }

            // FIXME: code below makes th error
            const index = borekData.indexOf(userBoard);
            if (index > -1){
                borekData.splice(index, 1);
            }

            let closestBoard: scoreBoard = {
                id: "",
                badges: [],
                score: 999999999999999,
                level: 30,
                selBadge: 0,
                cooldown: 12830812634891
            };

            const totalUser = calcTotalExp(userBoard.level, userBoard.score);
            borekData.forEach(async(sBoard) => {
                const totalS = calcTotalExp(sBoard.level, sBoard.score);
                const totalC = calcTotalExp(closestBoard.level, closestBoard.score);
                if (totalS < totalC && totalS > totalUser){
                    closestBoard = sBoard;
                }
            });

            if(closestBoard.id === ""){
                await interaction.editReply(memberOption ? `${memberOption.nickname ?? memberOption.displayName} has no enemies! <:enemy_levelgrinder:1142310460599840799>` : "You have no enemies! <:enemy_levelgrinder:1142310460599840799>");
                return;
            }

            const closestUser = await client.users.fetch(closestBoard.id);
            const statColor = userBoard.level >= 5 ? 
                    levels[roundToSmallestKey(closestBoard.level) as keyof typeof levels].color
                    : "#E67E22"
            const rivalEmbed = new EmbedBuilder()
                .setTitle( `<:diffC_extremesuper:1042923073755680769> ${memberOption ? `${memberOption.nickname ?? memberOption.displayName}'s` : "Your"} Rival Is: ${closestUser.displayName}`)
                .setColor(statColor)
                .setThumbnail(closestUser.displayAvatarURL())
                .setFooter({text: "G R I N D"})
                .setDescription(`**${closestUser.displayName}** is **${calcTotalExp(closestBoard.level, closestBoard.score) - totalUser}** scores ahead of ${memberOption ? `${memberOption.nickname ?? memberOption.displayName}` : "You"}`);

            await interaction.editReply({
                embeds: [ rivalEmbed ]
            });

            client.db?.reload();
        } catch(err){
            console.error(err);
        }
    }
}

export default command;