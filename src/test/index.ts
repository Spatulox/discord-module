import {Client, Events, GatewayIntentBits} from "discord.js";
import dotenv from "dotenv"
dotenv.config();
import {Module, ModuleManager, MultiModule} from "../index";
import { AutoModule } from "./AutoModule";
import {MusicMultiModule} from "./Music/MusicMultiModule";
import {PongModule} from "./PongModule";

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
        const custID = interaction.customId
        if(custID.startsWith("toggle_")){
            console.log(interaction.customId)
            const manager = ModuleManager.getInstance()
            const module = manager?.getModule(custID.split("toggle_")[1]!)
            console.log(module)

            if(module instanceof MultiModule){
                interaction.reply(module.showModule()) // This show all the modules inside the MultiModule.
            } else if (module instanceof Module){
                module.enabled ? module.disable() : module.enable()
                // Faut pouvoir update l'interaction d'où vient le truc, mais faut réussi à récupérer le message d'ou vient l'interaction / le niveau de modules
                // If we use the module.showModule(), this will only show the actual module, which is completely useless
            }
        }
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