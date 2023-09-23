import { BotEvent } from "../utils/events.js";
import { giveBadge } from "../utils/levelling.js";

const event: BotEvent<"messageReactionAdd"> = {
    run: async(client, reaction, user) => {
        if (reaction.emoji.name === "enemy_nerd"){
            if(reaction.partial){
                reaction = await reaction.fetch();
            }

            if(reaction.count === 7 && reaction.message.author && !reaction.message.author.bot){
                await giveBadge(client, reaction.message.author.id, "nerd", true);
            }
        }
    }
}

export default event;