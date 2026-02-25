import {Module} from "../index";
import {Events, Guild, Interaction, Message} from "discord.js";

export class AutoModule extends Module {
    name = "AutoMapped";
    description = "100% auto-mappé";

    public get events() {
        return {
            [Events.MessageCreate]: this.handleMessage,
            [Events.InteractionCreate]: this.handleInteraction,
            [Events.GuildCreate]: this.onGuildJoin
        };
    }

    public async handleMessage(message: Message) {
        if (message.content === '!ping') {
            message.reply('Pong!');
        }
    }

    public handleInteraction(interaction: Interaction) {
        if (interaction.isChatInputCommand()) {
            interaction.reply('Hello!');
        }
    }

    public onGuildJoin(guild: Guild) {
        console.log(`Nouveau serveur: ${guild.name}`);
    }
}
