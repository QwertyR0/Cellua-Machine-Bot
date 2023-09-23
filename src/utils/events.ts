import type { ClientEvents, Awaitable }  from "discord.js"
import fs from "fs"
import path from "path"
import { ModifiedClient } from "../main.js";

const eventsDir = path.resolve("./dist/events");

export interface BotEvent <T extends keyof ClientEvents = keyof ClientEvents>{
    name?: T
    run: (client: ModifiedClient, ...args: ClientEvents[T]) => Awaitable<void>
}

export async function configureEvents<T extends keyof ClientEvents = keyof ClientEvents>(client: ModifiedClient): Promise<void>{
    const eventFiles = fs.readdirSync(eventsDir);
    const events: BotEvent[] = [];

    for (const file of eventFiles) {
      if (file.endsWith(".js")) {
        const event = await import("file://" + path.join(eventsDir, file)).then((module) => {
            const event: BotEvent = module.default as BotEvent;
            event.name = file.replace(".js", "") as T
            return event;
        }).catch((error) => {
            console.error("Error importing event:", error);
        }) as BotEvent;
        
        events.push(event);
      }
    }

    RegisterEvents(client, events);
}

function RegisterEvents<T extends keyof ClientEvents>(client: ModifiedClient, Events: BotEvent<T>[]): void {
    for(const event of Events){
        client.on(event.name as T,  (...args: ClientEvents[T]) => {
            try {
                event.run(client, ...args);
            } catch(err) {
                console.error(err);
            }
        });
    }
}