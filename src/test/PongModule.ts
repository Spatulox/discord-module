import {Events, Message} from "discord.js";
import {Module, ModuleEventsMap} from "../index";

export class PongModule extends Module {
    public name: string = "Pong Module";
    public description: string = "Reply with pong";
    public get events(): ModuleEventsMap {
        return {
            [Events.MessageCreate]: this.handleMessage,
            [Events.MessageUpdate]: [this.handleMessageUpdate1, this.handleMessageUpdate2],
        }
    }

    async handleMessage(message: Message) {
        if(message.content == "!ping") {
            message.reply("Pong !")
        }
    }

    async handleMessageUpdate1(message: Message) {
        message.reply("Update 1 !")
    }

    async handleMessageUpdate2(message: Message) {
        message.reply("Update 2 !")
    }

}