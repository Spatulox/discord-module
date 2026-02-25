import {Client, Events, GatewayIntentBits} from "discord.js";
import dotenv from "dotenv"
dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
});

import { ModuleManager } from "../index";
import { AutoModule } from "./AutoModule";

client.once(Events.ClientReady, () => {
    const manager = new ModuleManager(client);
    manager.register(new AutoModule());
    manager.enableAll();

    console.log("Bot ready!")
});
client.login(process.env.DISCORD_BOT_TOKEN);