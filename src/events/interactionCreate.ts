import { BotEvent } from "../utils/events.js";
import { commandRequest } from "../utils/commands.js";

const event: BotEvent<"interactionCreate"> = {
    run: async (client, interaction) => {
        await commandRequest(client, interaction);
    }
}

export default event;