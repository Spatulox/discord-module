import {Module} from "../../index";
import {Events} from "discord.js";

export class PlayModule extends Module{
    name = "Play Module";
    description = "Play Module Description";

    public get events() {
        return {
            [Events.MessageCreate]: (() => {}),
            [Events.InteractionCreate]: (() => {}),
            [Events.GuildCreate]: (() => {})
        };
    }
}