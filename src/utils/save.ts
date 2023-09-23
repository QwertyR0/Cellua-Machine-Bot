import fs from "fs";
import path from "path";
import { ModifiedClient } from "../main.js";
import { EmbedBuilder, GuildTextBasedChannel } from "discord.js";
const saveList = fs.readdirSync(path.resolve("./backup/"));
let latest: number = 0;

if(saveList.length >= 1){
    for (const save of saveList){
        const num = parseInt((save.replace(".json", "")).slice(4));
        if(num > latest) latest = num;
    }
}

export async function autoSave(client: ModifiedClient){
    const channel = process.env.DEVMODE === "t" ? await client.channels.fetch("1139871597512097923") as GuildTextBasedChannel : await client.channels.fetch("974022983372898314") as GuildTextBasedChannel;

    setInterval(async () => {
        try{
            latest++;
            fs.copyFileSync(path.resolve("./db.json"), path.resolve(`./backup/save${latest}.json`));
        } catch(err) {
            console.error("ERROR SAVING NUM %d:\n", latest, err);

            const errorEmbed = new EmbedBuilder()
                .setTitle("DATABASE AUTOSAVE MALFUNCTION")
                .setDescription(`**TYPE:** \`DUPLICATION ERROR\`,\n**SAVE ATTEMPT:** \`${latest}\``)
                .setTimestamp()
                .setColor("Red");

            channel.send({embeds: [ errorEmbed ], content: `<@307553207067082752>`});
        }
    }, 0.8 * 60 * 60 * 1000);
}