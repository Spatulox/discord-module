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
        console.log(custID)
        const manager = ModuleManager.getInstance()
        if(custID.startsWith("toggle_")){
            const module = manager?.getModule(custID.split("toggle_")[1]!)

            if(module instanceof MultiModule){
                console.log("MultiModule : ", module)
                interaction.reply(module.showModule()) // This show all the modules inside the MultiModule.
            } else if (module instanceof Module){
                console.log("Module : ", module)
                interaction.deferUpdate()
                module.toggle()
                //module.updateMultiModuleUI(interaction)
                //interaction.update({content: "coiucou"})
            }
        } else if(custID.startsWith("all_")){ // Only the "title" of an interaction of a MultiModule
            const module = manager?.getModule(custID.split("toggle_")[1]!)
            if(module instanceof MultiModule){ // Should not be a simple Module because it works like that
                module.enabled ? await module.disableAll(interaction) : await module.enableAll(interaction)
            }
            console.log(module)
        }
        manager?.updateUI() // Global message is updated click
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