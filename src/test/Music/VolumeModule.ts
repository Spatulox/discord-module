import {Module} from "../../index";
import {Events} from "discord.js";

export class VolumeModule extends Module {
    public name = "Volume Module";
    public description = "Volume Module Description";

    public get events() {
        return {
            [Events.MessageCreate]: (() => {}),
            [Events.InteractionCreate]: (() => {}),
            [Events.GuildCreate]: (() => {})
        };
    }
}