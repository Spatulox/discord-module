import {Client, Events, GatewayIntentBits} from "discord.js";
import dotenv from "dotenv"
import {ModuleManager} from "../index";
import {MusicMultiModule} from "./Music/MusicMultiModule";
import {PongModule} from "./PongModule";
import {InteractionsManager, InteractionType} from "../code/InteractionsManager";

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
});

client.once(Events.ClientReady, () => {
    const manager = ModuleManager.createInstance(client);
    const interactionManager = InteractionsManager.createInstance(client);
    manager.register(new MusicMultiModule())
    manager.register(new PongModule());
    manager.enableAll();
    manager.sendUIToChannel("1162047096220827831")

    interactionManager.registerSlash("ping", PongModule.ping_interaction)
    interactionManager.register(InteractionType.SLASH, {name:"test", func: PongModule.ping_interaction}) // This is the same thing, registerSlash is just a wrapper to avoid mistakes

    console.log("Bot ready!")
});
client.login(process.env.DISCORD_BOT_TOKEN);