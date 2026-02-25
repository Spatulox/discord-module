import {Events, Message} from "discord.js";
import {Module} from "../index";
import {ModuleEventsMap} from "../code/Module";

export class PongModule extends Module {
    public name: string = "Pong Module";
    public description: string = "Reply with pong";
    public get events(): ModuleEventsMap {
        return {
            [Events.MessageCreate]: this.handleMessage
        }
    }

    async handleMessage(message: Message) {
        if(message.content == "!ping") {
            message.reply("Pong !")
        }
    }

}