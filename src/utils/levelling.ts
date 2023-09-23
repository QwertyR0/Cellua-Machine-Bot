import { Message, Role, AttachmentBuilder, GuildMember, User, Guild, ChatInputCommandInteraction, EmbedBuilder, APIEmbedField } from "discord.js";
import { ModifiedClient } from "../main.js";
import { JsonDB, Config } from "node-json-db";
import { Image, createCanvas, loadImage, registerFont, type CanvasRenderingContext2D as CtxType} from 'canvas';
import path from "path";

const linkPattern = /https?:\/\/[^\s/$.?#].[^\s]*/gi;

export const levels = {
    5: {id: "1140164342139072639", color: "#ff9400"},
    10: {id: "1140164754590146641", color: "#ffbf00"},
    15: {id: "1140164861188390933", color: "#ffef3f"},
    20: {id: "1140164937923178627", color: "#d4ff56"},
    25: {id: "1140165033897250889", color: "#AFFF7F"}
} as const;

// TODO:
export const badges = {
    moyai: {
        name: "Moyai",
        description: "IT HAS CHOSEN YOU",
        badge: await loadImage(path.resolve("./src/assets/moyai.png")),
        emoji: "<:wall_moyai:999025195559960668>"
    },
    top: {
        name: "Lifen't",
        description: "You reached level 25 Congratulations!",
        badge: await loadImage(path.resolve("./src/assets/crown.png")),
        emoji: "<:25crown:1145799977373806693>"
    },
    cool: {
        name: "Cool Person!",
        description: "You have this and you don't know why!",
        badge: await loadImage(path.resolve("./src/assets/cool.png")),
        emoji: "<:life_trell:1037498829567709184>" 
    },
    addsup: {
        name: "How?",
        description: "All of the digits in your message adds up to 69?",
        badge: await loadImage(path.resolve("./src/assets/flushed.png")),
        emoji: "<:enemy_flushed:1037861540717674526>"
    },
    lore: {
        name: "Part of The Lore...",
        description: "Send a message to <#1035849839700869130> 15 times!",
        badge: await loadImage(path.resolve("./src/assets/lore.png")),
        emoji: "<:pin_pushpin:999375589570002997>"
    },
    nerd: {
        name: "Nerd",
        description: "What did you do to get this?",
        badge: await loadImage(path.resolve("./src/assets/nerd.png")),
        emoji: "<:enemy_nerd:998703308552290355>"
    },
    ghost: {
        name: "Ghost",
        description: "Bro touched grass",
        badge: await loadImage(path.resolve("./src/assets/ghost.png")),
        emoji: "<:ghost_2:999374878681608384>"
    },
    dmTalk: {
        name: "It's a stone Luigi",
        description: "you tried talking to the bot in DMs, it can't talk silly.",
        badge: await loadImage(path.resolve("./src/assets/haha.png")),
        emoji: "<:enemy_point_and_laugh:1038268173222428712>"
    }
} as const;

export type scoreBoard = {
    id: string,
    score: number,
    cooldown: number,
    level: number,
    badges: (keyof typeof badges)[],
    selBadge: number
}

type scoreBoardU = scoreBoard & {
    user?: {
        avatarURL: string,
        username: string
    };
}

const levelExpCalc = (level: number): number => { return Math.floor(Math.sqrt(level) * 20) * 5 }

export class LevelDraw {
    static bgImage: Image;
    static leaderboardImage: Image;

    public static async setup(){
        this.bgImage = await loadImage(path.resolve("./src/assets/levelBg.png"));
        this.leaderboardImage = await loadImage(path.resolve("./src/assets/lbBg.png"));
        registerFont(path.resolve("./src/assets/nokia.ttf"), {
            family: "Nokia",
        });
    }

    public static async doLevelling(client: ModifiedClient, message: Message): Promise<void>{
        if (!message.author.bot && (!linkPattern.test(message.content) || message.channel.id === "867031867702378506" || message.channel.id === "891736890762477608")){
            const levelData: scoreBoard[] = await client.db?.getData("/levelData/");
            const userBoard: scoreBoard | undefined = levelData.find(elem => elem.id === message.author.id);

            if(userBoard){
                let newBoard: scoreBoard = {
                    id: userBoard.id,
                    score: 0,
                    cooldown: 0,
                    level: userBoard.level,
                    badges: userBoard.badges,
                    selBadge: userBoard.selBadge
                }

                if (userBoard.cooldown + 30000 <= Date.now()){
                    newBoard.score = userBoard.score + 5;
                    let computedBoard = await this.processLevelState(newBoard, message);
                    if (userBoard.badges){
                        if(!computedBoard.badges.includes("ghost") && userBoard.cooldown + 10 * 24 * 60 * 60 * 1000 <= Date.now()){
                            message.author.send(`Congratulations 🎉, You recieved the **${badges["ghost"].name}** badge!`);
                            computedBoard.badges.push("ghost");
                        }
                    } else {
                        computedBoard.badges = [];
                    }
                    newBoard.cooldown = Date.now();
                    let newData = levelData;

                    const index = newData.indexOf(userBoard);
                    if (index > -1){
                        newData.splice(index, 1);
                    }

                    newData.push(computedBoard);
                    await client.db?.push("/levelData", newData, true);
                }
            } else {
                let newBoard: scoreBoard = {
                    id: message.author.id,
                    score: 5,
                    cooldown: Date.now(),
                    level: 0,
                    badges: [],
                    selBadge: 0
                }

                await client.db?.push("/levelData", [newBoard], false);
            }

            client.db?.reload();
        }
    }

    private static async processLevelState(newBoard: scoreBoard, message: Message): Promise<scoreBoard> {
        try {
            if(message.member){
                if (newBoard.level < 25 && newBoard.score >= levelExpCalc(newBoard.level + 1)){
                    newBoard.score = 0;

                    if (newBoard.level + 1 in levels){
                        const newRoleToAdd = levels[(newBoard.level + 1) as keyof typeof levels]
                        await message.member.roles.add(newRoleToAdd.id);

                        if (newBoard.level + 1 !== 5){
                            await message.member.roles.remove(levels[(roundToSmallestKey(newBoard.level)) as keyof typeof levels].id);
                        }
                    
                        if (newBoard.level + 1 === 25){
                            if (!newBoard.badges){
                                newBoard.badges = [];
                            }

                            newBoard.badges.push("top");
                            message.author.send(`Congratulations 🎉, You recieved the **${badges["top"].name}** badge!`);
                        }
                    }

                    newBoard.level += 1;
                    await message.react("<a:pog:1140758403589886064>");
                }
            }
        } catch(err) {
            console.error(err);
        }

        return newBoard;
    }

    public static async createCoolImage(client: ModifiedClient, member: GuildMember): Promise<AttachmentBuilder> {
        const canvas = createCanvas(350, 150);
        const ctx: CtxType = canvas.getContext('2d');
        const imageUrl = member.displayAvatarURL({ extension: "png", size: 128 }); // Set the desired image size
        const avX = canvas.width / 2;
        const avY = 60;
        const semiTextX = 69;
        const semiTextY = 68;

        try{
            const levelData: scoreBoard[] = await client.db?.getData("/levelData/");
            const userBoard: scoreBoard | undefined = levelData.find(elem => elem.id === member.id);
            const propConstant = userBoard ? 322/levelExpCalc(userBoard?.level + 1) : 322/levelExpCalc(1);

            const avatarImage = await loadImage(imageUrl);
            const statColor = userBoard && typeof userBoard.level === "number" && userBoard.level >= 5 ? 
                levels[roundToSmallestKey(userBoard.level) as keyof typeof levels].color
                : "#E67E22"

            ctx.drawImage(this.bgImage, 0, 0);

            ctx.save();
            ctx.beginPath();
            ctx.arc(avX, avY, 40, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            ctx.drawImage(avatarImage, avX-40, avY-40, 80, 80);
            ctx.restore();

            ctx.font = '16px Nokia';
            ctx.fillStyle = statColor;
            ctx.textAlign = "center";
            ctx.fillText(`Level`, semiTextX, semiTextY);

            ctx.font = '24px Nokia';
            if(userBoard){
                ctx.fillText(`${userBoard?.level}`, semiTextX, semiTextY + 27);
            }  else {
                ctx.fillText(`0`, semiTextX, semiTextY + 27);
            }

            ctx.font = '16px Nokia';
            ctx.fillText(`Experience`, canvas.width - semiTextX, semiTextY);

            if(userBoard){
                if(userBoard.level === 25){
                    ctx.fillText(`${userBoard?.score}`, canvas.width - semiTextX, semiTextY + 27);
                } else {
                    ctx.fillText(`${userBoard?.score}/${levelExpCalc(userBoard?.level+1)}`, canvas.width - semiTextX, semiTextY + 27);
                }
            }  else {
                ctx.fillText(`0/${levelExpCalc(1)}`, canvas.width - semiTextX, semiTextY + 27);
            }

            drawGoodText(`${member.nickname ?? member.user.displayName}`, 350/2, 114, 320, statColor, ctx);

            ctx.lineWidth = 1;

            ctx.strokeStyle = statColor;
            ctx.beginPath();
            ctx.translate(0.50,0.50)
            ctx.rect(12, 131, 325, 7);
            ctx.stroke();
            ctx.translate(-0.50,-0.50)

            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.fillRect(13, 132, 324, 6);

            if (userBoard && userBoard.level !== 25){
                ctx.fillStyle = statColor;
                ctx.beginPath();
                ctx.fillRect(14, 133, Math.floor(propConstant * userBoard?.score), 4);
            } else if (userBoard && userBoard.level === 25){
                ctx.fillStyle = statColor;
                ctx.beginPath();
                ctx.fillRect(14, 133, Math.floor(propConstant * levelExpCalc(userBoard?.level + 1)), 4);
            }

            if(userBoard && userBoard.badges && typeof userBoard.selBadge === "number" && userBoard.selBadge !== 0){
                ctx.drawImage(badges[userBoard.badges[userBoard.selBadge-1]].badge, semiTextX-25/2, semiTextY-44, 25, 25);
            }

            return new AttachmentBuilder(canvas.toBuffer());
        } catch (error) {
            console.error('Error creating cool image:', error);
            throw error;
        }
    }

    public static async createLeaderboard(client: ModifiedClient): Promise<AttachmentBuilder>{
        const canvas = createCanvas(350, 588);
        const ctx: CtxType = canvas.getContext('2d');
        let leaders: scoreBoardU[] = [];
        const levelData: scoreBoard[] = await client.db?.getData("/levelData/");
        const nameX = 102;
        const nameY = 32;
        
        levelData.sort((a, b) => {
            if (a.level !== b.level) {
                return b.level - a.level;
            } else {
                return b.score - a.score;
            }
        });
        
        leaders = levelData.slice(0, 10);
        
        leaders.forEach(async (elem, ind) => {
            const user = await client.users.fetch(elem.id);
            elem.user = {
                avatarURL: user.displayAvatarURL({size: 32, extension: "png"}),
                username: user.displayName
            }

            leaders[ind] = elem;
        });

        try {
            ctx.drawImage(this.leaderboardImage, 0, 0);

            for (const [ind, elem] of leaders.entries()) {
                const avatarImage = await loadImage(elem.user?.avatarURL ?? "https://i0.wp.com/theperfectroundgolf.com/wp-content/uploads/2022/04/placeholder-6.png?w=1200&ssl=1");
                const statColor = elem && typeof elem.level === "number" && elem.level >= 5 ? 
                levels[roundToSmallestKey(elem.level) as keyof typeof levels].color
                : "#E67E22"

                ctx.save();
                ctx.beginPath();
                ctx.arc(72, 33 + 58 * ind, 20, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.clip();

                ctx.drawImage(avatarImage, (72-20), (33-20) + 58 * ind, 40, 40);
                ctx.restore();

                ctx.font = '16px Nokia';
                ctx.fillStyle = statColor;
                ctx.textAlign = "left";
                // `${elem.user?.username}`
                ctx.fillText(truncateText(`${elem.user?.username}`, 238 , ctx), nameX, nameY + 58 * ind)
                
                ctx.font = '8px Nokia';
                ctx.fillText(`Level: ${elem.level}, Total Experience: ${calcTotalExp(elem.level, elem.score)}`, nameX, nameY + 16 + 58 * ind);
            
                if(elem.badges && typeof elem.selBadge === "number" && elem.selBadge !== 0){
                    ctx.drawImage(badges[elem.badges[elem.selBadge-1]].badge, this.leaderboardImage.width - 46, nameY - 12 + 58 * ind, 25, 25);
                }
            };


        } catch(err) {
            console.error(err);
        }

        return new AttachmentBuilder(canvas.toBuffer());
    }
}

export async function viewBadges(client: ModifiedClient, interaction: ChatInputCommandInteraction){
    try{
        await interaction.deferReply();

        // TODO: optional member option
        const levelData: scoreBoard[] = await client.db?.getData("/levelData/");
        const userBoard: scoreBoard | undefined = levelData.find(elem => elem.id === interaction.user.id);
        
        if(userBoard && userBoard.badges && userBoard.badges.length >= 1){
            const statColor = userBoard.level >= 5 ? 
                    levels[roundToSmallestKey(userBoard.level) as keyof typeof levels].color
                    : "#E67E22"
            
            let badgeFields: APIEmbedField[] = [];
            userBoard.badges.forEach((badge: keyof typeof badges, index) => {
                badgeFields.push({
                    name: `${index + 1}. ${badges[badge].name}${` ${badges[badge].emoji}` ?? ""}`,
                    value: userBoard.selBadge - 1 == index ? `${badges[badge].description}\n**This is your featured badge**` : `${badges[badge].description}`,
                    inline: false
                });
            });

            const badgesEmbed = new EmbedBuilder()
                .setTitle(`${interaction.user.displayName}'s Badges`)
                .addFields(badgeFields)
                .setFooter({
                    text: "use \"/badge display [row number]\" to set your featured badge"
                })
                .setColor(statColor)
                .setThumbnail(interaction.user.avatarURL());
                
            await interaction.editReply({
                embeds: [badgesEmbed]
            });
        } else {
            const chance = Math.floor(Math.random() * 20) + 1;

            if(chance === 4){
                return interaction.editReply({
                    content: "Go get some badges you don't have any <:enemy_joy:1037858339956203591>."
                });
            } else {
                return interaction.editReply({
                    content: "You have no badges 😥."
                });
            }
        }
    } catch(err) {
        console.log(err);
    }
}

export function calcTotalExp(level: number, score: number): number{
    let total: number = score;

    for (let i = level; i > 0; i--){
        total += levelExpCalc(i);
    }

    return total;
}

function adjustFontSizeToFit(text: string, maxWidth: number, ctx: CtxType, fontSize: number) {
    ctx.font = fontSize + "px " + "Nokia";

    while (ctx.measureText(text).width > maxWidth) {
        fontSize -= 4;
        ctx.font = fontSize + "px " + "Nokia";
    }

    return fontSize;
}

function drawGoodText(text: string, x: number, y: number, maxWidth: number, color: CanvasGradient | string, ctx: CtxType, fs?: number, a?: boolean) {
    fs = fs ?? 16
    const fontSize = adjustFontSizeToFit(text, maxWidth, ctx, fs);
    const widhtT = ctx.measureText(text).width;

    ctx.font = fontSize + "px " + "Nokia";
    ctx.fillStyle = color;
    ctx.fillText(
        text,
        x,
        (a ? y : y + fontSize / 2)
    );

    return widhtT;
}

function truncateText(text: string, maxWidth: number, ctx: CtxType) {
    var ellipsis = "...";
    
    // Calculate the maximum number of characters allowed
    var maxCharacters = Math.floor((maxWidth - ctx.measureText(ellipsis).width) / ctx.measureText("A").width);

    // If the text is longer than the maximum allowed characters, truncate it
    if (text.length > maxCharacters) {
        text = text.slice(0, maxCharacters - ellipsis.length) + ellipsis;
    }

    return text;
}

export function roundToSmallestKey(level: number): number | undefined {
    const sortedKeys = Object.keys(levels).map(Number).sort((a, b) => a - b);
    
    let roundedKey: number | undefined = undefined;
    
    for (const key of sortedKeys) {
        if (level >= key) {
            roundedKey = key;
        } else {
            break;
        }
    }
    
    return roundedKey;
}

// USE THIS FUNCTION FOR SMALL SCALES
export async function giveBadge(client: ModifiedClient, id: string, badge: keyof typeof badges, sendDM: boolean = false): Promise<void | boolean>{
    try{
        const levelData: scoreBoard[] = await client.db?.getData("/levelData/");
        const userBoard: scoreBoard | undefined = levelData.find(elem => elem.id === id);

        if(userBoard){
            let newBoard = userBoard;
            let newData = levelData;

            if(!userBoard.badges){
                newBoard.badges = [];
            }

            if(!newBoard.badges.includes(badge)){
                newBoard.badges.push(badge);

                const index = newData.indexOf(userBoard);
                if (index > -1){
                    newData.splice(index, 1);
                }

                newData.push(newBoard);
                await client.db?.push("/levelData", newData, true);

                if(sendDM){
                    const user = await client.users.fetch(id);
                    user.send(`Congratulations 🎉, You recieved the **${badges[badge].name}** badge!`);
                }
                return true;
            } else {
                return false;
            }
        } else {
            let newBoard: scoreBoard = {
                id: id,
                score: 5,
                cooldown: Date.now(),
                level: 0,
                badges: [badge],
                selBadge: 0
            }

            await client.db?.push("/levelData", [newBoard], false);
            if(sendDM){
                const user = await client.users.fetch(id);
                user.send(`Congratulations 🎉, You recieved the **${badges[badge].name}** badge!`);
            }
            return true;
        }
    } catch(err){
        console.log(err);
        return false;
    }
}