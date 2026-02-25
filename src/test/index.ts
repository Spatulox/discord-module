import {Client, Events, GatewayIntentBits} from "discord.js";
import dotenv from "dotenv"
dotenv.config();
import { ModuleManager } from "../index";
import { AutoModule } from "./AutoModule";
import {MusicMultiModule} from "./Music/MusicMultiModule";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
});

client.on(Events.InteractionCreate, async (interaction) => {
    if(interaction.isButton()){
        console.log(interaction.customId)
    }
})

client.once(Events.ClientReady, () => {
    const manager = ModuleManager.createInstance(client);
    manager.register(new MusicMultiModule())
    manager.register(new AutoModule());
    manager.register(new PongModule());
    manager.enableAll();
    manager.sendUIToChannel("1162047096220827831")

    console.log("Bot ready!")
});
client.login(process.env.DISCORD_BOT_TOKEN);