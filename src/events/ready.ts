import { ActivityType } from "discord.js";
import { BotEvent } from "../utils/events.js";
import { LevelDraw } from "../utils/levelling.js";
import { autoSave } from "../utils/save.js";

const event: BotEvent<"ready"> = {
    run: async(client) => {
        await LevelDraw.setup();

        client.user?.setPresence({ 
            activities: [{ 
                name: 'Scattered Cells', 
                type: ActivityType.Listening, 
            }],
            status: 'online' 
        });

        console.log("ready!!!");

        await autoSave(client);
        console.log("autoSave system started at " + new Date().toISOString().replace(/T/, ' '). replace(/\..+/, ''));  
    }
}

export default event;