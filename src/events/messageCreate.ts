import { BotEvent } from "../utils/events.js";
import { LevelDraw, giveBadge } from "../utils/levelling.js";

const linkPattern = /https?:\/\/[^\s/$.?#].[^\s]*/gi;

type countingBoard = {
    id: string,
    amount: boolean | number
}

const event: BotEvent<"messageCreate"> = {
    run: async(client, message): Promise<void> => {
        if(!message.channel.isDMBased()){
            await LevelDraw.doLevelling(client, message);
            const wallMo = Math.floor(Math.random() * (5000 - 1)) + 1;

            if(message.member && wallMo === 2 && !message.member.user.bot){
                const moyais: string[] = await client.db?.getData("/moyai/");
                if(!moyais.includes(message.member.id)){
                    await message.react("<a:wall_moyai:999025195559960668>");
                    await client.db?.push("/moyai", [message.member.id]);
                    await giveBadge(client, message.author.id, "moyai", true);
                }
            }

            if (!message.author.bot &&
                !linkPattern.test(message.content) &&
                !message.content.includes("1038268173222428712") &&
                numbersAddUp(message.content, 69) &&
                !(message.content.includes("<@") && message.content.includes(">"))
            ){
                await giveBadge(client, message.author.id, "addsup", true);
            }

            if(!message.author.bot && (message.channel.id === "1139871597512097923" || message.channel.id === "1035849839700869130")){
                const countingData: countingBoard[] = await client.db?.getData("/counting/");
                const userBoard: countingBoard | undefined = countingData.find(elem => elem.id === message.author.id);

                if(userBoard){
                    if(typeof userBoard.amount !== "number") return;
                    let newBoard = userBoard;
                    let newData = countingData;

                    newBoard.amount = userBoard.amount + 1; // Typescript shit
                    if(newBoard.amount === 15){
                        userBoard.amount = true;
                        await giveBadge(client, message.author.id, "lore", true);
                    }

                    const index = newData.indexOf(userBoard);
                    if (index > -1){
                        newData.splice(index, 1);
                    }

                    newData.push(newBoard);
                    await client.db?.push("/counting", newData, true);
                } else {
                    const newBoard: countingBoard = {
                        id: message.author.id,
                        amount: 1,
                    }

                    await client.db?.push("/counting", [newBoard], false);
                }
            }
        } else if (!message.author.bot){
            if(await giveBadge(client, message.author.id, "dmTalk", false)){
                await message.author.send("This made you earn a badge....");
            }
        }
    }
}

function numbersAddUp(inputString: string, toSum: number): boolean {
    let sum: number = 0;

    for(let i = 0; i < inputString.length; i++){
        if(isNumber(inputString[i])){
            sum += parseInt(inputString[i]);
        }
    }

    return sum === toSum;
}  

function isNumber(value: string): boolean {
    const conv = +value;

    if (conv) {
        return true;
    } else {
        return false;
    }
}

export default event;