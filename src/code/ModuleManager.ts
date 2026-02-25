import {
    Client,
    ContainerBuilder,
    MessageFlags,
    TextDisplayBuilder
} from "discord.js";
import {Module} from './Module';

export class ModuleManager {
    private _modules: Module[] = [];

    constructor(private client: Client) {}

    get modules(): Module[] { return this._modules; }

    register(module: Module) {
        this._modules.push(module);
        this.bindEvents(module);
    }

    private createManagerUI(): ContainerBuilder {
        const container = new ContainerBuilder()
        container
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# Module Manager`))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`You can enable/disable any module`))

        for (const module of this._modules) {
            container.addSectionComponents(module.createModuleUI())
        }

        return container;
    }

    private bindEvents(module: Module) {
        const eventsMap = module.events;

        for (const [eventName, method] of Object.entries(eventsMap)) {
            if (typeof method !== 'function') continue;
            // ✅ Automatic Binding
            this.client.on(eventName, async (...args: any[]) => {
                if (module.enabled) {
                    await method(...args);
                }
            });
        }
    }

    enableAll() {
        this._modules.forEach(mod => mod.enable());
    }

    disableAll() {
        this._modules.forEach(mod => mod.disable());
    }

    getModule(name: string) {
        return this._modules.find(m => m.name === name);
    }

    async sendUIToChannel(channelID: string){
        const channel = this.client.channels.cache.get(channelID) || await this.client.channels.fetch(channelID)
        if(!channel){
            throw new Error(`Channel (${channelID}) does not exist or is unavailable`);
        }
        if(channel.isTextBased() && channel.isSendable()){
            channel.send({
                components: [this.createManagerUI()],
                flags: MessageFlags.IsComponentsV2
            })
            return
        }
        throw new Error(`Channel (${channelID}) does not exist or is not a valid sendable channel`);
    }
}