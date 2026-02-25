import {Module} from "../index";
import {Events, Guild, Interaction} from "discord.js";

export class AutoModule extends Module {
    name = "AutoMapped";
    description = "100% auto-mappé";

    public get events() {
        return {
            [Events.InteractionCreate]: this.handleInteraction,
            [Events.GuildCreate]: this.onGuildJoin
        };
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
